import Heading from '@components/heading/Heading';
import { insertNewLines } from '@components/search-hit-card/SearchHitCard';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Card, CardContent, Link, Typography } from '@mui/material';
import { getSubmissionsByTaskNum, Submission } from '@services/submission-service';
import { getTaskById, Task } from '@services/task-service';
import React from 'react';
import { useParams } from 'react-router-dom';
import { RequestDetails } from './RequestDetails';
import './TaskDetails.css';

export const TaskDetails: React.FC<{}> = () => {
    const params = useParams();
    const [taskNum, setTaskNum] = React.useState<string>('');
    const [task, setTask] = React.useState<Task | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [openDocs, setOpenDocs] = React.useState<boolean[]>([]);
    const [submissionMap, setSubmissionMap] = React.useState<Record<string, Submission[]>>({});
    React.useEffect(() => {
        setTaskNum(params.taskNum as string);
    }, []);
    
    React.useEffect(() => {
        if(taskNum !== '') {
            refreshTask();
        }
    }, [taskNum]);

    const refreshTask = async () => {
        try {
            const res = await getTaskById(taskNum);
            const submissions = await getSubmissionsByTaskNum(taskNum);
            const map: Record<string, Submission[]> = {};
            submissions.forEach(submission => {
                map[submission.reqNum] = [...(map[submission.reqNum] || []), submission];
            });
            setSubmissionMap(map);
            setTask(res);
            const docOpenFlags = res.taskExampleDocs.map(d => false);
            setOpenDocs(docOpenFlags);
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

    // TODO: Loading and error states

    return <div className='task-details-page'>
        {!isLoading && task && <div className='task-details'>
            <Heading headingText='Task Overview' />
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

            <Heading headingText='Requests' />
            {task.requests.map(req => <RequestDetails key={req.reqNum} taskNum={taskNum} request={req} submissions={submissionMap[req.reqNum] || []} />)}
        </div>}
    </div>;
};