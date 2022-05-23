import React from 'react';
import Pagination from '@mui/material/Pagination';
import './SearchHits.css';
import { SearchHitCard } from '@components/search-hit-card/SearchHitCard';
import { Button, FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface SearchHitsProps {
    hits: SearchHit[];
}

export interface SearchHit {
    groupType: string; // - always "R" because these are request-level hits
    groupId: string; // - the unique identifier for the request (e.g. IR-T1-r1)
    reqNum: string;
    'docid': string; // - the unique identifier of the document
    docText: string; // - the actual text of the document
    events?: string[];
    sentenceRanges: Sentence[]; // - a list of the sentences that are in doc-text, described by these fields:
    translatedDocText: string;
    isRelevant: boolean;
};

export interface Sentence { 
    start: number; // - the zero-relative offset from the beginning of doc-text
    end: number; // - zero-relative offset of one past the end of the sentence
    id: number; // - sequential int number for the sentence within this document
    text: string; // - the actual text of the sentence
}

const TRANSLATE_ALL = 'Translate All';
const SHOW_ORIGINAL = 'Show Original';

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
    const pageSize = 20;
    const handlePageChange = (e: any, pageNum: number) => { setPage(pageNum); };
    const handleTranslateAllClick = () => {
        setTranslateAll(prev => !prev);
    }

    const handleFilterChange = (e: SelectChangeEvent<number>) => {
        setShowRelevant(!!e.target.value);
        setPage(1);
    };


    const indicesToShow = showRelevant ? relevantIndices : allIndices;
    const pgNo = Math.ceil(indicesToShow.length/pageSize);

    return hits.length > 0 ? <>
        <Pagination classes={{ root: 'search-hits-pagination' }} count = {pgNo} page={page} onChange={handlePageChange}/>
        <div className={'pagination-text-section'}>
            <div className={'pagination-text'}>{`Showing ${Math.min((page-1)*pageSize + 1, indicesToShow.length)} - ${Math.min(page*pageSize, indicesToShow.length)} of ${indicesToShow.length} hits`}</div>
            <FormControl variant='standard' sx={{ m: 1, minWidth: 120 }}>
                <Select
                    labelId={'filter-label'}
                    value={showRelevant ? 1 : 0}
                    onChange={handleFilterChange}
                    label='Filter Hits'
                >
                    <MenuItem value={0}>All hits</MenuItem>
                    <MenuItem value={1}>Relevant Hits</MenuItem>
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