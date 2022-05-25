import { insertNewLines } from '@components/search-hit-card/SearchHitCard';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Card, CardContent, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { AnnotationJudgement, AnnotationJudgementNames, getSentencesForAnnotation, Request } from '@services/task-service';
import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Submission, submitSubmission } from '@services/submission-service';
import { NavLink, useNavigate } from 'react-router-dom';


export interface RequestDetailsProps {
    request: Request;
    taskNum: string;
    submissions: Submission[];
    onReannotate: () => void;
}

interface SentenceAnnotationRow {
    docNumber: number;
    sentence: string;
    judgment: AnnotationJudgement;
}

const getAnnotationRows = (allAnnotations: SentenceAnnotationRow[]) => {
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

export const RequestDetails: React.FC<RequestDetailsProps> = ({ request, taskNum, submissions: submissionsProp, onReannotate }) => {
    const navigate = useNavigate();
    const [openDocs, setOpenDocs] = React.useState<boolean[]>(request.exampleDocs.map(d => false));
    const [annotationSummary, setAnnotationSummary] = React.useState<SentenceAnnotationRow[]>([]);
    const annotations = React.useRef<SentenceAnnotationRow[]>([]);
    const [seeAllAnnotations, setSeeAllAnnotations] = React.useState(false);

    React.useEffect(() => {
        fetchSentences();
    }, []);

    const fetchSentences = async () => {
        const res = await getSentencesForAnnotation(taskNum, request.reqNum);
        const allAnnotations: SentenceAnnotationRow[] = res.request.exampleDocs.flatMap(doc => doc.sentences.map(sent => ({
            docNumber: doc.docNumber,
            sentence: sent.sentence,
            judgment: sent.judgment as AnnotationJudgement,
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
                {<Button classes={{root: 'request-details-button'}} variant='outlined' onClick={onReannotate}>{submissions.length > 0 ? 'Reannotate...' : 'Annotate and Run Submission'}</Button>}
            </div>
        </div>
        <span className='request-details-heading'>Example Documents</span>
        <div className='task-details-example-docs'>
            {request.exampleDocs.length === 0 ? 
            'No example documents were added. Edit task to do so.' : 
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
            <span className='request-details-heading'>Phrase Annotations</span>
            <div className='task-details-annotations-table'>
                <TableContainer sx={{margin: '16px'}} component={Paper}>
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
                                key={row.sentence}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& > *': { padding: '8px' } }}
                            >
                                <TableCell>{row.sentence}</TableCell>
                                <TableCell>{AnnotationJudgementNames[row.judgment]}</TableCell>
                                {/* <TableCell>{row.sentence}</TableCell> */}
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <Button variant='text' onClick={toggleSeeMore} className='task-details-annotation-see-more'>{seeAllAnnotations ? 'See Summary' : 'See All'}</Button>
        </>}
        <span className='request-details-heading'>Submissions</span>
        {submissions.length > 0 ? submissions.map(submission => <li key={submission.id}>
            <NavLink className={'request-details-submission-link'} to={`/submissions/${submission.id}`}>{(new Date(submission.when)).toLocaleString()} - Click to show hits</NavLink>
        </li>) : 'No submissions were created for this request.'}
        <hr className='request-details-hr'/>
    </div>;
};