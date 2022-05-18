import { Button, Card, CardActions, CardContent, Checkbox, Grid, IconButton, Typography } from '@mui/material';
import React from 'react';
import './CandidateDocCard.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { CandidateDoc } from '@services/task-service';

export interface CandidateDocCardProps {
    doc: CandidateDoc;
    checked: boolean;
    checkboxDisabled: boolean;
    onHighlightConfirm: (text: string) => void;
    highlightText: string;
    onCheck: (isChecked: boolean) => void;
}

const getSelectionText = (currentNode: Element) => {
    const selectionObj = window.getSelection();
    if(selectionObj?.anchorNode && currentNode.contains(selectionObj?.anchorNode))
        return selectionObj.toString();
    else return '';
}

export const CandidateDocCard: React.FC<CandidateDocCardProps> = ({ doc, checked, onCheck, onHighlightConfirm, highlightText, checkboxDisabled }) => {
    const [expanded, setExpanded] = React.useState(false);
    const [selectedText, setSelectedText] = React.useState('');

    const id = `candidate-doc-${doc.docid}`;
    
    function setSelection() {
        document.getElementById(id) && setSelectedText(getSelectionText(document.getElementById(id)!!));
    }

    React.useEffect(() => {
        if(checked) {
            document.addEventListener('selectionchange', setSelection);
            return () => {
                document.removeEventListener('selectionchange', setSelection);
            };
        }
    }, [checked]);

    const renderLines = (text: string) => {
        return <>{text.split('\n').map((t, index) => {
            if(index === 0) return <React.Fragment key={index}>{t}</React.Fragment>;
            else return <React.Fragment key={index}><br/>{t}</React.Fragment>;
        })}</>;
    }

    return <Grid item classes={{root: 'candidate-doc-card'}} container>
        <Grid item><Checkbox disabled={!checked && checkboxDisabled} onChange={(e, isChecked) => onCheck(isChecked)} checked={checked}/></Grid>
        <Grid item xs={11}>
            <Card id={id} elevation={8} classes={{ root: `candidate-doc-card ${checked ? ( highlightText ? 'candidate-doc-card--completed' : 'candidate-doc-card--checked') : ''}` }}>
                <CardContent classes={{ root: expanded ? 'candidate-doc-card-content' : 'candidate-doc-card-content candidate-doc-card-content--compact' }}>
                    <Typography variant="body2">
                        {renderLines(doc.docText)}
                    </Typography>
                </CardContent>
                <CardActions classes={{ root: 'card-actions' }}>
                    <IconButton onClick={() => setExpanded(!expanded)} aria-label="expand">
                        {expanded ? 
                        <KeyboardArrowDownIcon fontSize={'large'} classes={{root: 'up-arrow'}} /> : 
                        <KeyboardArrowDownIcon fontSize={'large'} />}
                    </IconButton>
                    {highlightText?.length > 0 && <span className={'candidate-doc-card-highlight'}><b>Highlighted Text:</b>&nbsp;{highlightText}</span>}
                    {checked && <Button variant={'outlined'} disabled={selectedText.length === 0} onClick={() => onHighlightConfirm(selectedText)}>Confirm Highlight</Button>}
                </CardActions>
            </Card>    
        </Grid>
    </Grid>;
}
