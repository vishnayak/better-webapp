import Heading from '@components/heading/Heading';
import { RequestWizard } from '@components/request-creation-wizard/RequestWizard';
import { TaskCreationWizard } from '@components/task-creation-wizard/TaskCreationWizard';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Card, CardContent, CardHeader, Checkbox, CircularProgress, FormControlLabel, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { getSubmissionsByTaskNum, Submission } from '@services/submission-service';
import { AnnotationJudgment, AnnotationJudgmentNames, getAnnotationPhrases, getTaskById, PhraseAnnotation, Task } from '@services/task-service';
import React from 'react';
import { useParams } from 'react-router-dom';
import { RequestDetails } from './RequestDetails';
import './TaskDetails.css';

interface PhraseAnnotationRow {
    phrase: string;
    sentence: string;
    judgment: AnnotationJudgment;
}

export const getHighlightedSpan = (docText: string, highlightText: string, highlightClassName: string) => {
    const splitText = docText.split(highlightText);
    if(splitText.length === 1) return <span>{splitText}</span>;
    const resultText = splitText.slice(0, splitText.length - 1).map((text, i) => <React.Fragment key={i}>{text}<span className={highlightClassName}>{highlightText}</span></React.Fragment>);
    return <Typography className={'doc-text'} variant='body2'>
        {resultText}{splitText[splitText.length - 1]}
    </Typography>
};

