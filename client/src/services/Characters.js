export async function uploadCharacter(name, file) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    const res = await fetch('/character/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!res.ok) {
        console.error('Failed to upload character');
        return null;
    }

    return true;
}

export async function changeCharacterAlias(username, alias, sourceID){
    console.log({username, alias, sourceID});
    const res = await fetch('/character/alias/update', {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            alias,
            sourceID,
        })
    });

    if (!res.ok) {
        return null;
    }

    return true;
}

export async function fetchAllCharacters(username) {
    const res = await fetch(`/user/characters?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await res.json();

    console.log("Received:" + data.images);

    if(!res.ok){
        console.error('Failed to fetch characters', data);
        return [];
    }
    return data;
}