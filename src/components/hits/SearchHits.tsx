import React from 'react';
import Pagination from '@mui/material/Pagination';
import './SearchHits.css';
import { SearchHitCard } from '@components/search-hit-card/SearchHitCard';
import { Button, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import { Box } from '@mui/system';

interface SearchHitsProps {
    hits: SearchHit[];
}

export interface SearchHit {
    groupType: string; // - always "R" because these are request-level hits
    groupId: string; // - the unique identifier for the request (e.g. IR-T1-r1)
    reqNum: string;
    'docid': string; // - the unique identifier of the document
    docText: string; // - the actual text of the document
    events: IsiEvent[];
    eventCounts: Record<string, number>;
    sentenceRanges: Sentence[]; // - a list of the sentences that are in doc-text, described by these fields:
    translatedDocText: string;
    isRelevant: boolean;
};

export interface IsiEvent {
    patients: string[];
    sentenceID: 0;
    eventType: string;
    agents: string[];
};

export interface Sentence { 
    start: number; // - the zero-relative offset from the beginning of doc-text
    end: number; // - zero-relative offset of one past the end of the sentence
    id: number; // - sequential int number for the sentence within this document
    text: string; // - the actual text of the sentence
}

const TRANSLATE_ALL = 'Translate All';
const SHOW_ORIGINAL = 'Show Original';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

interface EventFilterOption {
    name: string;
    count: number;
};

export const SearchHits: React.FC<SearchHitsProps> = ({ hits }) => {
    const allIndices: number[] = [];
    const relevantIndices: number[] = [];
    hits.forEach((hit, i) => {
        allIndices.push(i);
        if(hit.isRelevant) relevantIndices.push(i); 
    });
    // const indicesToShow = React.useRef<number[]>(allIndices);

    const [page, setPage] = React.useState(1);
    const [translateAll, setTranslateAll] = React.useState<boolean>(false);
    const [showRelevant, setShowRelevant] = React.useState<boolean>(false);
    const [filterEvents, setFilterEvents] = React.useState<string[]>([]);
    const pageSize = 20;
    const handlePageChange = (e: any, pageNum: number) => { setPage(pageNum); };
    const handleTranslateAllClick = () => {
        setTranslateAll(prev => !prev);
    }

    const handleFilterChange = (e: SelectChangeEvent<number>) => {
        setShowRelevant(!!e.target.value);
        setPage(1);
    };

    const handleEventFilterChange = (e: SelectChangeEvent) => {
        setFilterEvents(e.target.value as unknown as string[]);
    };

    const allEvents: EventFilterOption[] = Object.entries(hits.reduce((res: Record<string, number>, h) => {
        Object.entries(h.eventCounts).forEach(entry => {
            res[entry[0]] = (entry[1] || 0) + 1;
        });
        return res;
    }, {})).map(entry => ({name: entry[0], count: entry[1]}));

    let indicesToShow = showRelevant ? relevantIndices : allIndices;
    if(filterEvents.length > 0) {
        indicesToShow = indicesToShow.filter(i => Object.keys(hits[i].eventCounts).length > 0 && filterEvents.some(ev => hits[i].eventCounts[ev] !== undefined));
    }
    
    const pgNo = Math.ceil(indicesToShow.length/pageSize);

    return hits.length > 0 ? <>
        <Pagination classes={{ root: 'search-hits-pagination' }} count = {pgNo} page={page} onChange={handlePageChange}/>
        <div className={'pagination-text-section'}>
            <div className={'pagination-text'}>{`Showing ${Math.min((page-1)*pageSize + 1, indicesToShow.length)} - ${Math.min(page*pageSize, indicesToShow.length)} of ${indicesToShow.length} hits`}</div>
            <FormControl sx={{ m: 1, width: 180 }}>
                <InputLabel id="relevance-select-label">Relevance</InputLabel>
                <Select
                    labelId={'relevance-select-label'}
                    value={showRelevant ? 1 : 0}
                    input={<OutlinedInput label="Relevance" />}
                    onChange={handleFilterChange}
                    label='Relevance'
                >
                    <MenuItem value={0}>All hits</MenuItem>
                    <MenuItem value={1}>Relevant Hits</MenuItem>
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, width: 350 }}>
                <InputLabel id="event-select-label">Events</InputLabel>
                <Select
                    labelId="event-select-label"
                    multiple
                    value={filterEvents as unknown as string}
                    onChange={handleEventFilterChange}
                    input={<OutlinedInput label="Events" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as unknown as string[]).map((value) => (
                                <Chip size='small' key={value} label={value} />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {
                        allEvents.map((event) => (
                            <MenuItem
                                key={event.name}
                                value={event.name}
                            >
                                {event.name}
                            </MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
            {/* <Button variant={'outlined'} onClick={handleFilterToggle}>{showRelevant ? SHOW_ALL : SHOW_RELEVANT}</Button> */}
            <Button variant={'outlined'} onClick={handleTranslateAllClick}>{translateAll ? SHOW_ORIGINAL : TRANSLATE_ALL}</Button>
        </div>
        {indicesToShow.slice((page-1)*pageSize, (page-1)*pageSize + 10 ).map(index => <React.Fragment key = {hits[index].docid}>
            <SearchHitCard searchHit = {hits[index]} hitIndex={index} showTranslated={translateAll}/>
        </React.Fragment>)}
        <Pagination classes={{ root: 'search-hits-pagination' }} count = {pgNo} page={page} onChange={handlePageChange}/>
    </> : <div className='fallback-text'>No hits to display.</div>;
}