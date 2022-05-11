import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import InputLabel from '@mui/material/InputLabel';
import { Grid } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Annotation, getPhrasesForAnnotation, postPhrasesForAnnotation } from '@services/task-service';
import { Tasks } from '@services/task-service';
import Table from '@mui/material/Table';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';

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
    const [openFullText, setOpenFullText] = React.useState(false);

    const [openConfirmation, setOpenConfirmation] = React.useState(false);

    const ratings: any[] = [];
    // const [mapPhrases, setMapPhrases] = React.useState<>([]);
    const [keys, setKeys] = React.useState([{
        key: '',
        value: ''
    }]);
    const [element, setElement] = React.useState([]);

    const handleCloseConfirmationPage = () => {
        setOpenConfirmation(false);
        setOpen(false);
    };
    function mapToObj(map: Map<string, Annotation>) {
        var obj: any = {}
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
            annotation.judgment = ratings[index] == undefined ? "" : ratings[index]
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
    const trimText = (text: string) => {
        var mySplitResult = text.split(" ");
        var n = mySplitResult.length - 1, i = 0;
        var finalString = "";
        while (i < 5 && n != 0) {
            var lastWord = mySplitResult[n]
            finalString = " " + lastWord + " " + finalString;
            i++;
            n--;
        }
        return finalString + "..";
    }
    const BoldedText = (text: string, shouldBeBold: string) => {
        const textArray = text.split(shouldBeBold);
        return (
            <span>
                {textArray.map((item, index) => (

                    <>
                        {trimText(item)}
                        {index !== textArray.length - 1 && (
                            <b>{shouldBeBold}</b>
                        )}
                    </>
                ))}
            </span>
        );
    }
    const BoldedText1 = (text: string, shouldBeBold: string) => {
        const textArray = text.split(shouldBeBold);
        return (
            <span>
                {textArray.map((item, index) => (

                    <>
                        {item}
                        {index !== textArray.length - 1 && (
                            <b>{shouldBeBold}</b>
                        )}
                    </>
                ))}
            </span>
        );
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
                                <React.Fragment>
                                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                        {/* <TableCell >{k.key}</TableCell> */}
                                        <TableCell>
                                            <IconButton
                                                aria-label="expand row"
                                                size="small"
                                                onClick={() => setOpenFullText(!openFullText)}
                                            >
                                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell >{BoldedText(k.value, k.key)}</TableCell>
                                        <TableCell>
                                            <InputLabel id="demo-simple-select-label">Rating</InputLabel>

                                            <RadioGroup
                                                row
                                                aria-labelledby="demo-row-radio-buttons-group-label"
                                                name="row-radio-buttons-group"
                                                sx={{ minWidth: 180 }}
                                                onChange={handleChange(index)}
                                            >
                                                <FormControlLabel value="P" control={<Radio />} label="Perfect" />
                                                <FormControlLabel value="E" control={<Radio />} label="Excellent Match" />
                                                <FormControlLabel value="G" control={<Radio />} label="Good Match" />
                                                <FormControlLabel value="F" control={<Radio />} label="Fair Match" />
                                                <FormControlLabel value="B" control={<Radio />} label="Bad Match" />
                                            </RadioGroup>
                                        </TableCell>
                                    </TableRow>

                                </React.Fragment>
                                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                        <Collapse in={openFullText} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1 }}>
                                                <Typography align="center">
                                                    {BoldedText1(k.value, k.key)}
                                                </Typography>
                                            </Box>
                                        </Collapse>
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