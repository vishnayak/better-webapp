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
    request: AnnotatedRequest;
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
    sentenceId : string;
    sentence: string;
    judgment: string;
}

export interface Annotation{
    sentences: string;
    judgment: AnnotationJudgment;
}

export interface PhraseAnnotation {
    [phrase: string]: Annotation;
}

export interface TaskCreationPayload {
    taskTitle: string;
    taskStmt: string;
    taskNarr: string;
}

export interface TaskUpdatePayload extends TaskCreationPayload {
    taskNum: string;
}

export interface RequestCreationPayload {
    reqText: string;
}

export interface RequestUpdatePayload extends RequestCreationPayload {}

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

export enum AnnotationJudgment {
    NONE='', P='P', E='E', G='G', F='F', B='B'
};

export const AnnotationJudgmentNames: Record<AnnotationJudgment, string> = {
    [AnnotationJudgment.NONE]: 'None',
    [AnnotationJudgment.P]: 'Perfect',
    [AnnotationJudgment.E]: 'Excellent',
    [AnnotationJudgment.G]: 'Good',
    [AnnotationJudgment.F]: 'Fair',
    [AnnotationJudgment.B]: 'Bad',
}

// utils

function getResult(response: Response) {
    if(response.ok) {
        return response.json();
    }
    throw Error(JSON.stringify(response));
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

// task actions

export const getAllTasks = async (): Promise<Task[]> => {
    const request = new Request(`${BASE_URL}tasks`);
    return getResult(await fetch(request));  
};

export const getTaskById = async (id: string): Promise<Task> => {
    const request = new Request(`${BASE_URL}tasks/${id}`);
    return getResult(await fetch(request));
};

export const getPhrasesForAnnotation = async (id: string): Promise<any[]> => {
    // DONT USE, use getAnnotationPhrases instead
    const request = new Request(`${BASE_URL}tasks/${id}/phrases-for-annotation`);
    const res = getResult(await fetch(request));
    return Object.entries(res).map(([key, value]) => {
        return { key, value: (value as Annotation).sentences };
    });
};

export const getAnnotationPhrases = async (id: string): Promise<PhraseAnnotation> => {
    const request = new Request(`${BASE_URL}tasks/${id}/phrases-for-annotation`);
    return getResult(await fetch(request));
};

export const resetTaskAnnotations = async (taskNum: string): Promise<void> => {
    try {
        const annotations = await getAnnotationPhrases(taskNum);
        Object.keys(annotations).forEach(
            phrase => {
                annotations[phrase] = {
                    ...annotations[phrase],
                    judgment: AnnotationJudgment.NONE
                };
            }
        );
        postPhrasesForAnnotation(taskNum, annotations);
    } catch (error) {
        console.log(error)
    }
};

export const createTask = async (payload: TaskCreationPayload): Promise<Task> => {
    const request = new Request(`${BASE_URL}tasks`, 
        {
            method: 'POST', 
            body: JSON.stringify(payload), 
            headers: {'Content-Type': 'application/json'}
        });
    return getResult(await fetch(request));
};

export const updateTask = async (taskNum: string, payload: TaskUpdatePayload): Promise<Task> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}`, 
        {
            method: 'PATCH', 
            body: JSON.stringify(payload), 
            headers: {'Content-Type': 'application/json'}
        });
    return getResult(await fetch(request));
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
    return getResult(await fetch(request));
};

export const postPhrasesForAnnotation = async (taskNum: string, phrasesAnnotation: PhraseAnnotation) => {
    try {
        const request = new Request(`${BASE_URL}tasks/${taskNum}/phrases-for-annotation`);
        const response = await fetch(request, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(phrasesAnnotation)
         });
    } catch (error) {
        console.log(error)
    } 
}

// Request actions

export const getRequestByReqNum = async (taskNum: string, reqNum: string): Promise<Request> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/requests/${reqNum}`);
    return getResult(await fetch(request));
};

export const createRequest = async (taskNum: string, payload: RequestCreationPayload): Promise<Request> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/requests`, 
        {
            method: 'POST', 
            body: JSON.stringify(payload), 
            headers: {'Content-Type': 'application/json'}
        });
    return getResult(await fetch(request));
};

export const updateRequest = async (taskNum: string, reqNum: string, payload: RequestUpdatePayload): Promise<Request> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/requests/${reqNum}`, 
        {
            method: 'PATCH', 
            body: JSON.stringify(payload), 
            headers: {'Content-Type': 'application/json'}
        });
    return getResult(await fetch(request));
};

export const addExampleDocsToRequest = async (taskNum: string, reqNum: string, exampleDocs: ExampleDoc[]) => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/requests/${reqNum}/example-docs`, {
        method: 'POST', 
        body: JSON.stringify(exampleDocs), 
        headers: {'Content-Type': 'application/json'}
    });
    await fetch(request);
    return true;
};

export const getCandidateDocsForRequest = async (taskNum: string, reqNum: string): Promise<CandidateDocsResponse> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/requests/${reqNum}/candidate-docs`);
    return getResult(await fetch(request));
};

export const getSentencesForAnnotation = async (taskNum: string, reqNum : string): Promise<SentencesAnnotation> => {
    const request = new Request(`${BASE_URL}tasks/${taskNum}/requests/${reqNum}/sentences-for-annotation`);
    return getResult(await fetch(request));
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

export const resetRequestAnnotations = async (taskNum: string, reqNum: string): Promise<void> => {
    try {
        const annotations = await getSentencesForAnnotation(taskNum, reqNum);
        annotations.request.exampleDocs = annotations.request.exampleDocs.map(d => {
            d.sentences = d.sentences.map(s => ({ ...s, judgment: AnnotationJudgment.NONE }));
            return d;
        });
        postSentencesForAnnotation(taskNum, reqNum, annotations);
    } catch (error) {
        console.log(error)
    }
};