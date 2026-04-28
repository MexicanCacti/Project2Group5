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
        window.open(status.authURL, '_authenticate_');
        return;
    }

    const pickersetup = await fetch(`/googlephotos/session`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
        })
    })

    const data = await pickersetup.json();

    console.log("session response", data);

    if (!pickersetup.ok) {
        console.error("session setup failed", data);
        return;
    }

    if (!data.pickerUri) {
        console.error("No pickerUri returned", data);
        return;
    }

    window.open(data.pickerUri, '_blank');

}