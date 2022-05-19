import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, CircularProgress, Grid, Link, Modal, Paper, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { addExampleDocsToRequest, AnnotationJudgement, CandidateDoc, candidateDocToExampleDoc, createRequest, ExampleDoc, getCandidateDocsForRequest, getRequestByReqNum, getSentencesForAnnotation, postSentencesForAnnotation, Sentences, SentencesAnnotation, Task, updateRequest } from '@services/task-service';
import React from 'react';
import { submitSubmission } from '@services/submission-service';
import { CandidateDocCard } from '@components/candidate-doc-card/CandidateDocCard';
import { SentenceRow } from '@components/formDialog/SentenceRow';

import './RequestWizard.css';
import { useNavigate } from 'react-router-dom';

export interface RequestWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: () => void;
    task: Task;
    requestNum?: string;
};

const steps = ['Describe the Request', 'Select Example Docs', 'Annotate Sentences'];
const MAX_EXAMPLE_DOCS = 4;

/**
 * { [docId]: { [sentenceId]: "<judgement>" } }
 */
type SentenceAnnotationMap = Record<string, Record<string, {
    sentence: string;
    judgment: AnnotationJudgement;
}>>;

interface SelectedExampleDoc {
    doc: CandidateDoc;
    highlight: string;
    docNumber: number;
};

function getSentenceAnnotationMap(annotation: SentencesAnnotation): SentenceAnnotationMap {
    const examples = annotation.request.exampleDocs;
    const docIdToSentences: Record<string, Sentences[]> = examples.reduce((prev, curr) => ({
        ...prev,
        [curr.docId]: curr.sentences
    }), {});
    const result: SentenceAnnotationMap = {};
    Object.keys(docIdToSentences).forEach(docId => {
        result[docId] = {};
        docIdToSentences[docId].forEach((sent) => {
            result[docId][sent.sentencesId] = { 
                sentence: sent.sentence,
                judgment: sent.judgement as AnnotationJudgement 
            };
        });
    });
    return result;
};

function getSentenceAnnotations(task: Task, reqNum: string, reqText: string, exampleDocs: ExampleDoc[], annotationMap: SentenceAnnotationMap): SentencesAnnotation {
    const docs = exampleDocs.map(doc => ({
        docNumber: doc.docNumber,
        docId: doc.docid,
        sentences: Object.keys(annotationMap[doc.docid]).map(sentenceId => ({
            sentencesId : sentenceId,
            sentence: '',
            judgement: annotationMap[doc.docid][sentenceId].judgment
        }))
    }));
    return {
        taskNarrative: task.taskNarr,
        taskTitle: task.taskTitle,
        taskStmt: task.taskStmt,
        taskNum: task.taskNum,
        request: {
            reqNum,
            reqText,
            exampleDocs: docs
        }
    };
};

interface SentenceRowData {
    docId: string; 
    sentenceId: string; 
    sentence: string; 
    judgment: AnnotationJudgement;
}

function getAllSentences(annotationMap: SentenceAnnotationMap): SentenceRowData[] {
    const res: SentenceRowData[] = [];
    Object.keys(annotationMap).forEach(k => {
        Object.keys(annotationMap[k]).forEach(s => {
            res.push({
                docId: k,
                sentenceId: s,
                sentence: annotationMap[k][s].sentence,
                judgment: annotationMap[k][s].judgment
            });
        });
    });
    return res;
};

function getExampleDocMap(exampleDocs: ExampleDoc[]) {
    return exampleDocs.reduce((prev, curr) => ({ 
        ...prev, [curr.docid]: {
            doc: {
                docid: curr.docid,
                docText: curr.docText,
                events: null,
                sentenceRanges: curr.sentences
            },
            highlight: curr.highlight,
            docNumber: curr.docNumber
        } 
    }), {});
}

function reorderCandidateDocs(candidateDocs: CandidateDoc[], exampleDocs: ExampleDoc[]): CandidateDoc[] {
    const exampleDocIds = new Set(exampleDocs.map(d => d.docid));
    const firstDocs = candidateDocs.filter(d => exampleDocIds.has(d.docid));
    const nextDocs = candidateDocs.filter(d => !exampleDocIds.has(d.docid));
    return [...firstDocs, ...nextDocs];
}

