import React from 'react';
import Pagination from '@mui/material/Pagination';
import './SearchResults.css';
import { SearchResultCard } from '@components/search-result-card/SearchResultCard';

interface SearchResultsProps {
    results: Result[];
}

export interface Result {
    groupType: string; // - always "R" because these are request-level hits
    groupId: string; // - the unique identifier for the request (e.g. IR-T1-r1)
    'docid': string; // - the unique identifier of the document
    docText: string; // - the actual text of the document
    'isi-events'?: string[]; // - a list of events identified by our ISI-provided event recognizer software [ignore these for now]
    'mitre-events'?: string[]; // - a list of events provided by Mitre [ignore these for now]
    sentences: Sentence[]; // - a list of the sentences that are in doc-text, described by these fields:
};

interface Sentence { 
    start: number; // - the zero-relative offset from the beginning of doc-text
    end: number; // - zero-relative offset of one past the end of the sentence
    id: number; // - sequential int number for the sentence within this document
    text: string; // - the actual text of the sentence
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {

    const [page, setPage] = React.useState(1);
    const pageSize = 10;
    const handlePageChange = (e: any, pageNum: number) => { setPage(pageNum); };


    const pgNo = Math.ceil(results.length/pageSize);
    return <>
        <Pagination classes={{ root: 'search-results-pagination' }} count = {pgNo} page={page} onChange={handlePageChange}/>
        {results.slice((page-1)*pageSize, (page-1)*pageSize + 10 ).map(result => <>
            <SearchResultCard result = {result}/>
        </>)}
        <Pagination classes={{ root: 'search-results-pagination' }} count = {pgNo} page={page} onChange={handlePageChange}/>
    </>;
}