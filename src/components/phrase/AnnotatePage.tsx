import Button from '@mui/material/Button';
import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { AnnotationJudgment, Task } from '@services/task-service';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { Grid } from '@mui/material';
import Select from '@mui/material/Select';
import { Annotation, getPhrasesForAnnotation } from '@services/task-service';
import Typography from '@mui/material/Typography';


export interface AnnotatePageProps {
    task: Task;
}

export const AnnotatePage: React.FC<AnnotatePageProps> = ({ task }) => {
    const [open, setOpen] = React.useState(false);
    const ratings: any[] = [];
    // const [mapPhrases, setMapPhrases] = React.useState<>([]);
    const [keys, setKeys] = React.useState([{
        key: '',
        value: ''
    }]);
    const handleAnnotate = () => {
        let annotation: Annotation = {
            sentences: "",
            judgment: AnnotationJudgment.NONE
        }, map = new Map();
        keys.map((k, index) => {
            annotation.sentences = k.value;
            annotation.judgment = ratings[index]
            map.set(k.key, annotation)
        });
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleChange = (index: any) => (event: any) => {
        ratings[index] = event.target.value;
    };
    React.useEffect(() => {
        getPhrasesForAnnotation(task.taskNum).then(res => {
            setKeys(res);
        }).catch(e => {
        });
    }, []);


    return (
        <React.Fragment>

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
            <Grid container>
                <Grid item xs={1} />
                <Grid item xs={5} style={{ display: "flex", gap: "1rem" }}>
                    <Button variant="contained" onClick={handleClose}>Cancel</Button>
                </Grid>
                <Grid item xs={5} style={{ display: "flex", gap: "1rem" }}>
                    <Button variant="contained" onClick={handleAnnotate}>Anotate</Button>
                </Grid>
                <Grid item xs={1} />
            </Grid>
            {open && (<Grid container>
                <Grid item>
                    <Typography align="center">
                        The annotations are submitted successfully. Please head to submissions page!
                    </Typography>
                </Grid>
            </Grid>)}
        </React.Fragment>
    );
}