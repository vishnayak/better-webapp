import { Sentence } from "@components/hits/SearchHits";

const BASE_URL = 'https://cessnock.cs.umass.edu:9300/'

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

export interface SentencesAnnotation {
    taskNarrative: string;
    taskTitle: string;
    taskStmt:string;
    taskNum:string;
    annotatedRequest: AnnotatedRequest;
}

export interface AnnotatedRequest {
    reqNum: string;
    reqText: string;
    exampleDocs: SentencesExampleDocs[];
}

export interface SentencesExampleDocs {
    docNumber: number;
    docId: string;
    sentences: Sentences[];
}
export interface Sentences{
    sentencesId : string;
    sentence: string;
    judgement: string;
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

export interface TaskUpdatePayload extends TaskCreationPayload {
    taskNum: string;
}

export interface CandidateDocsResponse {
    taskNum: string;
	taskTitle: string;
	taskStmt: string;
	taskNarr: string;
	reqNum: string;
	reqText: string;
	totalNumHits: string;
	hits: CandidateDoc[];
}

export interface CandidateDoc {
    docid: string;
    docText: string;
    events: string[] | null;
    sentenceRanges: Sentence[];
}

export interface ExampleDoc {
    docid: string; // from candidate doc
    docNumber: number; // index in docs (>=1)
	docText: string; // from candidate doc
	highlight: string; // from user input
	sentences: Sentence[]; // from candidate doc
};

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

export const candidateDocToExampleDoc = (c: CandidateDoc, docNumber: number, highlight: string): ExampleDoc => {
    const {docid, docText, sentenceRanges: sentences } = c; 
    return {
        docid,
        docNumber,
        docText,
        highlight,
        sentences,
    };
}; 

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

export const createTask = async (payload: TaskCreationPayload): Promise<Task> => {
    const request = new Request(`${BASE_URL}tasks`, 
        {
            method: 'POST', 
            body: JSON.stringify(payload), 
            headers: {'Content-Type': 'application/json'}
        });
    return (await fetch(request)).json();
};

export const updateTask = async (taskNum: string, payload: TaskUpdatePayload): Promise<Task> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}`, 
        {
            method: 'PATCH', 
            body: JSON.stringify(payload), 
            headers: {'Content-Type': 'application/json'}
        });
    return (await fetch(request)).json();
};

export const addExampleDocsToTask = async (taskNum: string, exampleDocs: ExampleDoc[]) => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/example-docs`, {
        method: 'POST', 
        body: JSON.stringify(exampleDocs), 
        headers: {'Content-Type': 'application/json'}
    });
    await fetch(request);
    return true;
};

export const getCandidateDocsForTask = async (taskId: string): Promise<CandidateDocsResponse> => {
    const request = new Request(`${BASE_URL}tasks/${taskId}/candidate-docs`);
    return (await fetch(request)).json();
};

export const getSentencesForAnnotation = async (taskNum: string, reqNum : string): Promise<SentencesAnnotation> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/requests/${reqNum}/sentences-for-annotation`);
    return (await fetch(request)).json();
};

export const postSentencesForAnnotation = async (taskNum: string, reqNum : string,sentencesAnnotation:SentencesAnnotation) => {
    try {
        const request = new Request(`${BASE_URL}tasks/${taskNum}/requests/${reqNum}/sentences-for-annotation`);
        const response = await fetch(request, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
           },
           body: JSON.stringify(sentencesAnnotation)
         });
    } catch (error) {
        console.log(error)
    } 
}
