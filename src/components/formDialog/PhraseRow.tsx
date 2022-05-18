import { Box, Collapse, FormControlLabel, IconButton, InputLabel, Radio, RadioGroup, TableCell, TableRow, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Annotation, AnnotationJudgement } from '@services/task-service';
import React from 'react';

export interface PhraseRowProps {
    phraseName: string;
    annotation: Annotation;
    onAnnotate: (judgment: AnnotationJudgement) => void;
};

const trimText = (text: string) => {
    let mySplitResult = text.split(" ");
    let n = mySplitResult.length - 1, i = 0;
    let finalString = "";
    while (i < 5 && n !== 0) {
        let lastWord = mySplitResult[n]
        finalString = " " + lastWord + " " + finalString;
        i++;
        n--;
    }
    return finalString + "..";
};

const BoldedText = (text: string, shouldBeBold: string) => {
    const textArray = text.split(shouldBeBold);
    if(textArray.length === 0) {
        return <span><b>{shouldBeBold}</b></span>;
    }
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
};

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
};

export const PhraseRow: React.FC<PhraseRowProps> = ({ phraseName, annotation, onAnnotate }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return <React.Fragment>
        <React.Fragment>
            <TableRow sx={{ '& > *': { border: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setIsOpen(prev => !prev)}
                    >
                        {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell >{BoldedText(annotation.sentences, phraseName)}</TableCell>
                <TableCell>
                    <InputLabel id="demo-simple-select-label">Rating</InputLabel>

                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        sx={{ minWidth: 180 }}
                        defaultValue={annotation.judgment === AnnotationJudgement.NONE ? undefined : annotation.judgment}
                        onChange={(e, value) => { e.preventDefault(); onAnnotate(value as AnnotationJudgement); }}
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
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                        <Typography align="center">
                            {BoldedText1(annotation.sentences, phraseName)}
                        </Typography>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>;
};