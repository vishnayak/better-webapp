import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { Grid } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Annotation, getPhrasesForAnnotation, postPhrasesForAnnotation } from '@services/task-service';
import { Tasks } from '@services/task-service';
import Table from '@mui/material/Table';

import React from 'react';

export interface PhrasesFormDialogProps {
    task: Tasks;
}
function createTaskDoc(key: any, value: any) {
    return {
        key,
        value,
    };
}

export const PhrasesFormDialog: React.FC<PhrasesFormDialogProps> = ({ task }) => {
    const [open, setOpen] = React.useState(false);
    const [openConfirmation, setOpenConfirmation] = React.useState(false);

    const ratings: any[] = [];
    // const [mapPhrases, setMapPhrases] = React.useState<>([]);
    const [keys, setKeys] = React.useState([{
        key: '',
        value: ''
    }]);
    const handleCloseConfirmationPage = () => {
        setOpenConfirmation(false);
        setOpen(false);
    };
    function mapToObj(map:Map<string, Annotation>) {
        var obj:any = {}
        map.forEach(function (v, k) {
            obj[k] = v
        })
        return obj
    }
    const handleAnnotate = () => {
        var annotation: Annotation = {
            sentences: "",
            judgment: ""
        }, map = new Map();
        keys.map((k, index) => {
            annotation.sentences = k.value;
            annotation.judgment = ratings[index] == undefined? "" : ratings[index]
            map.set(k.key, annotation)
        });
        // console.log("map" + map);
        var json = JSON.stringify(mapToObj(map));
        console.log("json is " + json);
        
        postPhrasesForAnnotation(task.taskNum, json).then(res => {
            console.log('res' + res)
        }).catch(e => {
            console.log('error' + e)
        });

        setOpenConfirmation(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    function handleClickOpen() {
        setOpen(true);
    }
    const handleChange = (index: any) => (event: any) => {
        ratings[index] = event.target.value;
    };
    React.useEffect(() => {
        getPhrasesForAnnotation(task.taskNum).then(res => {
            const entries = Object.entries(JSON.parse(JSON.stringify(res)))
            const localKeys: any[] = [];

            entries.forEach(([key, value]) => {
                localKeys.push(createTaskDoc(key, (value as Annotation).sentences));
            });
            setKeys(localKeys)
        }).catch(e => {
        });
    }, []);

    return (
        <React.Fragment>
            <div>
                <Table>
                    <TableRow >
                        <TableCell>
                            <Button variant="contained" onClick={() => handleClickOpen()}>Annotate Phrases</Button>
                        </TableCell>
                    </TableRow>
                </Table>
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                    <DialogTitle>Judge Phrases</DialogTitle>
                    <DialogContent>
                        {keys.map((k, index) => (
                            <React.Fragment>
                                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                    <TableCell >{k.key}</TableCell>
                                    <TableCell >{k.value}</TableCell>
                                    <TableCell>
                                        <InputLabel id="demo-simple-select-label">Rating</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={ratings[index]}
                                            label="Rating"
                                            sx={{ minWidth: 180 }}
                                            onChange={handleChange(index)}
                                        >
                                            <MenuItem value={'P'}>Perfect</MenuItem>
                                            <MenuItem value={'E'}>Excellent Match</MenuItem>
                                            <MenuItem value={'G'}>Good Match</MenuItem>
                                            <MenuItem value={'F'}>Fair Match</MenuItem>
                                            <MenuItem value={'B'}>bad Match</MenuItem>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleAnnotate}>Submit</Button>
                        <Button onClick={handleClose}>Cancel</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openConfirmation} onClose={handleCloseConfirmationPage} fullWidth maxWidth="lg">
                    <DialogTitle>Confirmation</DialogTitle>
                    <DialogContent>
                        <Grid container>
                            <Grid item>
                                <Typography align="center">
                                    The annotations are submitted successfully. Please head to submissions page!
                                </Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmationPage}>Ok!</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </React.Fragment>
    );
}