import { SearchHit } from '@components/hits/SearchHits';

const BASE_URL = 'https://cessnock.cs.umass.edu:9300/'

// const BASE_URL = 'http://localhost:5000/'

export interface QuerySubmissionRequest {
    taskId: string;
    requestId: string;
}

export interface QuerySubmissionResponse {
    id: string;
}

export interface Submission {
    id: string;
    taskId: string;
    requestId: string | null; // TODO: Remove null
    status: string; 
    progressMessage: string;
    errorMessage: string;
    who: string | null;
    when: Date;
    annotatedNounPhrases?: string[];
    annotatedSentences?: string[];
}

export const BAD_SUBMISSION = 'BAD_SUBMISSION';

export const submitQuery = async (query: QuerySubmissionRequest): Promise<QuerySubmissionResponse> => {
    const request = new Request(`${BASE_URL}submissions`, 
        {
            method: 'POST', 
            body: JSON.stringify(query), 
            headers: {'Content-Type': 'application/json'}
        });
    return (await fetch(request)).json();
}

export const getSubmissionById = async (id: string): Promise<Submission> => {
    const request = new Request(`${BASE_URL}submissions/${id}`);
    const response = await fetch(request);
    if(response.status === 400) {
        throw new Error(BAD_SUBMISSION);
    }
    return response.json();
}

export const getSubmissionStatusById = async (id: string): Promise<boolean> => {
    const request = new Request(`${BASE_URL}submissions/${id}/status`);
    return (await fetch(request)).json();
}

export const getPaginatedHits = async (id: string, start: number, size: number): Promise<SearchHit[]> => {
    const request = new Request(`${BASE_URL}submissions/${id}/hits?` + new URLSearchParams({
            start: start.toString(),
            numberHits: size.toString(),
        }), 
        {
            mode: 'cors',
            headers: { 'Content-Type': 'application/json',},
            method: 'GET',
        });
    const response = await fetch(request);
    if(response.status === 400) {
        throw new Error(BAD_SUBMISSION);
    }
    return response.json();
}

export const getAllSubmissions = async (): Promise<Submission[]> => {
    const request = new Request(`${BASE_URL}submissions`);
    return (await fetch(request)).json();
};