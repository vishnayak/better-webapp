import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Card, CardHeader, CardContent, Checkbox, FormControlLabel, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AnnotationJudgment, AnnotationJudgmentNames, getSentencesForAnnotation, Request } from '@services/task-service';
import React from 'react';
import Edit from '@mui/icons-material/Edit';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Submission } from '@services/submission-service';
import { NavLink, useNavigate } from 'react-router-dom';
import { getHighlightedSpan } from './TaskDetails';


export interface RequestDetailsProps {
    request: Request;
    taskNum: string;
    submissions: Submission[];
    onReannotate?: () => void;
}

interface SentenceAnnotationRow {
    docNumber: number;
    sentence: string;
    judgment: AnnotationJudgment;
}

const getAnnotationRows = (allAnnotations: SentenceAnnotationRow[]) => {
    const judgmentPriority = {[AnnotationJudgment.P]: 0, [AnnotationJudgment.E]: 1, [AnnotationJudgment.G]: 2, [AnnotationJudgment.F]: 3, [AnnotationJudgment.B]: 4, [AnnotationJudgment.NONE]: 5};
    const result = allAnnotations.sort((a,b) => judgmentPriority[a.judgment] < judgmentPriority[b.judgment] ? -1 : 1);
    return [result, result.slice(0, 6)];
};

const getHighlightedAnnotations = (docText: string, annotationRows: SentenceAnnotationRow[]) => {
    let lastIndex = 0;
    const res = annotationRows.map((row, i) => {
        const idx = docText.substring(lastIndex).indexOf(row.sentence);
        const remaining = docText.substring(lastIndex, lastIndex+idx);
        lastIndex += idx + row.sentence.length;
        return <React.Fragment key={`${i}${row.judgment}`}>
            {remaining}
            <span className={`doc-highlight-${row.judgment}`}>{row.sentence}</span>
        </React.Fragment>
    });
    return <Typography className={'doc-text'} variant='body2'>
        {res}
        {docText.substring(lastIndex)}
    </Typography>
};

