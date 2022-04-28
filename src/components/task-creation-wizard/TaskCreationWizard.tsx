import React from 'react';
import { Box, Button, Checkbox, CircularProgress, Grid, Modal, Paper, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from '@mui/material';
import { CandidateDoc, createTask, getTaskById, Task } from '@services/task-service';
import './TaskCreationWizard.css';
import candidateDocs from './docs.json';
import { SearchHitCard } from '@components/search-hit-card/SearchHitCard';
import { SearchHit } from '@components/hits/SearchHits';
import { CandidateDocCard } from '@components/candidate-doc-card/CandidateDocCard';

export interface TaskCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: () => void;
    id?: string;
};

export interface ExampleDoc {
    docid: string;
	highlight: string;
}

const steps = ['Describe the task', 'Select Example Docs', 'Annotate Phrases'];

export const TaskCreationWizard: React.FC<TaskCreationWizardProps> = (props) => {
    const { isOpen, onClose, onCreate, id } = props;
    // const [step, setStep] = React.useState(id ? -1 : 0);
    const [step, setStep] = React.useState(1);
    const [taskTitle, setTaskTitle] = React.useState('');
    const [taskNarr, setTaskNarr] = React.useState('');
    const [taskStmt, setTaskStmt] = React.useState('');
    // const [candidateDocs, setCandidateDocs] = React.useState<CandidateDoc[]>([]);
    const [exampleDocMap, setExampleDocMap] = React.useState<Record<string, ExampleDoc>>({});
    const [annotations, setAnnotations] = React.useState([]);
    const [helperText, setHelperText] = React.useState<string[]>([]);

    React.useEffect(() => {
        const setInitialStep = async () => {
            if(id) {
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
        setStep(Math.max(0, step - 1));
    };

    const handleNext = () => {
        if(step === 0) {
            // create new task
            // make api call
            // createTask({
            //     taskTitle: '',
            //     taskNarr: '',
            //     taskStmt: ''
            // }).then((res) => {
            //     // fetch example docs
            // });
            setStep(1);
        } else if(step === 1) {
            // post candidate docs
            setStep(2);
        } else if(step === steps.length - 1) {
            // submit
            // make api call
            createTask({
                taskTitle: '',
                taskNarr: '',
                taskStmt: ''
            });
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
        } else {
            if(Object.keys(exampleDocMap).length !== 2) { helper.push('Select exactly two example documents.'); }
            if(!Object.values(exampleDocMap).every(v => v.highlight.length > 0)) { 
                helper.push('Select a highlight section for both documents'); 
            };
        }
        setHelperText(helper); 
    };

    const validateSecondStep = () => {
        return Object.keys(exampleDocMap).length === 2 && Object.values(exampleDocMap).every(v => v.highlight.length > 0);
    };

    const validateThirdStep = () => {
        return true;
    };

    const handleDocCheck = (docId: string, isChecked: boolean) => {
        if(isChecked)
            setExampleDocMap({ ...exampleDocMap, [docId]: { docid: docId, highlight: '' } });
        else {
            const newDocMap = Object.keys(exampleDocMap)
                .filter(k => k !== docId).map(k => [k, exampleDocMap[k]])
                .reduce((res, tup) => ({ ...res, [tup[0] as string]: tup[1] }), {});
            setExampleDocMap(newDocMap);
        }
    };

    const handleHighlightConfirm = (docId: string, text: string) => {
        setExampleDocMap({ ...exampleDocMap, [docId]: { docid: docId, highlight: text } });
    }

    const renderFooter = () => <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 'auto' }}>
        {step !== 0 && <Button
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 1 }}
        >
            Back
        </Button>}
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
                <Button variant={'contained'} color={'primary'} onClick={handleNext} disabled={!validateNextStep()}>
                    {step === steps.length - 1 ? 'Create Task' : 'Next'}
                </Button>
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
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                ): step === 1 ? (
                    <Grid classes={{root: 'wizard-candidate-docs-section'}} container direction='column' spacing={4} mt={2}>
                        <div className={'wizard-instruction-text'}>Select <b>EXACTLY TWO</b> example documents and highlight most relevant text for each:</div>
                        {candidateDocs.map((doc, i) => <CandidateDocCard 
                            key = {`${i}${doc.docid}`} 
                            onCheck={c => handleDocCheck(doc.docid, c)} 
                            checked = {doc.docid in exampleDocMap} 
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