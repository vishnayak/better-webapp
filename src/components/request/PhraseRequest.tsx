import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Fragment } from "react";
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import {Tasks} from '@services/task-service';
import TableHead from '@mui/material/TableHead';
import {AnnotatePage} from '@components/phrase/AnnotatePage'



interface PhraseRequestProps {
    task: Tasks;
}

export const PhraseRequest: React.FC<PhraseRequestProps> = ({ task }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell component="th" scope="row">
                        {task.taskNum}
                    </TableCell>
                    <TableCell align="right" >{task.taskTitle}</TableCell>
                    <TableCell align="right" >{task.taskStmt}</TableCell>
                    <TableCell align="right" >{task.taskNarr}</TableCell>
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            <b>Annotate this task</b>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                </TableRow>

            </Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <TableContainer component={Paper}>
                            <Table aria-label="collapsible table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell ><b>Phrases</b></TableCell>
                                        <TableCell ><b>Sentences</b></TableCell>
                                        <TableCell><b>Rating</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                <AnnotatePage key={task.taskNum} task={task} />
                                    
                                    {/* <Row1 key={keys.name} keys={keys} taskNum={task.taskNum} /> */}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Collapse>
                </TableCell>
            </TableRow>

        </React.Fragment>
    );
}