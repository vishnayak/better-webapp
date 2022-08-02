import React from 'react';
import { Autocomplete, Button, TextField } from '@mui/material';
import {getAllTasks} from '@services/task-service';
import './SubmissionCreation.css';
import { submitSubmission } from '@services/submission-service';

interface TaskOptionDetail {
    taskNum: string;
    taskTitle: string;
    taskStmt: string;
    taskNarr: string;
};

interface TaskOption {
    label: string;
    id: string;
    taskDetail: TaskOptionDetail;
};

interface RequestOption {
    label: string;
    id: string;
};

export interface SubmissionCreationProps {
    onCreate: (id: string) => void;
};

export const SubmissionCreation: React.FC<SubmissionCreationProps> = ({ onCreate }) => {
    const [taskMap, setTaskMap] = React.useState<Record<string, string>>({});
    const [taskRequestMap, setTaskRequestMap] = React.useState<Record<string, RequestOption[]>>({});
    const [selectedTaskNum, setSelectedTaskNum] = React.useState<string | undefined>(''); 
    const [selectedReqNum, setSelectedReqNum] = React.useState<string | undefined>(''); 
    const [isCreating, setIsCreating] = React.useState(false);

    React.useEffect(() => {
        const getData = async () => {
            try {
                const allTasks = await getAllTasks();
                const options: Record<string, string> = allTasks.reduce((prev, task) => ({ 
                    ...prev, 
                    [task.taskNum]: task.taskTitle.length === 0 ? task.taskNum : task.taskTitle 
                }), {});
                options[''] = 'All Tasks';
                setTaskMap(options);
                const requestMap: any = allTasks.reduce((prev, task) => {
                    const curr: any[] = task.requests.map(request => {
                        return {
                            label: request.reqText,
                            id: request.reqNum
                        };
                    });
                    curr.push({
                        label: 'All Requests',
                        id: ''
                    });
                    return { ...prev, [task.taskNum]: curr };
                }, {});
                requestMap[''] = [{
                    label: 'All Requests',
                    id: ''
                }];
                setTaskRequestMap(requestMap);
            } catch(e) {
                console.log('An error occurred.');
            }
        };
        getData();
    }, []);
    
    const handleCreation = () => {
        if(selectedTaskNum !== undefined && selectedReqNum !== undefined) {
            setIsCreating(true);
            submitSubmission({
                taskNum: selectedTaskNum,
                reqNum: selectedReqNum
            }).then(res => {
                setIsCreating(false);
                onCreate(res.id);
            });
        }
    }
    
    return Object.keys(taskRequestMap).length > 0 ? <div className='submission-creation-fields'>
        <Autocomplete
            value={selectedTaskNum}
            disablePortal
            options={Object.keys(taskMap).sort()}
            getOptionLabel={t => taskMap[t]}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField label={'Task Name'} {...params} />}
            onChange={(event, val) => setSelectedTaskNum(val !== null ? val : undefined)}
        />
        <Autocomplete
            value={selectedReqNum}
            onChange={(event, val) => setSelectedReqNum(val !== null ? val : undefined)}
            disablePortal
            disabled={selectedTaskNum === undefined}
            options={selectedTaskNum ? taskRequestMap[selectedTaskNum].map(request => request.id) : []}
            getOptionLabel={val => {
                const matchedRequestOption = (taskRequestMap[selectedTaskNum!])!.find(option => option.id === val);
                return matchedRequestOption?.label?.length! > 0 ? matchedRequestOption!.label : val;
            }}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField label={'Request Name'} {...params} />}
        />
        <Button classes={{root: 'submission-creation-create-button'}} disabled={(selectedTaskNum === undefined || selectedReqNum === undefined) || isCreating} onClick={handleCreation} variant={'contained'}>
            {isCreating ? 'Creating...' : 'Create'}
        </Button>
    </div> : <div className='fallback-text'>Loading...</div>;
};
