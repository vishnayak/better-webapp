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
import { SentencesFormDialog } from '@components/formDialog/SentencesFormDialog';
import { PhrasesFormDialog } from '@components/formDialog/PhrasesFormDialog';



interface RequestProps {
    task: Task;
}

export const Request: React.FC<RequestProps> = ({ task }) => {
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
                    <TableCell rowSpan={task.taskExampleDocs.length + 1}> <PhrasesFormDialog task={task} /></TableCell>
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
                                    {task.requests.map((historyRow) => (
                                        <Fragment>
                                            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                                
                                                <TableCell rowSpan={historyRow.exampleDocs.length + 1}>{historyRow.reqNum}</TableCell>
                                                <TableCell rowSpan={historyRow.exampleDocs.length + 1}>{historyRow.reqText}</TableCell>
                                                <TableCell rowSpan={historyRow.exampleDocs.length + 1}> <SentencesFormDialog taskNum={task.taskNum} reqNum={historyRow.reqNum} /></TableCell>
                                            </TableRow>
                                            {historyRow.exampleDocs.map(detail => (
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