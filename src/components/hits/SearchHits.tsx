import React from 'react';
import Pagination from '@mui/material/Pagination';
import './SearchHits.css';
import { SearchHitCard } from '@components/search-hit-card/SearchHitCard';

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
};

export interface Sentence { 
    start: number; // - the zero-relative offset from the beginning of doc-text
    end: number; // - zero-relative offset of one past the end of the sentence
    id: number; // - sequential int number for the sentence within this document
    text: string; // - the actual text of the sentence
}

export const SearchHits: React.FC<SearchHitsProps> = ({ hits }) => {

    const [page, setPage] = React.useState(1);
    const pageSize = 20;
    const handlePageChange = (e: any, pageNum: number) => { setPage(pageNum); };


    const pgNo = Math.ceil(hits.length/pageSize);
    return hits.length > 0 ? <>
        <Pagination classes={{ root: 'search-hits-pagination' }} count = {pgNo} page={page} onChange={handlePageChange}/>
        <div className={'pagination-text'}>{`Showing ${(page-1)*pageSize + 1} - ${Math.min(page*pageSize, hits.length)} of ${hits.length} hits`}</div>
        {hits.slice((page-1)*pageSize, (page-1)*pageSize + 10 ).map(result => <React.Fragment key = {result.docid}>
            <SearchHitCard searchHit = {result}/>
        </React.Fragment>)}
        <Pagination classes={{ root: 'search-hits-pagination' }} count = {pgNo} page={page} onChange={handlePageChange}/>
    </> : <div className='fallback-text'>No hits to display.</div>;
}