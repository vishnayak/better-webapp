import { insertNewLines } from '@components/search-hit-card/SearchHitCard';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Card, CardContent, Link, Typography } from '@mui/material';
import { Request } from '@services/task-service';
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

export const RequestDetails: React.FC<RequestDetailsProps> = ({ request, taskNum, submissions: submissionsProp, onReannotate }) => {
    const navigate = useNavigate();
    const [openDocs, setOpenDocs] = React.useState<boolean[]>(request.exampleDocs.map(d => false));
    const [isCreatingSubmission, setIsCreatingSubmission] = React.useState(false);
    
    const toggleDoc = (index: number) => {
        setOpenDocs(prev => {
            return [...prev.slice(0, index), !prev[index], ...prev.slice(index+1)];
        });
    };

    const handleHitsOpen = (submissionId: string) => {
        navigate(`/submissions/${submissionId}`);
    };

    const submissions = submissionsProp.sort((a,b) => a.when > b.when ? -1 : 1);

    return <div className={'request-details'}>
        <div className='request-details-row'>
            <div className='request-details-text'>
                <ArrowForwardIcon sx={{mr: 2}} />
                <span>{request.reqText}</span>
            </div>
            <div>
                {submissions.length > 0 && <Button classes={{root: 'request-details-button'}} variant='outlined' onClick={() => handleHitsOpen(submissions[0].id)}>Show Hits</Button>}
                {<Button classes={{root: 'request-details-button'}} disabled={isCreatingSubmission} variant='outlined' onClick={onReannotate}>{submissions.length > 0 ? 'Reannotate...' : 'Annotate and Run Submission'}</Button>}
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
        <span className='request-details-heading'>Submissions</span>
        {submissions.length > 0 ? submissions.map(submission => <li key={submission.id}>
            <NavLink className={'request-details-submission-link'} to={`/submissions/${submission.id}`}>{(new Date(submission.when)).toLocaleString()} - Click to show hits</NavLink>
        </li>) : 'No submissions were created for this request.'}
        <hr className='request-details-hr'/>
    </div>;
};