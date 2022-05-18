import React from 'react';
import { getAllTasks, Task } from '@services/task-service';
import './TasksPage.css';
import { Request } from '@components/request/TaskRequest'
import { Button } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import { TaskCreationWizard } from '@components/task-creation-wizard/TaskCreationWizard';


export const TasksPage: React.FC<{}> = () => {
  const [open, setOpen] = React.useState(false);
  const [openSentences, setOpenSentences] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>([]);

  const [openCreateNewTask, setOpenCreateNewTask] = React.useState(false);
  const [editingTaskId, setEditingTaskId] = React.useState<string | undefined>(undefined);

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

  const handleTaskCreationClick = () => {
    setOpenCreateNewTask(true);
  };

  const handleEdit = (taskNum: string) => {
    setEditingTaskId(taskNum);
  };

  const handleModalClose = () => {
    setOpenCreateNewTask(false)
    setEditingTaskId(undefined);
  };

  const handleTaskCreate = () => {
    fetchAllTasks();
    handleModalClose();
  };

  return (<TableContainer component={Paper}>
    <div className='tasks-page'>
      {
        <TableContainer component={Paper}>
          {!open && !openSentences && (<div>
            <h1>Tasks Dashboard</h1>
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
              onClose={handleModalClose}
            />}

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
                  <Request onEdit={() => handleEdit(task.taskNum)} key={task.taskNum} task={task} />
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