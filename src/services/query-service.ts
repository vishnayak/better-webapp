import { SearchHit } from '@components/hits/SearchHits';

const BASE_URL = 'https://cessnock.cs.umass.edu:9300/'

// const BASE_URL = 'http://localhost:5000/'

export interface QuerySubmissionRequest {
    taskNum: string;
    reqNum: string;
}

export interface QuerySubmissionResponse {
    id: string;
}

export interface Submission {
    id: string;
    taskNum: string;
    taskTitle: string;
    taskStmt: string;
    taskNarr: string;
    reqNum: string | null; // TODO: Remove null
    reqText: string;
    status: SubmissionStatus;
    when: Date;
}

export enum SubmissionStatus {
    SUBMITTED = 'SUBMITTED',
    COMPLETED = 'COMPLETED'
}

export interface QueryHitsResponse {
    hits: SearchHit[];
    reqNum: string;
    reqText: string;
    taskNarr: string;
    taskNum: string;
    taskStmt: string;
    taskTitle: string;
    totalNumHits: number;
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

export const getPaginatedHits = async (id: string, start: number, size: number): Promise<QueryHitsResponse> => {
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

export const deleteSubmission = async (submissionId: string): Promise<boolean> => {
    const request = new Request(`${BASE_URL}submissions/${submissionId}`, 
        {
            method: 'DELETE',
        });
    try {
        await fetch(request);
        return true;
    } catch(e) {
        console.log(e);
        return false;
    }
};