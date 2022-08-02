import React from 'react';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { getAllTasks, Task } from '@services/task-service';
import { useNavigate } from 'react-router-dom';
import './TasksPage.css';

const columns: GridColDef[] = [
    {
        field: 'taskTitle',
        headerName: 'Task Title',
        minWidth: 400,
    },
    {
        field: 'taskStmt',
        headerName: 'Task Statement',
        flex: 1,
        minWidth: 350,
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

    return <div className='tasks-page'>
        {
            !isLoading ? (isError ? <div className='fallback-text'>Something went wrong, please try reloading the page.</div> :
                <>
                    <div className='tasks-page-header'>
                        <span className='tasks-page-title'>Tasks</span>
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
                </>)
            : <div className='fallback-text'>Loading...</div>
        }
    </div>;
};