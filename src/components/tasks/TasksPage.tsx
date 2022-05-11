import React from 'react';
import { getAllTasks, Task } from '@services/task-service';
import './TasksPage.css';
import { Phrases } from '@components/phrase/Phrases';
import { Request } from '@components/request/TaskRequest'
import { Button } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Grid } from '@mui/material';
import { Sentences } from '@components/sentences/Sentences';
import { TaskCreationWizard } from '@components/task-creation-wizard/TaskCreationWizard';


export const TasksPage: React.FC<{}> = () => {
  const [open, setOpen] = React.useState(false);
  const [openSentences, setOpenSentences] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>([]);

  const [openCreateNewTask, setOpenCreateNewTask] = React.useState(false);

  React.useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const res = await getAllTasks();
      setTasks(res);
    } catch (e) {
      console.error(e);
    }
  };

  const activateBill = () => {
    setOpen(true);
  };
  const activateSentencesAnnotation = () => {
    setOpenSentences(true);
  };
  const activateCreateNewTask = () => {
    setOpenCreateNewTask(true);
  };

  return (<TableContainer component={Paper}>
    <div className='tasks-page'>
      <TaskCreationWizard onCreate={fetchAllTasks} isOpen={openCreateNewTask} onClose={() => setOpenCreateNewTask(false)}/>

      {
        <TableContainer component={Paper}>
          {!open && !openSentences && (<div>
            <h1>Tasks Dashboard</h1>
            <Table aria-label="collapsible table ">
              <TableHead>
                <TableRow>
                  <TableCell />
                  {/* <TableCell><b>Task Num</b></TableCell> */}
                  <TableCell align="center"><b>Task Title</b></TableCell>
                  <TableCell align="center"><b>Task Statement</b></TableCell>
                  <TableCell align="center"><b>Task Narrative</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                  <TableCell align="center"><b>Task Documents</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <Request key={task.taskNum} task={task} />
                ))}
              </TableBody>
            </Table>
            {/* <Grid container>
              <Grid item xs={2} />
              <Grid item xs={3} >
                <Button onClick={activateBill} variant="contained">
                  Annotate phrases
                </Button>
              </Grid>
              <Grid item xs={3} >
                <Button onClick={activateSentencesAnnotation} variant="contained">
                  Annotate Sentences
                </Button>
              </Grid>
              <Grid item xs={3} >
                <Button onClick={activateCreateNewTask} variant="contained">
                  Create New task
                </Button>
              </Grid>
              <Grid item xs={1} />
            </Grid> */}
            {/* <hr /> */}
          </div>)}
          {/* <div>
            {open && <Phrases tasks={tasks} />}
            <hr />
          </div>
          <div>
            {openSentences && <Sentences tasks={tasks} />}
            <hr />
          </div> */}

        </TableContainer>
      }</div>

  </TableContainer>);
};