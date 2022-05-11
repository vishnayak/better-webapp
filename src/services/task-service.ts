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

export interface Tasks {
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
    sentencesId : string;
    sentence: string;
    judgement: string;
}

export interface Annotation{
    sentences: string;
    judgment: string;
}
export const getAllTasks = async (): Promise<Tasks[]> => {
    const request = new Request(`${BASE_URL}tasks`);
    return (await fetch(request)).json();  
};

export const getPhrasesForAnnotation = async (id: string): Promise<String> => {
    const request = new Request(`${BASE_URL}tasks/${id}/phrases-for-annotation`);
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

export const postPhrasesForAnnotation = async (taskNum: string,phrasesAnnotation:string) => {
    try {
        const request = new Request(`${BASE_URL}tasks/${taskNum}/phrases-for-annotation`);
        const response = await fetch(request, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
           },
           body: phrasesAnnotation
         });
    } catch (error) {
        console.log(error)
    } 
}