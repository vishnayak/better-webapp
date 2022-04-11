import React from 'react';
import { getAllTasks, Tasks } from '@services/task-service';
import './TasksPage.css';
import { Request } from '@components/request/Request'
import { Button } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Grid } from '@mui/material';


export const TasksPage: React.FC<{}> = () => {
  const [open, setOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<Tasks[]>([]);

  const [openCreateNewTask, setOpenCreateNewTask] = React.useState(false);

  React.useEffect(() => {
    getAllTasks().then(res => {
      console.log(res)
      setTasks(res);
      // setIsLoading(false);
    }).catch(e => {
      // setIsError(true);
      // setIsLoading(false);
    });
  }, []);

  const activateBill = () => {
    setOpen(true);
  };
  const activateCreateNewTask = () => {
    setOpenCreateNewTask(true);
  };

  return (<TableContainer component={Paper}>
    <div className='tasks-page'>
      <h1>Tasks Dashboard</h1>
      {
        <TableContainer component={Paper}>
          {!open && !openCreateNewTask && (<div>
            <Table aria-label="collapsible table ">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell><b>Task Num</b></TableCell>
                  <TableCell align="right"><b>Task Title</b></TableCell>
                  <TableCell align="right"><b>Task Statement</b></TableCell>
                  <TableCell align="right"><b>Task Narrative</b></TableCell>
                  <TableCell align="right"><b>Task Docs</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  // <Row key={task.taskNum} row={task} />
                  <Request key = {task.taskNum} task={task} />
                ))}
              </TableBody>
            </Table>
            <Grid container>
              <Grid item xs={2} />
              <Grid item xs={3} >
                <Button onClick={activateBill} variant="contained">
                  Annotate phrases
                </Button>
              </Grid>
              <Grid item xs={3} >
                <Button href="/sentences" variant="contained">
                  Annotate Sentences
                </Button>
              </Grid>
              <Grid item xs={3} >
                <Button onClick={activateCreateNewTask} variant="contained">
                  Create New task
                </Button>
              </Grid>
              <Grid item xs={1} />
            </Grid>
            <hr />
          </div>)}
          {/* <div>
            {open && <Phrases data={data} />}
            <hr />
          </div> */}

        </TableContainer>
      }</div>

  </TableContainer>);
};