import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Grid } from '@mui/material';
import { Tasks } from '@services/task-service';
import { PhraseRequest } from '@components/request/PhraseRequest'



export interface PhrasesProps {
    tasks: Tasks[];
}

export const Phrases: React.FC<PhrasesProps> = ({ tasks }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div>
            <h1>Phrases Dashboard</h1>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Task Num</b></TableCell>
                            <TableCell><b>Task Title</b></TableCell>
                            <TableCell ><b>Task Statement</b></TableCell>
                            <TableCell><b>Task Narrative</b></TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task) => (
                            <PhraseRequest key={task.taskNum} task={task} />
                        ))}
                    </TableBody>
                </Table>
                <Grid container>
                    <Grid item xs={11} />
                    <Grid item xs={1} >
                        <Button href="/" variant="contained">
                            Back
                        </Button>
                    </Grid>
                </Grid>
            </TableContainer>
        </div>
    );
}