export const RequestWizard: React.FC<RequestWizardProps> = (props) => {
    // modal control state
    const { isOpen, onClose, onCreate, task, requestNum: requestNumProp } = props;
    const [step, setStep] = React.useState(requestNumProp ? -1 : 0);
    const [helperText, setHelperText] = React.useState<string[]>([]);
    const [isNextLoading, setIsNextLoading] = React.useState(false);
    const [isConfirmingBack, setIsConfirmingBack] = React.useState(false);
    let navigate = useNavigate();
    // step 1
    const [reqNum, setReqNum] = React.useState(requestNumProp || '');
    const [reqText, setReqText] = React.useState('');
    // step 2
    const [candidateDocs, setCandidateDocs] = React.useState<CandidateDoc[]>([]);
    const [exampleDocMap, setExampleDocMap] = React.useState<Record<string, SelectedExampleDoc>>({});
    // step 3
    const [initialAnnotatedSentences, setInitialAnnotatedSentences] = React.useState<SentenceAnnotationMap>({});
    const sentencesForAnnotation = React.useRef<SentenceAnnotationMap>({});

    React.useEffect(() => {
        const setInitialStep = async () => {
            if(requestNumProp) {
                // fetch request with id
                const request = await getRequestByReqNum(task.taskNum, requestNumProp);
                // set step to 2 if annotations are present
                try {
                    const sentences = getSentenceAnnotationMap(await getSentencesForAnnotation(task.taskNum, requestNumProp));
                    if(Object.keys(sentences).length > 0) {
                        setInitialAnnotatedSentences(sentences);
                        setStep(2);
                        sentencesForAnnotation.current = sentences;
                    } else if(request.exampleDocs?.length > 0) {
                        const docsResult = await getCandidateDocsForRequest(task.taskNum, requestNumProp);
                        const reorderedDocs = reorderCandidateDocs(docsResult.hits, request.exampleDocs);
                        setCandidateDocs(reorderedDocs.slice(0, 20));
                        setExampleDocMap(getExampleDocMap(task.taskExampleDocs));
                        setStep(1);
                    } else {
                        setReqText(request.reqText);
                        setStep(0);
                    }
                } catch(e) {
                    console.error('Annotations call failed: ', e);
                }
            }
        };
        setInitialStep();
    }, []);

    const handleNext = () => {
        setIsConfirmingBack(false);
        setIsNextLoading(true);
        if(step === 0) {
            // create new task
            // make api call
            if(reqText.length > 0){
                const payload = {
                    reqText
                };
                (reqNum ? updateRequest(task.taskNum, reqNum, payload) : createRequest(task.taskNum, payload)).then((res) => {
                    setReqNum(res.reqNum);
                    getCandidateDocsForRequest(task.taskNum, res.reqNum).then((docsResult) => {
                        setCandidateDocs(docsResult.hits.slice(0, 20));
                        setStep(1);
                        setIsNextLoading(false);
                    }).catch(e => {
                        console.error(e);
                        setIsNextLoading(false);
                        // do nothing  for now :(
                    });
                });
            } else {
                setIsNextLoading(false);
            }
        } else if(step === 1) {
            // post candidate docs
            const exampleDocs: ExampleDoc[] = Object.values(exampleDocMap).map(doc => candidateDocToExampleDoc(doc.doc, doc.docNumber, doc.highlight));
            addExampleDocsToRequest(task.taskNum, reqNum, exampleDocs).then(r => {
                getSentencesForAnnotation(task.taskNum, reqNum).then(res => {
                    setInitialAnnotatedSentences(getSentenceAnnotationMap(res));
                    sentencesForAnnotation.current = getSentenceAnnotationMap(res);
                    setStep(2);
                    setIsNextLoading(false);
                }).catch(e => {
                    setIsNextLoading(false);
                    console.error(e);
                });
            }).catch(e => {
                console.error(e);
                setIsNextLoading(false);
                // do nothing  for now :(
            });
        } else if(step === steps.length - 1) {
            // submit
            const exampleDocs: ExampleDoc[] = Object.values(exampleDocMap).map(doc => candidateDocToExampleDoc(doc.doc, doc.docNumber, doc.highlight));
            postSentencesForAnnotation(
                task.taskNum, 
                reqNum, 
                getSentenceAnnotations(task, reqNum, reqText, exampleDocs, sentencesForAnnotation.current)
            ).then(res => {
                setStep(3);
                setIsNextLoading(false);
            }).catch(e => {
                console.error(e);
                setIsNextLoading(false);
            });
        } else {
            // next step
            setStep(Math.min(steps.length, step + 1));
            setIsNextLoading(true);
        }
        setHelperText([]);
    };

    const handleFinish = async (createSubmission: boolean) => {
        if(createSubmission) {
            const id = (await submitSubmission({
                taskNum: task.taskNum,
                reqNum
            })).id;
            navigate(`/hits/${id}`);
        } else { 
            onCreate();
        }
    };

    const handleBack = () => {
        setIsConfirmingBack(false);
        // reset step progress
        if(step === 1) {
            setCandidateDocs([]);
            setExampleDocMap({});
        } else if(step === 2) {
            setInitialAnnotatedSentences({});
            sentencesForAnnotation.current = {};
        }
        setStep(Math.max(0, step - 1));
    };

    const validateNextStep: () => boolean = () => {
        return (step === 0 && validateFirstStep()) ||  (step === 1 && validateSecondStep()) || (step === 2 && validateThirdStep());
    };

    const validateFirstStep = () => {
        return reqText.length > 0;
    };

    const validateSecondStep = () => {
        return Object.keys(exampleDocMap).length > 0 && Object.values(exampleDocMap).every(v => v.highlight.length > 0);
    };

    const validateThirdStep = () => {
        return true;
    };

    const getHelper = () => {
        const helper = [];
        if(step === 0 ) {
            if(reqText.length <= 0) { helper.push('Request text cannot be blank.'); }
        } else if (step === 1) {
            if(Object.keys(exampleDocMap).length === 0 || Object.keys(exampleDocMap).length < MAX_EXAMPLE_DOCS) { helper.push('Select example documents (upto 4).'); }
            if(!Object.values(exampleDocMap).every(v => v.highlight.length > 0)) { 
                helper.push('Select a highlight section for all documents'); 
            };
        } else {}
        setHelperText(helper); 
    };

    const handleDocCheck = (doc: CandidateDoc, isChecked: boolean) => {
        const docId = doc.docid;
        if(isChecked)
            setExampleDocMap({ ...exampleDocMap, [docId]: { doc: doc, highlight: '', docNumber: Object.keys(exampleDocMap).length + 1 } });
        else {
            const newDocMap = Object.keys(exampleDocMap)
                .filter(k => k !== docId).map(k => exampleDocMap[k])
                .reduce((res, exampleDoc) => ({ ...res, [exampleDoc.doc.docid]: { ...exampleDoc, docNumber: exampleDoc.docNumber - 1 } }), {});
            setExampleDocMap(newDocMap);
        }
    };

    const handleHighlightConfirm = (docId: string, text: string) => {
        setExampleDocMap({ ...exampleDocMap, [docId]: { ...exampleDocMap[docId], highlight: text } });
    };

    const handleAnnotate = (docId: string, sentenceId: string, judgment: AnnotationJudgement) => {
        sentencesForAnnotation.current[docId][sentenceId].judgment = judgment;
    };

    const isLastStep = step === steps.length - 1;

    const renderFooter = () => <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto' }}>
        <Box padding={'0 6px'} border={isConfirmingBack ? '1px solid grey' : undefined} borderRadius={isConfirmingBack ? '4px' : undefined}>
            {isConfirmingBack ? <>
                <span>You will lose your progress in this step. Are you sure?</span>
                <Button
                    color={'error'}
                    variant={'text'}
                    onClick={handleBack}
                    sx={{ mr: 1, ml: 1 }}
                >
                    Yes
                </Button>
                <Button
                    variant={'text'}
                    color={'inherit'}
                    onClick={() => setIsConfirmingBack(false)}
                >
                    No
                </Button>
            </> :
            (step === 1 && <Button
                color="inherit"
                onClick={() => setIsConfirmingBack(true)}
                sx={{ mr: 1 }}
            >
                Back
            </Button>)}
        </Box>
        <Box sx={{ flex: '1 1 auto' }} />
        <Tooltip placement={'top'} classes={{tooltip: 'wizard-tooltip'}} title={
            helperText.length <= 0 ? '' : <>{helperText.map((t, i) => <li key={i}>{t}</li>)}</>
        }>
            <span onMouseOver={getHelper} hidden={false}>
                {step < steps.length ? <LoadingButton loading={isNextLoading} endIcon={!isLastStep && <NavigateNextIcon/>} loadingPosition="end" variant={'contained'} color={'primary'} onClick={handleNext} disabled={!validateNextStep()}>
                    {isLastStep ? 'Create Request' : 'Next'}
                </LoadingButton> : ''}
            </span>
        </Tooltip>
    </Box>;

    return <Modal
        open={isOpen}
        onClose={onClose}
        classes={{root: 'wizard-modal'}}
        >
        <Paper classes={{root: 'wizard-paper'}}>
            {step >= 0 ? <>
                <Stepper activeStep={step}>
                    {
                        steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)
                    }
                </Stepper>

                {step === 0 ? (
                    <Grid container direction='column' spacing={4} mt={2}>
                        <Grid item container>
                            <Grid item xs={10}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Request Text"
                                    value={reqText}
                                    onChange={(e) => setReqText(e.target.value)}
                                    disabled={isNextLoading}
                                />
                            </Grid>
                        </Grid>
                        {isNextLoading && <Grid item>Please wait, this may take upto 30 seconds...</Grid>}
                    </Grid>
                ): step === 1 ? (
                    <Grid classes={{root: 'wizard-body'}} container direction='column' spacing={4} mt={2}>
                        <div className={'wizard-instruction-text'}>Select example documents and highlight most relevant text for each:</div>
                        {candidateDocs.map((doc, i) => <CandidateDocCard 
                            key = {`${i}${doc.docid}`} 
                            onCheck={c => handleDocCheck(doc, c)} 
                            checked = {doc.docid in exampleDocMap} 
                            checkboxDisabled = {Object.keys(exampleDocMap).length > MAX_EXAMPLE_DOCS - 1}
                            doc={doc} 
                            highlightText={exampleDocMap[doc.docid]?.highlight || ''}
                            onHighlightConfirm={(t) => handleHighlightConfirm(doc.docid, t)}
                        />)}
                    </Grid>
                ) : step === 2 ? (
                    <React.Fragment>
                        <div className={'wizard-body'}>
                            <Typography sx={{ mt: 2, mb: 1 }}>Judge Sentences</Typography>
                            {getAllSentences(initialAnnotatedSentences).map((sent) => (
                                <SentenceRow 
                                    key={`${sent.sentence}${sent.judgment}`} 
                                    judgment={sent.judgment} 
                                    sentence={sent.sentence} 
                                    onAnnotate={(j) => handleAnnotate(sent.docId, sent.sentenceId, j)}
                                />
                            ))}
                        </div>
                    </React.Fragment>
                ) : <div className={'wizard-final'}>
                    <span>
                        Your request has been created! 
                    </span>
                    <br/>
                    <span>
                        <Link component={'button'} className={'wizard-final-link'} onClick={() => handleFinish(true)}>Click Here</Link> to run a submission for this request.
                    </span>
                    <span>
                        <Link component={'button'} className={'wizard-final-link'} onClick={() => handleFinish(false)}>Click Here</Link> to see all tasks.
                    </span>
                </div>}
                {step < 3 && renderFooter()}
            </> : <CircularProgress size={60} classes={{root: 'wizard-loading'}} />}
        </Paper>
    </Modal>; 
};