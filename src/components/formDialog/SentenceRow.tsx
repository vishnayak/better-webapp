import { FormControlLabel, InputLabel, Radio, RadioGroup, TableCell, TableRow } from '@mui/material';
import { AnnotationJudgment } from '@services/task-service';
import React from 'react';

export interface SentenceRowProps {
    sentence: string;
    judgment: AnnotationJudgment;
    onAnnotate: (judgment: AnnotationJudgment) => void;
};

export const SentenceRow: React.FC<SentenceRowProps> = ({ sentence, judgment, onAnnotate }) => {
    return <TableRow sx={{ '& > *': { border: 'unset' } }}>
        <TableCell>{sentence}</TableCell>
        <TableCell>
            <RadioGroup
                row
                sx={{ minWidth: 400, fontSize: '13px !important' }}
                defaultValue={judgment}
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
    </TableRow>
};