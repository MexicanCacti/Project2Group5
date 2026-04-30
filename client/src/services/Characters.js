export async function uploadCharacter() {

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

    console.log("Received:" + data.characterList);

    if(!res.ok){
        console.log(data.error);
        return [];
    }
    return data;
}