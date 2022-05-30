import { Box, Collapse, FormControlLabel, IconButton, InputLabel, Radio, RadioGroup, TableCell, TableRow, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Annotation, AnnotationJudgment } from '@services/task-service';
import React from 'react';

export interface PhraseRowProps {
    phraseName: string;
    annotation: Annotation;
    onAnnotate: (judgment: AnnotationJudgment) => void;
};

const getLastWords = (text: string): string => {
    const splitText = text.replace('....\n...', '\n').split(' ');
    let n=Math.min(4, splitText.length), i=n+1;
    let res = '..';
    while(--i > 0) {
        const curr = splitText[splitText.length - i];
        res = (curr.indexOf('\n') >= 0 ? ('.. ' + curr.split('\n')[1] + ' ') :  (res + ' ')) + curr;
    }
    return res;
};

const getFirstWords = (text: string): string => {
    const splitText = text.replace('....\n...', '\n').split(' ');
    let n=Math.min(4, splitText.length), i=-1;
    let res = '';
    while(++i < n) {
        const curr = splitText[i];
        if(curr.indexOf('\n') >= 0) break;
        res += ' ' + curr;
    }
    return res + '..';
};

const BoldedText = (text: string, shouldBeBold: string) => {
    const textArray = text.split(shouldBeBold);
    if(textArray.length === 0) {
        return <span><b>{shouldBeBold}</b></span>;
    }
    return (
        <span>
            {textArray.slice(0, textArray.length - 1).map((item, index) => (
                <React.Fragment key={index}>
                    {getLastWords(item)}
                    {index !== textArray.length - 1 && (
                        <b>{shouldBeBold}</b>
                    )}
                    {getFirstWords(textArray[index + 1])}
                </React.Fragment>
            ))}
        </span>
    );
};

const BoldedText1 = (text: string, shouldBeBold: string) => {
    const textArray = text.split(shouldBeBold);
    return (
        <span>
            {textArray.map((item, index) => (
                <React.Fragment key={index}>
                    {item}
                    {index !== textArray.length - 1 && (
                        <b>{shouldBeBold}</b>
                    )}
                </React.Fragment>
            ))}
        </span>
    );
};

export const PhraseRow: React.FC<PhraseRowProps> = ({ phraseName, annotation, onAnnotate }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return <React.Fragment>
        <TableRow sx={{ '& > * > *': { borderBottom: 'none !important' } }}>
            <Typography variant='body2' sx={{display: 'contents'}}>
                <TableCell>
                    <IconButton
                        size="small"
                        onClick={() => setIsOpen(prev => !prev)}
                    >
                        {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell >{BoldedText(annotation.sentences, phraseName)}</TableCell>
                <TableCell>
                    <RadioGroup
                        row
                        sx={{ minWidth: 400, fontSize: '13px !important' }}
                        defaultValue={annotation.judgment}
                        onChange={(e, value) => { e.preventDefault(); onAnnotate(value as AnnotationJudgment); }}
                    >
                        <FormControlLabel value="P" control={<Radio />} label="P" />
                        <FormControlLabel value="E" control={<Radio />} label="E" />
                        <FormControlLabel value="G" control={<Radio />} label="G" />
                        <FormControlLabel value="F" control={<Radio />} label="F" />
                        <FormControlLabel value="B" control={<Radio />} label="B" />
                        <FormControlLabel value="" control={<Radio />} label="None" />
                    </RadioGroup>
                </TableCell>
            </Typography>
        </TableRow>

        <TableRow>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                        <Typography variant='body2' align="justify" whiteSpace={'break-spaces'}>
                            {BoldedText1(annotation.sentences, phraseName)}
                        </Typography>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment>;
};