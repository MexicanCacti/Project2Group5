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

export async function UploadGooglePhotos(username) {
    console.log(username);

    const statusRes = await fetch(`/user/o_status?username=${encodeURIComponent(username)}`, {
        method: "GET",
        credentials: 'include',
    });

    const status = await statusRes.json();

    if(!statusRes.ok) {
        console.log(status);
        return;
    }

    if(status.authNeeded) {
        window.location.assign(status.authURL);
        return;
    }

}