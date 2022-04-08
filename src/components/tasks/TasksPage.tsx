import React from 'react';
import { getAllTasks, Tasks } from '@services/task-service';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import './TasksPage.css';
import { FormDialog } from '@components/formDialog/FormDialog';
import {Request} from '@components/request/Request'
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Submission } from '@services/query-service';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Fragment } from "react";
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TextareaAutosize from '@mui/material/TextareaAutosize';
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
                  <Request task={task} />
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

        </TableContainer>
      }</div>

  </TableContainer>);
};