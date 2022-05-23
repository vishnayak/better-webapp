import { SearchHit } from '@components/hits/SearchHits';
import { Button, Card, CardActions, CardContent, Chip, IconButton, Typography } from '@mui/material';
import React from 'react';
import './SearchHitCard.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface SearchHitCardProps {
    searchHit: SearchHit;
    showTranslated: boolean;
    hitIndex: number; // 0-indexed
}

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

    const insertNewLines = (text: string) => {
        return <>{text.split('\n').map((t, index) => {
            if(index === 0) return <React.Fragment key={index}>{t}</React.Fragment>;
            else return <React.Fragment key={index}><br/>{t}</React.Fragment>;
        })}</>;
    }

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
            {!showTranslated && <Button size="small" onClick={translate}>{translateButtonLabel}</Button>}
        </CardActions>
    </Card>;
}