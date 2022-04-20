import React from 'react';
import { useParams } from 'react-router-dom';
import { SearchHit, SearchHits } from '@components/hits/SearchHits';
import './SearchPage.css';
import { getPaginatedHits, getSubmissionById, Submission, BAD_SUBMISSION } from '@services/query-service';

export const SearchPage: React.FC<{}> = () => {
    const params = useParams();
    const [hitsLoading, setHitsLoading] = React.useState(true);
    const [isIdValid, setIsIdValid] = React.useState(false);
    const [searchHits, setSearchHits] = React.useState<SearchHit[]>([]);
    const [submissionId, setSubmissionId] = React.useState<string | undefined>(undefined);
    const [submission, setSubmission] = React.useState<Submission | undefined>(undefined);
    React.useEffect(() => {
        setSubmissionId(params.submissionId);
    }, []);

    React.useEffect(() => {
        if(submissionId) {
            getSubmissionById(submissionId).then(res => { 
                setSubmission(res); setIsIdValid(true);
                // TODO: check for OK status beore proceeding here
                getPaginatedHits(submissionId, 0, 100).then(res => { 
                    setSearchHits(res.hits); setHitsLoading(false); 
                }).catch(e => {
                   setHitsLoading(false); 
                   console.error(e); // we won't be calling the api if id isn't executed yet
                });
            }).catch(e => {
                if(e instanceof Error && e.message === BAD_SUBMISSION) {
                    setIsIdValid(false);
                    setHitsLoading(false); 
                }
            });
        }
    }, [submissionId]);

    // task id, req id, created on, name/execution time(??)

    return <div className="search-page">{
        isIdValid ? 
            <>
                <div className={'query-detail'}>
                    <span><b>Task ID: </b> {submission!.taskId}</span>
                    <span><b>Created on: </b> {new Date(submission!.when).toLocaleString()}</span>
                </div>
                <div  className={'query-detail'}>
                    <span><b>Request ID: </b> {submission!.requestId}</span>
                </div>
            </> :
            <div className='fallback-text'>This submission with ID {submissionId} is invalid!</div>
    }
    {
        hitsLoading ? <div className='fallback-text'>Loading...</div> :
        isIdValid ? <SearchHits hits={searchHits as SearchHit[]} /> : ''
    }</div>;
};