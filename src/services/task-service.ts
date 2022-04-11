const BASE_URL = 'https://cessnock.cs.umass.edu:9300/'
export interface ExampleDoc {
    docid: string;
    doctext: string;
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

export const getAllTasks = async (): Promise<Tasks[]> => {
    const request = new Request(`${BASE_URL}tasks`);
    return (await fetch(request)).json();
};