const getHighlightedAnnotations = (docText: string, annotationRows: PhraseAnnotationRow[]) => {
    const phraseOrdering: any[] = annotationRows.filter(r => r.judgment !== AnnotationJudgment.NONE).flatMap(r => {
        let lastIndex = 0;
        const len = docText.length;
        const res = [];
        while(lastIndex < len) {
            const phraseLen = r.phrase.length;
            const idx = docText.substring(lastIndex).indexOf(r.phrase);
            if(idx === -1) {
                break;
            }
            lastIndex += idx + phraseLen;
            res.push({
                text: r.phrase,
                offset: idx,
                className: `doc-highlight-${r.judgment}`,
                judgment: r.judgment
            });
        }
        return res;
    });

    phraseOrdering.sort((a,b) => a.offset < b.offset ? -1 : 1);
    
    let lastIndex = 0;
    const res = phraseOrdering.map((phrase, i) => {
        const idx = docText.substring(lastIndex).indexOf(phrase.text);
        const remaining = docText.substring(lastIndex, lastIndex+idx);
        lastIndex += idx + phrase.text.length;
        return <React.Fragment key={`${i}${phrase.judgment}`}>
            {remaining}
            <span className={`doc-highlight-${phrase.judgment}`}>{phrase.text}</span>
        </React.Fragment>
    });
    return <Typography className={'doc-text'} variant='body2'>
        {res}
        {docText.substring(lastIndex)}
    </Typography>
};

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
    const [selectedRow, setSelectedRow] = React.useState<PhraseAnnotationRow | undefined>(undefined);
    const [seeAllAnnotations, setSeeAllAnnotations] = React.useState(false);
    const [showHighlightedJudgments, setShowHighlightedJudgments] = React.useState<boolean[]>([]);

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
        const goodJudgments = [AnnotationJudgment.P, AnnotationJudgment.E, AnnotationJudgment.G];
        const badJudgments = [AnnotationJudgment.F, AnnotationJudgment.B];
        const goodAnnotations = allAnnotations.filter(a => goodJudgments.indexOf(a.judgment) > -1);
        const badAnnotations = allAnnotations.filter(a => badJudgments.indexOf(a.judgment) > -1);
        const emptyAnnotations = allAnnotations.filter(a => a.judgment === AnnotationJudgment.NONE);
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
        setIsLoading(true);
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
            setShowHighlightedJudgments(res.taskExampleDocs.map(d => true));
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

    const handleHighlightCheck = (index: number) => {
        setShowHighlightedJudgments(prev => ([...prev.slice(0, index), !prev[index], ...prev.slice(index+1)]));
    };

    return <div className='task-details-page'>
        {isLoading ? 
        <div style={{textAlign: 'center'}}>
            <CircularProgress size={60} classes={{root: 'fallback-text'}} />
        </div>: 
        (task ? <div className='task-details'>
            {isEditing && <TaskCreationWizard 
                taskNum={taskNum} 
                onCreate={() => handleEditTaskClick(false)} 
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
            {task.taskExampleDocs.length > 0 ? <div className='task-details-example-docs'>
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
                        <span>Doc {doc.docNumber}</span>
                    </Link>
                    <li className='task-details-example-doc-highlight'>
                        <b>Highlight Text:</b>
                        &nbsp;
                        {doc.highlight.length > 0 ? `${doc.highlight}` : 'No highlight text was selected for this document'}
                    </li>
                    {openDocs[doc.docNumber - 1] && <Card classes={{ root: 'task-details-card' }}>
                        <CardHeader classes={{title: 'task-details-doc-card-header'}} title={
                            <>
                                <FormControlLabel 
                                    label='Show Sentence Judgments' 
                                    control={
                                        <Checkbox defaultChecked={true} onChange={() => handleHighlightCheck(doc.docNumber - 1)} />
                                    } 
                                />
                                {showHighlightedJudgments[doc.docNumber - 1] ? <Typography variant='body2'>
                                    &nbsp;<span className='doc-highlight-P'>&nbsp;Perfect&nbsp;</span>
                                    &nbsp;<span className='doc-highlight-E'>&nbsp;Excellent&nbsp;</span>
                                    &nbsp;<span className='doc-highlight-G'>&nbsp;Good&nbsp;</span>
                                    &nbsp;<span className='doc-highlight-F'>&nbsp;Fair&nbsp;</span>
                                    &nbsp;<span className='doc-highlight-B'>&nbsp;Bad&nbsp;</span>
                                </Typography> : 
                                <Typography variant='body2'>
                                    <span className='doc-highlight-selected-text'>&nbsp;Highlight Text&nbsp;</span>
                                </Typography>}
                            </>
                        } />
                        <CardContent classes={{ root: 'search-hit-card-content' }}>
                            {showHighlightedJudgments[doc.docNumber - 1] ? 
                            getHighlightedAnnotations(doc.docText, annotations.current) :
                            getHighlightedSpan(doc.docText, doc.highlight, 'doc-highlight-selected-text')}
                        </CardContent>
                    </Card>}
                </React.Fragment>)}
            </div> : 'No example documents have been added. Edit task and select documents.'}

            {annotations.current.length > 0 && <>
                <Heading headingText='Phrase Judgments' />
                <div className='task-details-annotations-table'>
                    <TableContainer sx={{margin: '16px', maxWidth: '50%'}} component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{'& > *': { padding: '8px' }}}>
                                    <TableCell><b>Phrase</b></TableCell>
                                    <TableCell sx={{ width: '100px' }}><b>Judgment</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {(seeAllAnnotations ? annotations.current : annotationSummary).map( row =>
                                <TableRow
                                    onClick={() => setSelectedRow(row)}
                                    key={row.phrase}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& > *': { padding: '8px' } }}
                                    className={`task-details-annotations-row ${selectedRow?.phrase === row.phrase ? 'task-details-annotations-row--highlighted' : ''}`}
                                >
                                    <TableCell>{row.phrase}</TableCell>
                                    <TableCell>{AnnotationJudgmentNames[row.judgment]}</TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Card className={'task-details-annotation-sentence'}>
                        <CardHeader classes={{title: 'task-details-annotation-sentence-header'}} title='Phrase with Context' />
                        <CardContent>
                            {selectedRow === undefined ? 'Click a row from the table to see a phrase judgment with context.' : getHighlightedSpan(selectedRow.sentence, selectedRow.phrase, `doc-highlight-${selectedRow.judgment || 'selected-text'}`)}
                        </CardContent>
                    </Card>
                </div>
                <Button variant='outlined' onClick={toggleSeeMore} className='task-details-annotation-see-more'>{seeAllAnnotations ? 'See Summary' : 'See All Judgments'}</Button>
            </>}
            <div className='task-details-heading-row'>
                <Heading headingText='Requests' />
                {task.taskExampleDocs.length > 0 && <Button variant={'contained'} onClick={() => handleCreateRequestClick(true)}><Add/> &nbsp; Add Request</Button>}
            </div>
            {task.requests.length === 0 ? <span>
                No requests have been created for this task.
                {task.taskExampleDocs.length === 0 && <>&nbsp;Add example documents to create a request.</>}
            </span>:
            task.requests.map(req => <RequestDetails key={req.reqNum} taskNum={taskNum} request={req} submissions={submissionMap[req.reqNum] || []} onReannotate={() => setEditingRequestId(req.reqNum)} />)}
        </div> : <div className='fallback-text'>This Task Id is invalid!</div>)}
    </div>;
};