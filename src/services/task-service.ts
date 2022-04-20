const BASE_URL = 'https://cessnock.cs.umass.edu:9300/'
export interface ExampleDoc {
    docid: string;
    doctext: string;
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