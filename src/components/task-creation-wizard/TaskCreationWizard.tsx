import React from 'react';
import { Box, Button, CircularProgress, Grid, Modal, Paper, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { addExampleDocsToTask, AnnotationJudgement, CandidateDoc, candidateDocToExampleDoc, createTask, ExampleDoc, getAnnotationPhrases, getCandidateDocsForTask, getPhrasesForAnnotation, getSentencesForAnnotation, getTaskById, PhraseAnnotation, postPhrasesForAnnotation, Sentences, SentencesAnnotation, updateTask } from '@services/task-service';
import './TaskCreationWizard.css';
import { CandidateDocCard } from '@components/candidate-doc-card/CandidateDocCard';
import { PhraseRow } from '@components/formDialog/PhraseRow';

export interface TaskCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: () => void;
    taskNum?: string;
};

interface SelectedExampleDoc {
    doc: CandidateDoc;
    highlight: string;
    docNumber: number;
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

const steps = ['Describe the task', 'Select Example Docs', 'Annotate Phrases'];
const MAX_EXAMPLE_DOCS = 4;

export const TaskCreationWizard: React.FC<TaskCreationWizardProps> = (props) => {
    // modal control state
    const { isOpen, onClose, onCreate, taskNum: taskNumProp } = props;
    const [step, setStep] = React.useState(taskNumProp ? -1 : 0);
    const [helperText, setHelperText] = React.useState<string[]>([]);
    const [isNextLoading, setIsNextLoading] = React.useState(false);
    const [isConfirmingBack, setIsConfirmingBack] = React.useState(false);
    // step 1
    const [taskNum, setTaskNum] = React.useState(taskNumProp || '');
    const [taskTitle, setTaskTitle] = React.useState('');
    const [taskNarr, setTaskNarr] = React.useState('');
    const [taskStmt, setTaskStmt] = React.useState('');
    // step 2
    const [candidateDocs, setCandidateDocs] = React.useState<CandidateDoc[]>([]);
    const [exampleDocMap, setExampleDocMap] = React.useState<Record<string, SelectedExampleDoc>>({});
    // step 3
    const [initialAnnotatedPhrases, setInitialAnnotatedPhrases] = React.useState<PhraseAnnotation>({});
    const phrasesForAnnotation = React.useRef<PhraseAnnotation>({});
    
    React.useEffect(() => {
        const setInitialStep = async () => {
            if(taskNumProp) { // edit mode
                // fetch task with id
                const task = await getTaskById(taskNumProp);
                // set step to 2 if annotations are present
                try {
                    const phrases = await getAnnotationPhrases(taskNumProp);
                    if(Object.keys(phrases).length > 0) {
                        setInitialAnnotatedPhrases(phrases);
                        setStep(2);
                        phrasesForAnnotation.current = phrases;
                    } else if(task.taskExampleDocs?.length > 0) {
                        const docsResult = await getCandidateDocsForTask(task.taskNum);
                        const reorderedDocs = reorderCandidateDocs(docsResult.hits, task.taskExampleDocs);
                        setCandidateDocs(reorderedDocs.slice(0, 20));
                        setExampleDocMap(getExampleDocMap(task.taskExampleDocs));
                        setStep(1);
                    } else {
                        setTaskTitle(task.taskTitle);
                        setTaskStmt(task.taskStmt);
                        setTaskNarr(task.taskNarr);
                        setStep(0);
                    }
                } catch(e) {
                    console.error('Annotations call failed: ', e);
                }
            }
        };
        
        setInitialStep();
    }, []);

    const handleBack = () => {
        setIsConfirmingBack(false);
        // reset step progress
        if(step === 1) {
            setCandidateDocs([]);
            setExampleDocMap({});
        } else if(step === 2) {
            setInitialAnnotatedPhrases({});
            phrasesForAnnotation.current = {};
        }
        setStep(Math.max(0, step - 1));
    };

    const handleNext = () => {
        setIsConfirmingBack(false);
        setIsNextLoading(true);
        if(step === 0) {
            // create new task
            // make api call
            if(taskTitle.length > 0){
                const payload = {
                    taskTitle,
                    taskNarr,
                    taskStmt
                };
                (taskNum ? updateTask(taskNum, { ...payload, taskNum }) : createTask(payload)).then((res) => {
                    setTaskNum(res.taskNum);
                    getCandidateDocsForTask(res.taskNum).then((docsResult) => {
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
            addExampleDocsToTask(taskNum, exampleDocs).then(res => {
                getAnnotationPhrases(taskNum).then(res => {
                    setInitialAnnotatedPhrases(res);
                    phrasesForAnnotation.current = res;
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
            postPhrasesForAnnotation(taskNum, phrasesForAnnotation.current).then(res => {
                setIsNextLoading(false);
                onCreate();
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

    const validateNextStep: () => boolean = () => {
        return (step === 0 && validateFirstStep()) ||  (step === 1 && validateSecondStep()) || (step === 2 && validateThirdStep());
    };

    const validateFirstStep = () => {
        return taskTitle.length > 0;
    };

    const getHelper = () => {
        const helper = [];
        if(step === 0 ) {
            if(taskTitle.length <= 0) { helper.push('Task Title cannot be blank.'); }
            // if(taskStmt.length <= 0) { helper.push('Task Statement cannot be blank.'); }
            // if(taskNarr.length <= 0) { helper.push('Task Narrative cannot be blank.'); }
        } else if (step === 1) {
            if(Object.keys(exampleDocMap).length === 0 || Object.keys(exampleDocMap).length < MAX_EXAMPLE_DOCS) { helper.push('Select example documents (upto 4).'); }
            if(!Object.values(exampleDocMap).every(v => v.highlight.length > 0)) { 
                helper.push('Select a highlight section for all documents'); 
            };
        } else {}
        setHelperText(helper); 
    };

    const validateSecondStep = () => {
        return Object.keys(exampleDocMap).length > 0 && Object.values(exampleDocMap).every(v => v.highlight.length > 0);
    };

    const validateThirdStep = () => {
        return true;
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

    const handleAnnotate = (phrase: string, judgment: AnnotationJudgement) => {
        phrasesForAnnotation.current = {
            ...phrasesForAnnotation.current,
            [phrase]: {
                ...phrasesForAnnotation.current[phrase],
                judgment
            }
        };
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
                <LoadingButton loading={isNextLoading} endIcon={!isLastStep && <NavigateNextIcon/>} loadingPosition="end" variant={'contained'} color={'primary'} onClick={handleNext} disabled={!validateNextStep()}>
                    {isLastStep ? 'Save and Finish' : 'Next'}
                </LoadingButton>
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
                            <Grid item xs={8} md={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Task Title"
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    disabled={isNextLoading}
                                />
                            </Grid>
                        </Grid>
                        <Grid item container>
                            <Grid item xs={10}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Task Statement"
                                    value={taskStmt}
                                    onChange={(e) => setTaskStmt(e.target.value)}
                                    disabled={isNextLoading}
                                />
                            </Grid>
                        </Grid>
                        <Grid item container>
                            <Grid item xs={10}>
                                <TextField
                                    multiline
                                    required
                                    fullWidth
                                    label="Task Narrative"
                                    value={taskNarr}
                                    onChange={(e) => setTaskNarr(e.target.value)}
                                    minRows={2}
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
                            <Typography sx={{ mt: 2, mb: 1 }}>Annotate Phrases</Typography>
                            {Object.keys(initialAnnotatedPhrases).map((k) => (
                                <PhraseRow 
                                    key={`${k}${initialAnnotatedPhrases[k].judgment}`} 
                                    annotation={initialAnnotatedPhrases[k]} 
                                    phraseName={k} 
                                    onAnnotate={(j) => handleAnnotate(k, j)}
                                />
                            ))}
                        </div>
                    </React.Fragment>
                ) : ('Task Created!')}
                {step < 3 && renderFooter()}
            </> : <CircularProgress size={60} classes={{root: 'wizard-loading'}} />}
        </Paper>
    </Modal>; 
};