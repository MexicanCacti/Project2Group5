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

    if(!res.ok){
        console.log(data.error);
        return null;
    }

    return data;
}

export async function addPage(username, pageNumber, storyID) {
    const res = await fetch("/story/create/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            pageNumber: pageNumber,
            storyID: storyID,
        }),
    });

    const data = await res.json();

    if(!res.ok){
        console.log(data.error);
        return null;
    }

    return data;
}

export async function savePage(username, pageNumber, sourceID, audioPrompt, pageID) {
    const res = await fetch("/story/save/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            pageNumber: pageNumber,
            sourceID: sourceID,
            audioPrompt: audioPrompt,
            pageID: pageID,
        }),
    });

    const data = await res.json();

    if(!res.ok){
        console.log(data.error);
        return null;
    }

    return data;
}

export async function fetchAllStories(username){
    const res = await fetch(`/user/stories?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await res.json();

    if(!res.ok){
        console.log(data.error);
        return [];
    }

    return data;
}

/*
* Returns:
* - audioPrompt: Transcribed audio used to generate image
* - sourceID: The sourceID of the image for database saving
* - generatedImage: the publicURL to access the generated image for display
 */
export async function fetchPageInfo(username, storyID, pageNumber){
    const res = await fetch(`/story/page/${encodeURIComponent(username)}/${encodeURIComponent(storyID)}/${encodeURIComponent(pageNumber)}`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await res.json();

    if(!res.ok){
        console.log(data.error);
        return null;
    }

    return data;
}

/*
* Returns
* - characterList = { {sourceID, alias, publicUrl} } (for every character in story)
 */
export async function fetchStoryCharacters(username, storyID){
    const res = await fetch(`/story/characters/${encodeURIComponent(username)}/${encodeURIComponent(storyID)}`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await res.json();

    if(!res.ok){
        console.log(data.error);
        return null;
    }
    return data;
}

// Function used when navigating storybook pages, must be passed the navigate hook
/*
    Args pretty self-explanatory
    On page load, will make calls to the backend to populate the page
 */
export function NavigateStoryPage(navigate, username, storyID, storyTitle, characterList, pageNumber, pageCount, pageInfo){
     navigate(`/story/${storyID}/${pageNumber}`, {
        state: {
            storyID: storyID,
            storyTitle: storyTitle,
            username: username,
            characterList: characterList,
            pageNumber: pageNumber,
            pageCount: pageCount,
            pageInfo: pageInfo
        },
    });
}