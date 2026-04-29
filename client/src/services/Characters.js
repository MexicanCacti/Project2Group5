export async function uploadCharacter() {

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