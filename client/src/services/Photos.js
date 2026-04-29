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
        credentials: "include",
    });

    const status = await statusRes.json();

    if (!statusRes.ok) {
        console.error(status);
        return null;
    }

    if (status.authNeeded) {
        window.location.assign(status.authURL);
        return null;
    }

    const pickersetup = await fetch(`/googlephotos/session`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
    });

    const data = await pickersetup.json();

    if (!pickersetup.ok) {
        console.error("session setup failed", data);
        return null;
    }

    // Open pickerUri session for image selection
    const popup = window.open(`${data.pickerUri}/autoclose`, "_blank");

    return {
        sessionID: data.sessionID,
        popup,
    };
}

// Busy wait (with a timeout) until backend processes & saves the picked images
export async function PollForPickedGooglePhoto(username, sessionID, intervalMs = 2000, timeoutMs = 120000) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const data = await WaitForPickedGooglePhoto(username, sessionID);

        if (data) {
            return data;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    console.error("poll timed out");
    return null;
}

// The sessionID is used in the backend to request the picker server status on if we can receive the images selected
export async function WaitForPickedGooglePhoto(username, sessionID) {
    const res = await fetch(
        `/googlephotos/session/${sessionID}/media?username=${encodeURIComponent(username)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await res.json();
    console.log("poll response", data);

    if (!res.ok) {
        console.error("poll failed", data);
        return null;
    }

    if (!data.ready) {
        return null;
    }

    return data;
}

export async function setImages(setImageListState, imageList){
    setImageListState((prev) => [...prev, ...(imageList.images || [])]);
}