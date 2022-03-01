import { Result } from '@components/search-results/SearchResults';
import { Button, Card, CardActions, CardContent, IconButton, Typography } from '@mui/material';
import React from 'react';
import './SearchResultCard.css';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface SearchResultCardProps {
    result: Result;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
    const [expanded, setExpanded] = React.useState(false);


    return <Card elevation={8} classes={{ root: 'search-result-card' }}>
        <CardContent classes={{ root: expanded ? 'search-result-card-content' : 'search-result-card-content search-result-card-content--compact' }}>
            <Typography variant="body2">
                {result.docText}
            </Typography>
        </CardContent>
        <CardActions classes={{ root: 'card-actions' }}>
            <Button size="small">Translate</Button>
            <IconButton onClick={() => setExpanded(!expanded)} aria-label="expand">
                {expanded ? 
                <KeyboardArrowDownIcon fontSize={'large'} classes={{root: 'up-arrow'}} /> : 
                <KeyboardArrowDownIcon fontSize={'large'} />}
            </IconButton>
        </CardActions>
    </Card>;
}