import Heading from '@components/heading/Heading';
import { RequestWizard } from '@components/request-creation-wizard/RequestWizard';
import { insertNewLines } from '@components/search-hit-card/SearchHitCard';
import { TaskCreationWizard } from '@components/task-creation-wizard/TaskCreationWizard';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Card, CardContent, CardHeader, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { getSubmissionsByTaskNum, Submission } from '@services/submission-service';
import { AnnotationJudgement, AnnotationJudgementNames, getAnnotationPhrases, getTaskById, PhraseAnnotation, Task } from '@services/task-service';
import React from 'react';
import { useParams } from 'react-router-dom';
import { RequestDetails } from './RequestDetails';
import './TaskDetails.css';
import sample from 'lodash.sample';

interface PhraseAnnotationRow {
    phrase: string;
    sentence: string;
    judgment: AnnotationJudgement;
}

export const TaskDetails: React.FC<{}> = () => {
    const params = useParams();
    const [taskNum, setTaskNum] = React.useState<string>('');
    const [task, setTask] = React.useState<Task | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [openDocs, setOpenDocs] = React.useState<boolean[]>([]);
    const [annotationSummary, setAnnotationSummary] = React.useState<PhraseAnnotationRow[]>([]);
    const [submissionMap, setSubmissionMap] = React.useState<Record<string, Submission[]>>({});
    const [isEditing, setIsEditing] = React.useState(false);
    const [openCreateNewRequest, setOpenCreateNewRequest] = React.useState(false);
    const [editingRequestId, setEditingRequestId] = React.useState<string | undefined>(undefined);
    const annotations = React.useRef<PhraseAnnotationRow[]>([]);
    const [selectedSentence, setSelectedSentence] = React.useState<string>('');
    const [seeAllAnnotations, setSeeAllAnnotations] = React.useState(false);

    React.useEffect(() => {
        setTaskNum(params.taskNum as string);
    }, []);
    
    React.useEffect(() => {
        if(taskNum !== '') {
            refreshTask();
        }
    }, [taskNum]);

    const getAnnotationRows = (phrasesAnnotation: PhraseAnnotation) => {
        const allAnnotations: PhraseAnnotationRow[] = Object.keys(phrasesAnnotation).map(p => ({
            phrase: p,
            sentence: phrasesAnnotation[p].sentences,
            judgment: phrasesAnnotation[p].judgment,
        }));
        const goodJudgments = [AnnotationJudgement.P, AnnotationJudgement.E, AnnotationJudgement.G];
        const badJudgments = [AnnotationJudgement.F, AnnotationJudgement.B];
        const goodAnnotations = allAnnotations.filter(a => goodJudgments.indexOf(a.judgment) > -1);
        const badAnnotations = allAnnotations.filter(a => badJudgments.indexOf(a.judgment) > -1);
        const emptyAnnotations = allAnnotations.filter(a => a.judgment === AnnotationJudgement.NONE);
        const result = [];
        if(badAnnotations.length > 3) {
            result.push(...goodAnnotations.slice(0, 3));
        } else {
            result.push(...goodAnnotations.slice(0, 6 - badAnnotations.length));
        }
        result.push(...badAnnotations.slice(0, 6 - result.length));
        result.push(...emptyAnnotations.slice(0, 6 - result.length));
        return [allAnnotations, result];
    };

    const refreshTask = async () => {
        try {
            const res = await getTaskById(taskNum);
            const annotationRes = await getAnnotationPhrases(taskNum);
            const submissions = await getSubmissionsByTaskNum(taskNum);
            const map: Record<string, Submission[]> = {};
            submissions.forEach(submission => {
                map[submission.reqNum] = [...(map[submission.reqNum] || []), submission];
            });
            setSubmissionMap(map);
            setTask(res);
            const docOpenFlags = res.taskExampleDocs.map(d => false);
            setOpenDocs(docOpenFlags);
            const [allAnnotations, sampledAnnotations] = getAnnotationRows(annotationRes);
            setAnnotationSummary(sampledAnnotations);
            annotations.current = allAnnotations;
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const toggleDoc = (index: number) => {
        setOpenDocs(prev => {
            return [...prev.slice(0, index), !prev[index], ...prev.slice(index+1)];
        });
    };

    const handleEditTaskClick = (isOpening: boolean) => {
        setIsEditing(isOpening);
        if(!isOpening) refreshTask();
    };

    const handleCreateRequestClick = (isOpening: boolean) => {
        setEditingRequestId(undefined);
        setOpenCreateNewRequest(isOpening);
        if(!isOpening) refreshTask();
    };

    const toggleSeeMore = () => {
        setSeeAllAnnotations(prev => !prev);
    }

    // TODO: Loading and error states

    return <div className='task-details-page'>
        {!isLoading && task && <div className='task-details'>
            {isEditing && <TaskCreationWizard 
                taskNum={taskNum} 
                onCreate={() => handleEditTaskClick(true)} 
                isOpen={isEditing} 
                onClose={() => handleEditTaskClick(false)}
            />}
            {(openCreateNewRequest || editingRequestId) && <RequestWizard 
                task={task} 
                requestNum={editingRequestId}
                onCreate={() => handleCreateRequestClick(false)} 
                isOpen={openCreateNewRequest || editingRequestId !== undefined} 
                onClose={() => handleCreateRequestClick(false)}
            />}
            <div className='task-details-heading-row'>
                <Heading headingText='Task Overview' />
                <Button variant='contained' onClick={() => handleEditTaskClick(true)}><Edit />&nbsp;Edit</Button>
            </div>
            <span className='task-details-title'>{task.taskTitle}</span>
            {task.taskStmt.length > 0 && <span className='task-details-stmt'>{task.taskStmt}</span>}
            {task.taskNarr.length > 0 && <span className='task-details-narr'><b>Narrative: </b>{task.taskNarr}</span>}
            
            <Heading headingText='Example Documents' />
            <div className='task-details-example-docs'>
                {task.taskExampleDocs.map((doc) => <React.Fragment key={`${doc.docNumber}${openDocs[doc.docNumber-1]}`}>
                    <Link classes={{ root: 'task-details-example-doc-label' }} onClick={() => toggleDoc(doc.docNumber - 1)}>
                        <KeyboardArrowDown
                            sx={{
                                ml: -1,
                                opacity: 1,
                                transform: openDocs[doc.docNumber - 1] ? 'rotate(-180deg)' : 'rotate(0)',
                                transition: '0.2s',
                            }}
                        />
                        <span>Doc {doc.docNumber}{doc.highlight.length > 0 && `- Highlight Text: ${doc.highlight}`}</span>
                    </Link>
                    {openDocs[doc.docNumber - 1] && <Card classes={{ root: 'task-details-card' }}>
                        <CardContent classes={{ root: 'search-hit-card-content' }}>
                            <Typography variant="body2">
                                {insertNewLines(doc.docText)}
                            </Typography>
                        </CardContent>
                    </Card>}
                </React.Fragment>)}
            </div>

            {annotations.current.length > 0 && <>
                <Heading headingText='Annotations' />
                <div className='task-details-annotations-table'>
                    <TableContainer sx={{margin: '16px', maxWidth: '50%'}} component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{'& > *': { padding: '8px' }}}>
                                    <TableCell>Phrase</TableCell>
                                    <TableCell sx={{ width: '100px' }}>Judgment</TableCell>
                                    {/* <TableCell>Sentence</TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {(seeAllAnnotations ? annotations.current : annotationSummary).map( row =>
                                <TableRow
                                    onClick={() => setSelectedSentence(row.sentence)}
                                    key={row.phrase}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& > *': { padding: '8px' } }}
                                    className={`task-details-annotations-row ${selectedSentence === row.sentence ? 'task-details-annotations-row--highlighted' : ''}`}
                                >
                                    <TableCell>{row.phrase}</TableCell>
                                    <TableCell>{AnnotationJudgementNames[row.judgment]}</TableCell>
                                    {/* <TableCell>{row.sentence}</TableCell> */}
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Card className={'task-details-annotation-sentence'}>
                        <CardHeader className={'task-details-annotation-sentence-header'} title='Sentence' />
                        <CardContent>
                            {selectedSentence.length > 0 ? selectedSentence : 'Click a row to see its sentence.'}
                        </CardContent>
                    </Card>
                </div>
                <Button variant='text' onClick={toggleSeeMore} className='task-details-annotation-see-more'>{seeAllAnnotations ? 'See Summary' : 'See All'}</Button>
            </>}
            <div className='task-details-heading-row'>
                <Heading headingText='Requests' />
                <Button variant={'contained'} onClick={() => handleCreateRequestClick(true)}><Add/> &nbsp; Add Request</Button>
            </div>
            {task.requests.length === 0 ? <span>No requests have been created for this task.</span>:
            task.requests.map(req => <RequestDetails key={req.reqNum} taskNum={taskNum} request={req} submissions={submissionMap[req.reqNum] || []} onReannotate={() => setEditingRequestId(req.reqNum)} />)}
        </div>}
    </div>;
};