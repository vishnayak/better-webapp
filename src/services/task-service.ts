import { Sentence } from "@components/hits/SearchHits";

const BASE_URL = 'https://cessnock.cs.umass.edu:9300/'
export interface ExampleDoc {
    docid: string;
    docText: string;
    docNumber: number;
    highlight: string;
    sentences:[];
}
export interface Request {
    reqNum: string;
    reqText: string;
    exampleDocs: ExampleDoc[];
}

export interface Task {
    taskNum: string;
    taskTitle: string;
    taskStmt: string;
    taskNarr: string;
    taskExampleDocs: ExampleDoc[];
    requests: Request[];
}

export interface Annotation{
    sentences: string;
    judgment: string;
}

export interface TaskCreationPayload {
    taskTitle: string;
    taskStmt: string;
    taskNarr: string;
}

export interface CandidateDoc {
    docid: string;
    docText: string;
    events: string[] | null;
    sentenceRanges?: Sentence[]; // TODO : Remove optionality
}

export interface CandidateDocsResult {
    hits: CandidateDoc[];
    requestId: string;
    requestText: string;
    taskNarr: string;
    taskNum: string;
    taskStmt: string;
    taskTitle: string;
    totalNumHits: number;
}

export const getAllTasks = async (): Promise<Task[]> => {
    const request = new Request(`${BASE_URL}tasks`);
    return (await fetch(request)).json();  
};

export const getTaskById = async (id: string): Promise<Task> => {
    const request = new Request(`${BASE_URL}tasks/${id}`);
    return (await fetch(request)).json();
};

export const getPhrasesForAnnotation = async (id: string): Promise<String> => {
    const request = new Request(`${BASE_URL}tasks/${id}/phrases-for-annotation`);
    return (await fetch(request)).json();
};

export const createTask = async (payload: TaskCreationPayload) => {
    const request = new Request(`${BASE_URL}tasks`, 
        {
            method: 'POST', 
            body: JSON.stringify(payload), 
            headers: {'Content-Type': 'application/json'}
        });
    return (await fetch(request)).json();
};

export const getCandidateDocsForTask = async (taskId: string): Promise<CandidateDoc> => {
    const request = new Request(`${BASE_URL}tasks/${taskId}/candidate-docs`);
    return (await fetch(request)).json();
};