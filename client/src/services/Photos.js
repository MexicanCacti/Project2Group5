export async function GenerateImage(TextSource){
    const res = await fetch("/gemini/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
             text: TextSource
        }),
    });

    const data = await res.json();
    return `data:${data.mimeType};base64,${data.imageBuffer}`;
}