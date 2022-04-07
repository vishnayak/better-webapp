import React from 'react';
import { getAllTasks, Tasks } from '@services/task-service';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import './TasksPage.css';
import { FormDialog } from '@components/formDialog/FormDialog';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Submission } from '@services/query-service';


const columns: GridColDef[] = [
  {
    field: 'taskNum',
    headerName: 'Task Num',
    width: 100,
  },
  {
    field: 'taskTitle',
    headerName: 'Task Title',
    width: 100,
  },
  {
    field: 'taskStmt',
    headerName: 'Task Statement',
    width: 200
  },
  {
    field: 'taskNarr',
    headerName: 'Task Narrative',
    description: 'Narrative of the task',
    width: 450,
  },
  {
    field: 'Docs',
    headerName: 'Documents',
    renderCell: (params) => {
      const sub = params.row as Tasks;
      return (

        sub.taskExampleDocs.map(taskExampleDoc => (
          <TableRow >
            <TableCell style={{ width: 50 }}>
              <FormDialog taskDoc={taskExampleDoc} />
            </TableCell>
          </TableRow>
        ))
      );
    },
    width: 100,
    flex: 1,
    sortable: false,
    filterable: false,
    disableExport: true,
  },
  {
    field: 'actions',
    headerName: 'Actions',
    renderCell: (params) => {
      return <Link className={'link-text'} to={`/hits/${(params.row as Submission).id}`}>
        <Button variant={'outlined'}>
          Open Requests
        </Button>
      </Link>
    },
    flex: 1,
    sortable: false,
    filterable: false,
    disableExport: true,
  }
];

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export const TasksPage: React.FC<{}> = () => {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [tasks, setTasks] = React.useState<Tasks[]>([]);

  React.useEffect(() => {
    getAllTasks().then(res => {
      console.log(res)
      setTasks(res); setIsLoading(false);
    }).catch(e => {
      setIsError(true);
      setIsLoading(false);
    });
  }, []);
  return <div className='tasks-page'>
    <h1>Tasks Dashboard</h1>
    {
      !isLoading ? isError ? <div className='fallback-text'>Something went wrong, please try reloading the page.</div> :
        <DataGrid
          rows={tasks}
          columns={columns}
          getRowId={(row) => row.taskNum}
          rowsPerPageOptions={[10, 20, 50]}
          rowHeight={20}
          initialState={{
            sorting: {
              sortModel: [{ field: 'when', sort: 'desc' }],
            },
          }}
          components={{
            Toolbar: CustomToolbar
          }}
          disableSelectionOnClick
        />
        : <div className='fallback-text'>Loading...</div>
    }</div>;
};