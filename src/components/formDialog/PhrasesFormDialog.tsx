import React from 'react';
import { Box } from '@mui/system';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import InputLabel from '@mui/material/InputLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { AnnotationJudgement, PhraseAnnotation } from '@services/task-service';


export interface PhrasesFormDialogProps {
    taskNum: string;
    annotations: PhraseAnnotation;
    onAnnotate: (phrase: string, judgement: AnnotationJudgement) => void;
}

export const PhrasesFormDialog: React.FC<PhrasesFormDialogProps> = ({ taskNum, annotations, onAnnotate }) => {
    const [openSentence, setOpenSentence] = React.useState<Record<string, boolean>>({});

    const trimText = (text: string) => {
        var mySplitResult = text.split(" ");
        var n = mySplitResult.length - 1, i = 0;
        var finalString = "";
        while (i < 5 && n !== 0) {
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

    const handleOpenSentence = (k: string) => {
        setOpenSentence(prev => ({
            ...prev,
            [k]: !prev[k]
        }));
    };

    return (
        <React.Fragment>
            {Object.keys(annotations).map((k) => (
                <React.Fragment key = {`${k}${annotations[k].judgment}`}>
                    <React.Fragment>
                        <TableRow sx={{ '& > *': { border: 'unset' } }}>
                            {/* <TableCell >{k.key}</TableCell> */}
                            <TableCell>
                                <IconButton
                                    aria-label="expand row"
                                    size="small"
                                    onClick={() => handleOpenSentence(k)}
                                >
                                    {openSentence[k] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                            </TableCell>
                            <TableCell >{BoldedText(annotations[k].sentences, k)}-{k}</TableCell>
                            <TableCell>
                                <InputLabel id="demo-simple-select-label">Rating</InputLabel>

                                <RadioGroup
                                    row
                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                    name="row-radio-buttons-group"
                                    sx={{ minWidth: 180 }}
                                    defaultValue={annotations[k].judgment === AnnotationJudgement.NONE ? undefined : annotations[k].judgment}
                                    onChange={(e, value) => { e.preventDefault(); onAnnotate(k, value as AnnotationJudgement); }}
                                >
                                    <FormControlLabel value="P" control={<Radio />} label="Perfect" />
                                    <FormControlLabel value="E" control={<Radio />} label="Excellent" />
                                    <FormControlLabel value="G" control={<Radio />} label="Good" />
                                    <FormControlLabel value="F" control={<Radio />} label="Fair" />
                                    <FormControlLabel value="B" control={<Radio />} label="Bad" />
                                </RadioGroup>
                            </TableCell>
                        </TableRow>

                    </React.Fragment>
                    <TableRow sx={{ '& > *': { border: 'unset' } }}>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={openSentence[k]} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1 }}>
                                    <Typography align="center">
                                        {BoldedText1(annotations[k].sentences, k)}
                                    </Typography>
                                </Box>
                            </Collapse>
                        </TableCell>
                    </TableRow>
                </React.Fragment>
            ))}
        </React.Fragment>
    );
}