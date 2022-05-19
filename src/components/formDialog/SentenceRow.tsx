import { FormControlLabel, InputLabel, Radio, RadioGroup, TableCell, TableRow } from '@mui/material';
import { AnnotationJudgement } from '@services/task-service';
import React from 'react';

export interface SentenceRowProps {
    sentence: string;
    judgment: AnnotationJudgement;
    onAnnotate: (judgment: AnnotationJudgement) => void;
};

export const SentenceRow: React.FC<SentenceRowProps> = ({ sentence, judgment, onAnnotate }) => {
    return <TableRow sx={{ '& > *': { border: 'unset' } }}>
        <TableCell >{sentence}</TableCell>
        <TableCell>
            <InputLabel>Rating</InputLabel>
            <RadioGroup
                row
                sx={{ minWidth: 180 }}
                defaultValue={judgment === AnnotationJudgement.NONE ? undefined : judgment}
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
};