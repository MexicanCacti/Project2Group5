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