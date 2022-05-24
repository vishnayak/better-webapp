import { insertNewLines } from '@components/search-hit-card/SearchHitCard';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, Card, CardContent, Link, Typography } from '@mui/material';
import { Request } from '@services/task-service';
import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Submission, submitSubmission } from '@services/submission-service';
import { NavLink, useNavigate } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export interface RequestDetailsProps {
    request: Request;
    taskNum: string;
    submissions: Submission[];
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ request, taskNum, submissions: submissionsProp }) => {
    const [openDocs, setOpenDocs] = React.useState<boolean[]>(request.exampleDocs.map(d => false));
    const [isCreatingSubmission, setIsCreatingSubmission] = React.useState(false);
    
    const toggleDoc = (index: number) => {
        setOpenDocs(prev => {
            return [...prev.slice(0, index), !prev[index], ...prev.slice(index+1)];
        });
    };

    const handleHitsOpen = (submissionId: string) => {
        // navigate(`/submissions/${submissionId}`, );
        window.open(`/submissions/${submissionId}`, '_blank');
    };

    const handleSubmission = async () => {
        setIsCreatingSubmission(true);
        try {
            const id = (await submitSubmission({
                taskNum,
                reqNum: request.reqNum
            })).id;
            setIsCreatingSubmission(false);
            window.open(`/submissions/${id}`, '_blank');
        } catch(e) {
            setIsCreatingSubmission(false);
            console.error(e);
        }
    };

    const submissions = submissionsProp.sort((a,b) => a.when < b.when ? -1 : 1);

    return <div className={'request-details'}>
        <div className='request-details-text'>
            <ArrowForwardIcon sx={{mr: 2}} />
            <span>{request.reqText}</span>
            {submissions.length > 0 && <Button classes={{root: 'request-details-button'}} variant='outlined' onClick={() => handleHitsOpen(submissions[0].id)}>Show Hits &nbsp; <OpenInNewIcon /></Button>}
            {<Button classes={{root: 'request-details-button'}} disabled={isCreatingSubmission} variant='outlined' onClick={() => handleSubmission()}>Run New Submission &nbsp; <OpenInNewIcon /></Button>}
        </div>
        <span className='request-details-heading'>Example Documents</span>
        <div className='task-details-example-docs'>
            {request.exampleDocs.map((doc) => <React.Fragment key={`${doc.docNumber}${openDocs[doc.docNumber-1]}`}>
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
            <NavLink className={'request-details-submission-link'} to={`/submissions/${submission.id}`} target={'_blank'}>{(new Date(submission.when)).toLocaleString()} - Click to show hits &nbsp; <OpenInNewIcon /></NavLink>
        </li>) : 'No submissions were created for this request.'}
        <hr className='request-details-hr'/>
    </div>;
};