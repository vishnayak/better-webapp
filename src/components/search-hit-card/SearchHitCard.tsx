import { SearchHit } from '@components/hits/SearchHits';
import { Box, Button, Card, CardActions, CardContent, IconButton, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import './SearchHitCard.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { translateText } from '@services/translation-service';

export interface SearchHitCardProps {
    searchHit: SearchHit;
}

export const SearchHitCard: React.FC<SearchHitCardProps> = ({ searchHit }) => {
    const [text, setText] = React.useState(searchHit.docText);
    const [expanded, setExpanded] = React.useState(false);
    const [translateButtonLabel, setTranslateButtonLabel] = React.useState('Translate');
    const [translatedSentences, setTranslatedSentences] = React.useState<Record<number, string>>({});
    const [currTranslatedIndex, setCurrTranslatedIndex] = React.useState(-1);
    const TRANSLATE = 'Translate';
    const SHOW_ORIGINAL = 'Show Original';
    const TRANSLATING = 'Translating...';

    const translate = () => {
        if(translateButtonLabel === TRANSLATE) {
            searchHit.sentenceRanges.forEach((sentence, i) => {
                translateText(sentence.text).then(res => {
                    setTranslatedSentences(prev => ({ ...prev, [i]: res }));
                });
            });
            setTranslateButtonLabel(TRANSLATING);
        } else {
            setText(searchHit.docText);
            setTranslateButtonLabel(TRANSLATE);
            setCurrTranslatedIndex(-1);
        }
    }

    React.useEffect(() => {
        if(translatedSentences[currTranslatedIndex + 1]) {
            let tempText = currTranslatedIndex === -1 ? '' : text;
            let tempIndex = currTranslatedIndex + 1;
            while(translatedSentences[tempIndex]) {
                tempText += '\n' + translatedSentences[tempIndex++];
            }
            setText(tempText);
            setCurrTranslatedIndex(tempIndex - 1);
            if(tempIndex === searchHit.sentenceRanges.length) {
                setCurrTranslatedIndex(-1);
                setTranslateButtonLabel(SHOW_ORIGINAL);
            }
        }
    }, [translatedSentences]);

    const insertNewLines = (text: string) => {
        return <>{text.split('\n').map((t, index) => {
            if(index === 0) return <React.Fragment key={index}>{t}</React.Fragment>;
            else return <React.Fragment key={index}><br/>{t}</React.Fragment>;
        })}</>;
    }

    return <Card elevation={8} classes={{ root: 'search-hit-card' }}>
        <CardContent classes={{ root: expanded ? 'search-hit-card-content' : 'search-hit-card-content search-hit-card-content--compact' }}>
            <Typography variant="body2">
                {insertNewLines(text)}
            </Typography>
        </CardContent>
        <CardActions classes={{ root: 'card-actions' }}>
            <Button size="small" disabled={translateButtonLabel === TRANSLATING} onClick={translate}>{translateButtonLabel}</Button>
            {translateButtonLabel === TRANSLATING && <Box sx={{ width: '50%' }}>
                <LinearProgress />
            </Box>}
            <IconButton onClick={() => setExpanded(!expanded)} aria-label="expand">
                {expanded ? 
                <KeyboardArrowDownIcon fontSize={'large'} classes={{root: 'up-arrow'}} /> : 
                <KeyboardArrowDownIcon fontSize={'large'} />}
            </IconButton>
        </CardActions>
    </Card>;
}