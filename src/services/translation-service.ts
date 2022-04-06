import { Sentence } from "@components/hits/SearchHits";

const BASE_URL = 'http://127.0.0.1:5000/'

export interface TranslationResult {
    input: string;
    translatedText: string;
}

export const translateText = async (text: string): Promise<string> => {
    const body = {text};
    const request = new Request(`${BASE_URL}translation`, 
        {
            method: 'POST', 
            body: JSON.stringify(body), 
            headers: {'Content-Type': 'application/json'}
        });
    const result = (await fetch(request)).json();
    return result.then(res => res.translatedText).catch(res => { 
        console.error("Error during translation of " + text); 
        return "";
    });
}

export const translateSentences = async (sentences: Sentence[]): Promise<string> => {
    return ((await Promise.all(sentences.map(async (sentence) => {
        const body = {text: sentence.text}
        const request = new Request(`${BASE_URL}translation`, 
            { 
                method: 'POST', 
                body: JSON.stringify(body), 
                headers: {'Content-Type': 'application/json'}
            });
            const result = (await fetch(request)).json();
            return result.then(res => res.translatedText).catch(res => { 
                console.error("Error during translation of " + sentence.text); 
                return "";
            });
        }))) as string[]).join('\n');
}