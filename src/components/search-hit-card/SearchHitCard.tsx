import { SearchHit } from '@components/hits/SearchHits';
import { Avatar, Button, Card, CardActions, CardContent, Chip, getTooltipUtilityClass, IconButton, Typography } from '@mui/material';
import React from 'react';
import './SearchHitCard.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface SearchHitCardProps {
    searchHit: SearchHit;
    showTranslated: boolean;
    hitIndex: number; // 0-indexed
}

export const insertNewLines = (text: string) => {
    return <>{text.split('\n').map((t, index) => {
        if(index === 0) return <React.Fragment key={index}>{t}</React.Fragment>;
        else return <React.Fragment key={index}><br/>{t}</React.Fragment>;
    })}</>;
}

const getTooltip = (counts: {name: string; count: number;}[]): string => {
    return counts.map(c => `${c.name} (${c.count})`).join(', ');
};

export const SearchHitCard: React.FC<SearchHitCardProps> = ({ searchHit, showTranslated, hitIndex }) => {
    const [text, setText] = React.useState(showTranslated ? searchHit.translatedDocText : searchHit.docText);
    const [expanded, setExpanded] = React.useState(false);
    const [translateButtonLabel, setTranslateButtonLabel] = React.useState('Translate');
    const TRANSLATE = 'Translate';
    const SHOW_ORIGINAL = 'Show Original';

    const translate = () => {
        if(translateButtonLabel === TRANSLATE) {
            setText(searchHit.translatedDocText);
            setTranslateButtonLabel(SHOW_ORIGINAL);
        } else {
            setText(searchHit.docText);
            setTranslateButtonLabel(TRANSLATE);
        }
    }

    // React.useEffect(() => {
    //     if(translatedSentences[currTranslatedIndex + 1]) {
    //         let tempText = currTranslatedIndex === -1 ? '' : text;
    //         let tempIndex = currTranslatedIndex + 1;
    //         while(translatedSentences[tempIndex]) {
    //             tempText += '\n' + translatedSentences[tempIndex++];
    //         }
    //         setText(tempText);
    //         setCurrTranslatedIndex(tempIndex - 1);
    //         if(tempIndex === searchHit.sentenceRanges.length) {
    //             setCurrTranslatedIndex(-1);
    //             setTranslateButtonLabel(SHOW_ORIGINAL);
    //         }
    //     }
    // }, [translatedSentences]);

    React.useEffect(() => {
        if(showTranslated) setText(searchHit.translatedDocText);
        else { 
            setTranslateButtonLabel(TRANSLATE);
            setText(searchHit.docText);
        }
    }, [showTranslated, searchHit.translatedDocText, searchHit.docText]);

    const counts = Object.keys(searchHit.eventCounts).map(k => ({ name: k, count: searchHit.eventCounts[k]})).sort((a, b) => b.count - a.count);
    // const counts = [{name: 'a', count:8}, {name: 'bbb', count: 11}, {name: 'bbb', count: 11}, {name: 'a', count:8}, {name: 'bbb', count: 11}, {name: 'bbb', count: 11}, {name: 'bbb', count: 11}, {name: 'bbb', count: 11}];

    return <Card elevation={8} classes={{ root: 'search-hit-card' }}>
        <div className={'search-hit-card-header'}>
            <span>{hitIndex+1}.</span>
            {searchHit.isRelevant && <Chip classes={{label: 'search-hit-relevance-label-span', root: 'search-hit-relevance-label'}} label="Relevant" color="success" />}
        </div>
        <CardContent classes={{ root: expanded ? 'search-hit-card-content' : 'search-hit-card-content search-hit-card-content--compact' }}>
            <Typography variant="body2">
                {insertNewLines(text)}
            </Typography>
        </CardContent>
        <CardActions classes={{ root: 'card-actions' }}>
            <IconButton classes={{root: 'search-hit-expand-button'}} onClick={() => setExpanded(!expanded)} aria-label="expand">
                {expanded ? 
                <KeyboardArrowDownIcon fontSize={'large'} classes={{root: 'up-arrow'}} /> : 
                <KeyboardArrowDownIcon fontSize={'large'} />}
            </IconButton>
            <div>
                {!showTranslated && <Button sx={{mr: 2}} size="small" onClick={translate}>{translateButtonLabel}</Button>}
                {counts.slice(0, 5).map(k => <Chip sx={{mr: 1}} label={k.name} avatar={<Avatar>{k.count}</Avatar>} />)}
                {counts.length - 5 > 0 ? <span title={getTooltip(counts.slice(5))}>{`+ ${counts.length - 5} more`}</span> : ''}
            </div>
        </CardActions>
    </Card>;
}