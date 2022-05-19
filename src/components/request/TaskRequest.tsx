import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import { Fragment } from "react";
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { FormDialog } from '@components/formDialog/FormDialog';
import {Task } from '@services/task-service';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Button } from '@mui/material';

import './TaskRequest.css';


interface RequestProps {
    task: Task;
    onEdit: () => void;
    onAddRequest: () => void;
    onEditRequest: (reqNum: string) => void;
}

export const Request: React.FC<RequestProps> = ({ task, onEdit, onEditRequest, onAddRequest }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell rowSpan={task.taskExampleDocs.length + 1}>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    {/* <TableCell component="th" scope="row" rowSpan={task.taskExampleDocs.length + 1}>
                        {task.taskNum}
                    </TableCell> */}
                    <TableCell rowSpan={task.taskExampleDocs.length + 1}>{task.taskTitle}</TableCell>
                    <TableCell rowSpan={task.taskExampleDocs.length + 1}>{task.taskStmt}</TableCell>
                    <TableCell rowSpan={task.taskExampleDocs.length + 1}>{task.taskNarr}</TableCell>
                    <TableCell rowSpan={task.taskExampleDocs.length + 1}> 
                        <Button variant={'contained'} classes={{root: 'task-action-button'}} onClick={onEdit}>Edit</Button>
                        <Button variant={'outlined'} classes={{root: 'task-action-button'}} onClick={onAddRequest}>Add Request</Button>
                    </TableCell>
                </TableRow>
                {/* <TableCell align="left" style={{ width: 150 }}> */}
                {task.taskExampleDocs.map(detail => (
                    <TableRow >
                        <TableCell style={{ width: 150 }}>
                            <FormDialog taskDoc={detail} />
                            {/* <PhrasesFormDialog task={task} /> */}
                        </TableCell>
                    </TableRow>
                ))}

            </Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>

                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><b>Request Number</b></TableCell>
                                        <TableCell><b>Request Text</b></TableCell>
                                        <TableCell><b>Actions</b></TableCell>
                                        <TableCell><b>Request Docs</b></TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {task.requests.map((requestItem) => (
                                        <Fragment>
                                            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                                
                                                <TableCell rowSpan={requestItem.exampleDocs.length + 1}>{requestItem.reqNum}</TableCell>
                                                <TableCell rowSpan={requestItem.exampleDocs.length + 1}>{requestItem.reqText}</TableCell>
                                                <TableCell rowSpan={requestItem.exampleDocs.length + 1}><Button onClick={() => {onEditRequest(requestItem.reqNum)}}>Edit</Button></TableCell>
                                            </TableRow>
                                            {requestItem.exampleDocs.map(detail => (
                                                <TableRow >
                                                    <TableCell style={{ width: 150 }}>
                                                        <FormDialog taskDoc={detail} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </React.Fragment>
    );
}