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
    const [selectedTaskNum, setSelectedTaskNum] = React.useState<string | undefined>(undefined); 
    const [selectedReqNum, setSelectedReqNum] = React.useState<string | undefined>(undefined); 

    React.useEffect(() => {
        const getData = async () => {
            try {
                const allTasks = await getAllTasks();
                const options = allTasks.reduce((prev, task) => ({ ...prev, [task.taskNum]: task.taskTitle }), {});
                setTaskMap(options);
                const requestMap = allTasks.reduce((prev, task) => {
                    const curr = task.requests.map(request => {
                        return {
                            label: request.reqText,
                            id: request.reqNum
                        };
                    });
                    return { ...prev, [task.taskNum]: curr };
                }, {});
                setTaskRequestMap(requestMap);
            } catch(e) {
                console.log('An error occurred.');
            }
        };
        getData();
    }, []);
    
    const handleCreation = () => {
        if(selectedTaskNum && selectedReqNum) {
            submitSubmission({
                taskNum: selectedTaskNum,
                reqNum: selectedReqNum
            }).then(res => {
                onCreate(res.id);
            });
        }
    }
    
    return <div className='submission-creation-fields'>
        <Autocomplete
            value={selectedTaskNum || null}
            disablePortal
            options={Object.keys(taskMap).sort()}
            getOptionLabel={t => taskMap[t]}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField label={'Task Name'} {...params} />}
            onChange={(event, val) => setSelectedTaskNum(val || undefined)}
        />
        <Autocomplete
            value={selectedReqNum || null}
            onChange={(event, val) => setSelectedReqNum(val || undefined)}
            disablePortal
            disabled={!selectedTaskNum}
            options={selectedTaskNum ? taskRequestMap[selectedTaskNum].map(request => request.id) : []}
            getOptionLabel={val => {
                const matchedRequestOption = (taskRequestMap[selectedTaskNum!])!.find(option => option.id === val);
                return matchedRequestOption?.label?.length! > 0 ? matchedRequestOption!.label : val;
            }}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField label={'Request Name'} {...params} />}
        />
        <Button classes={{root: 'submission-creation-create-button'}} disabled={!(selectedTaskNum && selectedReqNum)} onClick={handleCreation} variant={'contained'}>Create</Button>
    </div>;
};
