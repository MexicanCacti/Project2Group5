export async function createStory(username, title, description, characterList){
    const res = await fetch("/story/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            title: title,
            description: description,
            characterList: characterList,
        }),
    });

    const data = await res.json();

    console.log(data);

    return data;
}

export async function fetchAllStories(username){
    const res = await fetch(`/user/stories?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await res.json();

    console.log("Received:" + data.stories);

    if(!res.ok){
        console.error('Failed to fetch stories', data);
        return [];
    }

    return data;
}