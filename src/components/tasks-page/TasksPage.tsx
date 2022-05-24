import React from 'react';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { getAllTasks, Task } from '@services/task-service';
import { useNavigate } from 'react-router-dom';
import './TasksPage.css';
import { Button } from '@mui/material';
import { TaskCreationWizard } from '@components/task-creation-wizard/TaskCreationWizard';
import { RequestWizard } from '@components/request-creation-wizard/RequestWizard';
import AddIcon from '@mui/icons-material/Add';

const columns: GridColDef[] = [
    {
        field: 'taskTitle',
        headerName: 'Task Title',
        width: 500,
    },
    {
        field: 'taskStmt',
        headerName: 'Task Statement',
        width: 800,
        cellClassName: 'task-statement-text'
    },
    {
        field: 'numRequests',
        headerName: 'No. of Requests',
        width: 150,
    }
];

interface TaskRow extends Task {
    numRequests: number;
    numExampleDocs: number;
};

function CustomToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarExport />
        </GridToolbarContainer>
    );
};

export const TasksPage: React.FC<{}> = () => {
    const [allTasks, setAllTasks] = React.useState<TaskRow[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isError, setIsError] = React.useState<boolean>(false);

    const [openCreateNewTask, setOpenCreateNewTask] = React.useState(false);
    const [openCreateNewRequest, setOpenCreateNewRequest] = React.useState(false);
    const [editingTaskId, setEditingTaskId] = React.useState<string | undefined>(undefined);
    const [editingRequestId, setEditingRequestId] = React.useState<string | undefined>(undefined);
    const [requestModalParentTask, setRequestModalParentTask] = React.useState<Task | undefined>(undefined);

    const navigate = useNavigate();
    React.useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const tasks = await getAllTasks();
            const rows: TaskRow[] = tasks.map(t => ({
                ...t,
                numRequests: t.requests.length,
                numExampleDocs: t.taskExampleDocs.length,
            })); 
            setAllTasks(rows);
            setIsLoading(false);
        } catch(e) {
            console.error(e);
            setIsError(true);
            setIsLoading(false);
        }
    };

    const handleTaskClick = (taskNum: string) => {
        navigate(`/tasks/${taskNum}`)
    };

    const handleTaskCreationClick = () => {
        setOpenCreateNewTask(true);
      };
    
      const handleEdit = (taskNum: string) => {
        setEditingTaskId(taskNum);
      };
    
      const handleTaskModalClose = () => {
        setOpenCreateNewTask(false)
        setEditingTaskId(undefined);
      };
    
      const handleTaskCreate = () => {
        fetchTasks();
        handleTaskModalClose();
      };
    
      const handleRequestModalClose = () => {
        setOpenCreateNewRequest(false)
        setEditingTaskId(undefined);
        setRequestModalParentTask(undefined);
      };
    
      const handleCreateRequestClick = (task: Task) => {
        setRequestModalParentTask(task);
        setOpenCreateNewRequest(true);
      };
    
      const handleRequestCreate = () => {
        fetchTasks();
        handleRequestModalClose();
      };
    
      const handleEditRequestClick = (task: Task, reqNum: string) => {
        setRequestModalParentTask(task);
        setEditingRequestId(reqNum);
      };

    return <div className='tasks-page'>
        {
            !isLoading ? isError ? <div className='fallback-text'>Something went wrong, please try reloading the page.</div> :
                <>
                    <div className='tasks-page-header'>
                        <span className='tasks-page-title'>Tasks</span>
                        <Button 
                            onClick={handleTaskCreationClick} 
                            variant={'contained'} 
                            classes={{root: 'tasks-page-creation-button'}}
                        >
                            {<><AddIcon /> Create a Task</>}
                        </Button>
                        {(openCreateNewTask || editingTaskId) && <TaskCreationWizard 
                            taskNum={editingTaskId} 
                            onCreate={handleTaskCreate} 
                            isOpen={openCreateNewTask || (editingTaskId !== undefined)} 
                            onClose={handleTaskModalClose}
                        />}
                        {((openCreateNewRequest || editingRequestId) && requestModalParentTask) && <RequestWizard 
                            task={requestModalParentTask} 
                            requestNum={editingRequestId}
                            onCreate={handleRequestCreate} 
                            isOpen={openCreateNewRequest || (editingRequestId !== undefined)} 
                            onClose={handleRequestModalClose}
                        />}
                    </div>
                    <DataGrid
                        rows={allTasks}
                        columns={columns}
                        getRowId={(row) => (row as TaskRow).taskNum}
                        rowsPerPageOptions={[10, 20, 50]}
                        components={{
                            Toolbar: CustomToolbar
                        }}
                        rowHeight={36}
                        disableSelectionOnClick
                        onRowClick={(params) => handleTaskClick(params.id as string)}
                        sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
                    />
                </>
            : <div className='fallback-text'>Loading...</div>
        }
    </div>;
};