// JSON cannot carry binary data (blob) so need to convert it to base64 before embedding it to JSON for passing to backend
export async function BlobToBase64(AudioBlob){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(AudioBlob);
    });
}

/*
* Send the base64 translation JSON to the backend
* Backend sends a Gemini request with the JSON base64 to generate a transcript
* Backend then returns the results of the transcription request as a JSON
* Frontend only care about the text, so that is extracted and returned for displaying
* During this process, backend can run whatever else is needed in between (like logging)
 */
export async function DoTranscription(AudioBlob) {
    const base64Audio = await BlobToBase64(AudioBlob);

    const res = await fetch("/gemini/transcribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            audio: base64Audio,
        }),
    });
    const data = await res.json();
    return data.text;
}

// Redundant, but opens doorway in case something should be checked with the blob before attempting transcription
export async function TranscribeAudio(AudioBlob){
    return await DoTranscription(AudioBlob);
}