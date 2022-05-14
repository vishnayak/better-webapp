import React from 'react';
import { Box, Button, CircularProgress, Grid, Modal, Paper, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { addExampleDocsToTask, CandidateDoc, candidateDocToExampleDoc, createTask, ExampleDoc, getCandidateDocsForTask, getPhrasesForAnnotation, getSentencesForAnnotation, getTaskById, Sentences, SentencesAnnotation, updateTask } from '@services/task-service';
import './TaskCreationWizard.css';
import { CandidateDocCard } from '@components/candidate-doc-card/CandidateDocCard';

export interface TaskCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: () => void;
    id?: string;
};

interface SelectedExampleDoc {
    doc: CandidateDoc;
    highlight: string;
    docNumber: number;
};

const steps = ['Describe the task', 'Select Example Docs', 'Annotate Phrases'];
const MAX_EXAMPLE_DOCS = 2;

export const TaskCreationWizard: React.FC<TaskCreationWizardProps> = (props) => {
    // modal control state
    const { isOpen, onClose, onCreate, id } = props;
    const [step, setStep] = React.useState(id ? -1 : 0);
    const [helperText, setHelperText] = React.useState<string[]>([]);
    const [isNextLoading, setIsNextLoading] = React.useState(false);
    const [isConfirmingBack, setIsConfirmingBack] = React.useState(false);
    // step 1
    const [taskNum, setTaskNum] = React.useState(id || '');
    const [taskTitle, setTaskTitle] = React.useState('');
    const [taskNarr, setTaskNarr] = React.useState('');
    const [taskStmt, setTaskStmt] = React.useState('');
    // step 2
    const [candidateDocs, setCandidateDocs] = React.useState<CandidateDoc[]>([]);
    const [exampleDocMap, setExampleDocMap] = React.useState<Record<string, SelectedExampleDoc>>({});
    // step 3
    const [sentencesForAnnotation, setSentencesForAnnotation] = React.useState<Sentences[]>([]);
    const [annotations, setAnnotations] = React.useState<SentencesAnnotation[]>([]);

    React.useEffect(() => {
        const setInitialStep = async () => {
            if(id) { // edit mode
                // fetch task with id
                const task = await getTaskById(id);
                // const task: Task = {
                //     taskTitle: '',
                //     taskNum: '',
                //     taskStmt: '',
                //     taskNarr: '',
                //     taskExampleDocs: [],
                //     requests: []
                // };
                // set step to 2 if annotations are present
                let annotations = [];
                try {
                    annotations = [];
                } catch {
                    console.log('Annotations call failed.');
                }
                if(annotations.length > 0) {
                    setStep(2);
                } else if(task.taskExampleDocs) {
                    setStep(1);
                } else {
                    setStep(0);
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
            setAnnotations([]);
        }
        setStep(Math.max(0, step - 1));
    };

    const handleNext = () => {
        setIsConfirmingBack(false);
        setIsNextLoading(true);
        if(step === 0) {
            // create new task
            // make api call
            if(taskTitle.length > 0 && taskNarr.length > 0 && taskStmt.length > 0){
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
                        console.log(e);
                        setIsNextLoading(false);
                        // do nothing  for now :(
                    });
                });
            }
        } else if(step === 1) {
            // post candidate docs
            const exampleDocs: ExampleDoc[] = Object.values(exampleDocMap).map(doc => candidateDocToExampleDoc(doc.doc, doc.docNumber, doc.highlight));
            addExampleDocsToTask(taskNum, exampleDocs).then(res => {
                getPhrasesForAnnotation(taskNum, reqNum).then(res => {
                    setSentencesForAnnotation(res)
                }).catch(e => {
                });
                setStep(2);
                setIsNextLoading(false);
            }).catch(e => {
                console.log(e);
                setIsNextLoading(false);
                // do nothing  for now :(
            });
        } else if(step === steps.length - 1) {
            // submit
            // make api call
        } else {
            // next step
            setStep(Math.min(steps.length, step + 1));
        }
        setHelperText([]);
    };

    const handleSaveDraft = () => {
        onClose();
    };

    const validateNextStep: () => boolean = () => {
        return (step === 0 && validateFirstStep()) ||  (step === 1 && validateSecondStep()) || (step === 2 && validateThirdStep());
    };

    const validateFirstStep = () => {
        return taskTitle.length > 0 && taskStmt.length > 0 && taskNarr.length > 0;
    };

    const getHelper = () => {
        const helper = [];
        if(step === 0 ) {
            if(taskTitle.length <= 0) { helper.push('Task Title cannot be blank.'); }
            if(taskStmt.length <= 0) { helper.push('Task Statement cannot be blank.'); }
            if(taskNarr.length <= 0) { helper.push('Task Narrative cannot be blank.'); }
        } else if (step === 1) {
            if(Object.keys(exampleDocMap).length !== 2) { helper.push('Select exactly two example documents.'); }
            if(!Object.values(exampleDocMap).every(v => v.highlight.length > 0)) { 
                helper.push('Select a highlight section for both documents'); 
            };
        } else {}
        setHelperText(helper); 
    };

    const validateSecondStep = () => {
        return Object.keys(exampleDocMap).length === 2 && Object.values(exampleDocMap).every(v => v.highlight.length > 0);
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
    }

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
            (step !== 0 && <Button
                color="inherit"
                onClick={() => setIsConfirmingBack(true)}
                sx={{ mr: 1 }}
            >
                Back
            </Button>)}
        </Box>
        <Box sx={{ flex: '1 1 auto' }} />
        {step !== 0 && (
            <Button color="inherit" onClick={handleSaveDraft} sx={{ mr: 1 }}>
                Save as Draft
            </Button>
        )}
        <Tooltip placement={'top'} classes={{tooltip: 'wizard-tooltip'}} title={
            helperText.length <= 0 ? '' : <>{helperText.map((t, i) => <li key={i}>{t}</li>)}</>
        }>
            <span onMouseOver={getHelper} hidden={false}>
                <LoadingButton loading={isNextLoading} endIcon={!isLastStep && <NavigateNextIcon/>} loadingPosition="end" variant={'contained'} color={'primary'} onClick={handleNext} disabled={!validateNextStep()}>
                    {isLastStep ? 'Finish' : 'Next'}
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
                    <Grid classes={{root: 'wizard-candidate-docs-section'}} container direction='column' spacing={4} mt={2}>
                        <div className={'wizard-instruction-text'}>Select <b>EXACTLY TWO</b> example documents and highlight most relevant text for each:</div>
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
                ) : (
                    <React.Fragment>
                    <Typography sx={{ mt: 2, mb: 1 }}>Step {step + 1}</Typography>
                    
                    </React.Fragment>
                )}
                {renderFooter()}
            </> : <CircularProgress size={60} classes={{root: 'wizard-loading'}} />}
        </Paper>
    </Modal>; 
};