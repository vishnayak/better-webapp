import React from 'react';
import { Autocomplete, Button, TextField } from '@mui/material';
import {getAllTasks} from '@services/task-service';
import './QueryCreation.css';
import { submitQuery } from '@services/query-service';

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

export interface QueryCreationProps {
    onCreate: (id: string) => void;
};

export const QueryCreation: React.FC<QueryCreationProps> = ({ onCreate }) => {
    const [taskMap, setTaskMap] = React.useState<Record<string, string>>({});
    const [taskRequestMap, setTaskRequestMap] = React.useState<Record<string, RequestOption[]>>({});
    const [selectedTaskId, setSelectedTaskId] = React.useState<string | undefined>(undefined); 
    const [selectedRequestId, setSelectedRequestId] = React.useState<string | undefined>(undefined); 

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
        if(selectedTaskId && selectedRequestId) {
            submitQuery({
                taskId: selectedTaskId,
                requestId: selectedRequestId
            }).then(res => {
                onCreate(res.id);
            });
        }
    }
    
    return <div className='query-creation-fields'>
        <Autocomplete
            value={selectedTaskId || null}
            disablePortal
            options={Object.keys(taskMap).sort()}
            getOptionLabel={t => taskMap[t]}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField label={'Task Name'} {...params} />}
            onChange={(event, val) => setSelectedTaskId(val || undefined)}
        />
        <Autocomplete
            value={selectedRequestId || null}
            onChange={(event, val) => setSelectedRequestId(val || undefined)}
            disablePortal
            disabled={!selectedTaskId}
            options={selectedTaskId ? taskRequestMap[selectedTaskId].map(request => request.id) : []}
            getOptionLabel={val => {
                const matchedRequestOption = (taskRequestMap[selectedTaskId!])!.find(option => option.id === val);
                return matchedRequestOption?.label?.length! > 0 ? matchedRequestOption!.label : val;
            }}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField label={'Request Name'} {...params} />}
        />
        <Button classes={{root: 'query-creation-create-button'}} disabled={!(selectedTaskId && selectedRequestId)} onClick={handleCreation} variant={'contained'}>Create</Button>
    </div>;
};