export const RequestDetails: React.FC<RequestDetailsProps> = ({ request, taskNum, submissions: submissionsProp, onReannotate }) => {
    const navigate = useNavigate();
    const [openDocs, setOpenDocs] = React.useState<boolean[]>(request.exampleDocs.map(d => false));
    const [annotationSummary, setAnnotationSummary] = React.useState<SentenceAnnotationRow[]>([]);
    const annotations = React.useRef<SentenceAnnotationRow[]>([]);
    const [seeAllAnnotations, setSeeAllAnnotations] = React.useState(false);
    const [showHighlightedJudgments, setShowHighlightedJudgments] = React.useState<boolean[]>(request.exampleDocs.map(d => true));

    React.useEffect(() => {
        fetchSentences();
    }, []);

    const fetchSentences = async () => {
        const res = await getSentencesForAnnotation(taskNum, request.reqNum);
        const allAnnotations: SentenceAnnotationRow[] = res.request.exampleDocs.flatMap(doc => doc.sentences.map(sent => ({
            docNumber: doc.docNumber,
            sentence: sent.sentence,
            judgment: sent.judgment as AnnotationJudgment,
        })));

        const [all, summary] = getAnnotationRows(allAnnotations);
        annotations.current = all;
        setAnnotationSummary(summary);
        return res;
    };
    
    const toggleDoc = (index: number) => {
        setOpenDocs(prev => {
            return [...prev.slice(0, index), !prev[index], ...prev.slice(index+1)];
        });
    };

    const handleHighlightChange = (index: number, value: number) => {
        setShowHighlightedJudgments(prev => ([...prev.slice(0, index), !!value, ...prev.slice(index+1)]));
    };

    const handleHitsOpen = (submissionId: string) => {
        navigate(`/submissions/${submissionId}`);
    };

    const toggleSeeMore = () => {
        setSeeAllAnnotations(prev => !prev);
    }

    const submissions = submissionsProp.sort((a,b) => a.when > b.when ? -1 : 1);

    return <div className={'request-details'}>
        <div className='request-details-row'>
            <div className='request-details-text'>
                <ArrowForwardIcon sx={{mr: 2}} />
                <span>{request.reqText}</span>
            </div>
            <div>
                {submissions.length > 0 && <Button classes={{root: 'request-details-button'}} variant='outlined' onClick={() => handleHitsOpen(submissions[0].id)}>Show Hits</Button>}
                {<Button classes={{root: 'request-details-button'}} variant='outlined' onClick={onReannotate}>{submissions.length > 0 ? 'Change Sentence Judgments...' : (request.exampleDocs.length > 0 ? 'Judge Sentences and Run Submission': <><Edit />&nbsp;Edit</>)}</Button>}
            </div>
        </div>
        <span className='request-details-heading'>Example Documents</span>
        <div className='task-details-example-docs'>
            {request.exampleDocs.length === 0 ? 
            'No example documents were added. Edit request to do so.' : 
            request.exampleDocs.map((doc) => <React.Fragment key={`${doc.docNumber}${openDocs[doc.docNumber-1]}`}>
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
                            <FormControl sx={{width: '225px'}}>
                                <InputLabel id={`select-label-${doc.docid}`}>Highlighting type</InputLabel>
                                <Select
                                    labelId={`select-label-${doc.docid}`}
                                    value={showHighlightedJudgments[doc.docNumber - 1] ? 1 : 0}
                                    label="Highlighting type"
                                    onChange={(e) => handleHighlightChange(doc.docNumber - 1, e.target.value as number)}
                                >
                                    <MenuItem value={0}>Highlighted Text</MenuItem>
                                    <MenuItem value={1}>Sentence Judgements</MenuItem>
                                </Select>
                            </FormControl>
                            {showHighlightedJudgments[doc.docNumber - 1] ? <Typography variant='body2'>
                                &nbsp;<span className='doc-highlight-P'>&nbsp;Perfect&nbsp;</span>
                                &nbsp;<span className='doc-highlight-E'>&nbsp;Excellent&nbsp;</span>
                                &nbsp;<span className='doc-highlight-G'>&nbsp;Good&nbsp;</span>
                                &nbsp;<span className='doc-highlight-F'>&nbsp;Fair&nbsp;</span>
                                &nbsp;<span className='doc-highlight-B'>&nbsp;Bad&nbsp;</span>
                            </Typography> : 
                            <Typography variant='body2'>
                                <span className='doc-highlight-selected-text'>&nbsp;Highlight&nbsp;</span>
                            </Typography>}
                        </>
                    } />
                    <CardContent>
                        {showHighlightedJudgments[doc.docNumber - 1] ? 
                        getHighlightedAnnotations(doc.docText, annotations.current.filter(row => row.docNumber === doc.docNumber)) :
                        getHighlightedSpan(doc.docText, doc.highlight, 'doc-highlight-text')}
                    </CardContent>
                </Card>}
            </React.Fragment>)}
        </div>
        {annotations.current.length > 0 && <>
            <span className='request-details-heading'>Sentence Judgments</span>
            <div className='task-details-annotations-table'>
                <TableContainer sx={{margin: '16px'}} component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{'& > *': { padding: '8px' }}}>
                                <TableCell><b>Sentence</b></TableCell>
                                <TableCell sx={{ width: '100px' }}><b>Judgment</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {(seeAllAnnotations ? annotations.current : annotationSummary).map((row, i) =>
                            <TableRow
                                key={`${i}${row.sentence}`}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& > *': { padding: '8px' } }}
                            >
                                <TableCell>{row.sentence}</TableCell>
                                <TableCell><span className={`doc-highlight-${row.judgment}`}>&nbsp;{AnnotationJudgmentNames[row.judgment]}&nbsp;</span></TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <Button variant='outlined' onClick={toggleSeeMore} className='task-details-annotation-see-more'>{seeAllAnnotations ? 'See Summary' : 'See All Judgments'}</Button>
        </>}
        <span className='request-details-heading'>Submissions</span>
        {submissions.length > 0 ? submissions.map(submission => <li key={submission.id}>
            <NavLink className={'request-details-submission-link'} to={`/submissions/${submission.id}`}>{(new Date(submission.when)).toLocaleString()} - Click to show hits</NavLink>
        </li>) : 'No submissions were created for this request.'}
        <hr className='request-details-hr'/>
    </div>;
};