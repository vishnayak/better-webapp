import { Card, CardContent, Link, Typography } from '@mui/material';
import { getTaskById, Task } from '@services/task-service';
import React from 'react';
import { useParams } from 'react-router-dom';
import './TaskDetails.css';

export const TaskDetails: React.FC<{}> = () => {
    const params = useParams();
    const [taskNum, setTaskNum] = React.useState<string>('');
    const [task, setTask] = React.useState<Task | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [openDocs, setOpenDocs] = React.useState<boolean[]>([]);
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
            setTask(res);
            const docOpenFlags = res.taskExampleDocs.map(d => false);
            setOpenDocs(docOpenFlags);
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const toggleDoc = (docNumber: number) => {
        setOpenDocs(prev => { 
            const next = prev;
            next[docNumber] = !next[docNumber];
            return next;
        });
    };

    const insertNewLines = (text: string) => {
        return <>{text.split('\n').map((t, index) => {
            if(index === 0) return <React.Fragment key={index}>{t}</React.Fragment>;
            else return <React.Fragment key={index}><br/>{t}</React.Fragment>;
        })}</>;
    }

    return <div className='task-details-page'>
        {task && <div className='task-details'>
            <span className='task-details-title'>{task.taskTitle}</span>
            <span className='task-details-stmt'>{task.taskStmt}</span>
            <span className='task-details-narr'>{task.taskNarr}</span>
            <span className='task-details-heading'>Example Documents</span>
            <div className='task-details-example-docs'>
                {task.taskExampleDocs.map((doc) => <>
                    <Link key={doc.docNumber} onClick={() => toggleDoc(doc.docNumber)}>Doc {doc.docNumber}{doc.highlight.length > 0 && `: ${doc.highlight}`}</Link>
                    {openDocs[doc.docNumber] && <Card>
                        <CardContent classes={{ root: 'search-hit-card-content' }}>
                            <Typography variant="body2">
                                {insertNewLines(doc.docText)}
                            </Typography>
                        </CardContent>
                    </Card>}
                </>)}
            </div>
        </div>}
    </div>;
};