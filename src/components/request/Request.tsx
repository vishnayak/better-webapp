import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Box from '@mui/material/Box';
import { Fragment } from "react";
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { Link } from 'react-router-dom';
import { Submission } from '@services/query-service';
import { FormDialog } from '@components/formDialog/FormDialog';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { getAllTasks, Tasks } from '@services/task-service';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


interface RequestProps {
    task: Tasks;
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
                    <TableCell component="th" scope="row" rowSpan={task.taskExampleDocs.length + 1}>
                        {task.taskNum}
                    </TableCell>
                    <TableCell align="right" rowSpan={task.taskExampleDocs.length + 1}>{task.taskTitle}</TableCell>
                    <TableCell align="right" rowSpan={task.taskExampleDocs.length + 1}>{task.taskStmt}</TableCell>
                    <TableCell align="right" rowSpan={task.taskExampleDocs.length + 1}>{task.taskNarr}</TableCell>
                </TableRow>
                {task.taskExampleDocs.map(detail => (
                    <TableRow >
                        <TableCell style={{ width: 150 }}>
                            <FormDialog taskDoc={detail} />
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
                                        <TableCell><b>Request Docs</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {task.requests.map((historyRow) => (
                                        <Fragment>
                                            <TableRow>
                                                <TableCell rowSpan={historyRow.exampleDocs.length + 1}>
                                                    {historyRow.reqNum}
                                                </TableCell>
                                                <TableCell rowSpan={historyRow.exampleDocs.length + 1}>
                                                    {historyRow.reqText}</TableCell>
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