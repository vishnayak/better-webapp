import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { postSentencesForAnnotation, getSentencesForAnnotation, Sentences, SentencesAnnotation } from '@services/task-service';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { Grid } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import React from 'react';

interface SentencesFormDialogProps {
    taskNum: string;
    reqNum: string
}


export const SentencesFormDialog: React.FC<SentencesFormDialogProps> = ({ taskNum, reqNum }) => {
    const [open, setOpen] = React.useState(false);
    const [openConfirmation, setOpenConfirmation] = React.useState(false);


    const [sentencesAnnotation, setSentencesAnnotation] = React.useState<SentencesAnnotation>();
    const [sentences, setSentences] = React.useState<Sentences[]>([]);

    function handleClickOpen(sentences: Sentences[]) {
        setOpen(true);
        setSentences(sentences)
    }

    const handleClose = () => {
        setOpen(false);
    };
    const handleCloseConfirmationPage = () => {
        setOpenConfirmation(false);
        setOpen(false);
    };

    const handleChange = (index: any) => (event: any) => {
        sentences[index].judgement = event.target.value;
    };

    React.useEffect(() => {
        getSentencesForAnnotation(taskNum, reqNum).then(res => {
            setSentencesAnnotation(res)
        }).catch(e => {
        });
    }, []);

    const handleAnnotate = () => {

        postSentencesForAnnotation(taskNum, reqNum, sentencesAnnotation!).then(res => {
            console.log('res' + res)
        }).catch(e => {
            console.log('error' + e)
        });

        setOpenConfirmation(true);

    };
    return (
        <React.Fragment>
            <div>
                {sentencesAnnotation?.request.exampleDocs.map(exampleDoc => (
                    <TableRow >
                        <TableCell>
                            <Button variant="contained" onClick={() => handleClickOpen(exampleDoc.sentences)}>Annotate</Button>
                        </TableCell> 
                    </TableRow>
                ))}
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                    <DialogTitle>Judge Sentences</DialogTitle>
                    <DialogContent>
                        {sentences.map((sen, index) => (
                            <React.Fragment>
                                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                                    <TableCell >{sen.sentence}</TableCell>
                                    <TableCell>
                                        <InputLabel id="demo-simple-select-label">Rating</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={sen.judgement}
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