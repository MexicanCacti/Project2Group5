const {db} = require('../services/firestore');
const admin = require("firebase-admin");

/*
 Story fields:
 - StoryID
 - title
 - description
 - characterList [List of characterIDs]
 - pageCount
 - pageList [List of pageIDs]
 */
async function AddStory(username, title, description){
    // Create a new story document
    const storyRef = db
        .collection('users')
        .doc(username)
        .collection('stories')
        .doc();

    // Fill in the story attributes
    await storyRef.set({
        storyID: storyRef.id,
        title: title,
        description: description,
        characterList: [],
        pageCount: 0,
        pageList: [],
    })

    return {
        storyID: storyRef.id,
        storyTitle: title,
    }
}

/*
Page fields:
- PageID
- Page Number
- SourceID of generated image
- audioPrompt used to generate image
 */
async function AddPage(username, pageNumber, storyID) {
    // Create a new page document
    const pageRef = db
        .collection('users')
        .doc(username)
        .collection('pages')
        .doc();

    await pageRef.set({
        pageID: pageRef.id,
        pageNumber: pageNumber,
        sourceID: "",
        audioPrompt: "",
    })

    const storyRef = db
        .collection('users')
        .doc(username)
        .collection('stories')
        .doc(storyID);

    const storyDoc = await storyRef.get();
    if(!storyDoc.exists){
        return pageRef.id;
    }

    await storyRef.set({
        pageCount: storyDoc.data().pageCount + 1,
        pageList: admin.firestore.FieldValue.arrayUnion(pageRef.id),
    }, {merge: true});

    return pageRef.id;
}

/*
Page fields:
- PageID
- Page Number
- SourceID of generated image
- audioPrompt used to generate image
 */
async function SavePage(username, pageNumber, sourceID, audioPrompt, pageID) {
    // Get page document
    const pageRef = db
        .collection('users')
        .doc(username)
        .collection('pages')
        .doc(pageID);

    await pageRef.set({
        pageID: pageRef.id,
        pageNumber: pageNumber,
        sourceID: sourceID,
        audioPrompt: audioPrompt,
    }, {merge: true});

    return pageRef.id;
}

/*
* Character collection is a list of all the user's uploaded characters
* The sourceID field: Links to the Image collection's sourceID for lookup
* Alias: Just for database dashboard readability
* storyList: List of all the storyIDs the character is apart of
 */
async function SaveCharacter(username, sourceID, alias){
    const characterRef = db
        .collection('users')
        .doc(username)
        .collection('characters')
        .doc(sourceID)

    await characterRef.set({
        sourceID: sourceID,
        storyList: []
    }, { merge: true });

    return characterRef.id;
}

/*
    Adds the characterID to the story doc's characterList, then also adds the storyID to the character doc's storyList
 */
async function AddCharacterToStory(username, storyID, characterID){
    const storyRef = db
        .collection('users')
        .doc(username)
        .collection('stories')
        .doc(storyID);

    const storyDoc = await storyRef.get();

    if(!storyDoc.exists){
        return;
    }

    const characterRef = db
        .collection('users')
        .doc(username)
        .collection('characters')
        .doc(characterID);

    const characterDoc = await characterRef.get();

    if(!characterDoc.exists){
        return;
    }

    // Appends the characterID to the list of character IDs of story, function call prevents duplicates
    await storyRef.set({
        characterList: admin.firestore.FieldValue.arrayUnion(characterID),
    }, {merge: true});

    // Appends the storyID to the list of stories the character is included in
    await characterRef.set({
        storyList: admin.firestore.FieldValue.arrayUnion({
            id: storyID,
            title: storyDoc.data().title
        })
    }, {merge: true});

}

/*
*
* This is needed for displaying on the front end
 */
async function GetAllUserCharacters(username) {
    // Look in 'users' collection based on username, then get all the sourceIDs contained in each doc
    const characterSnapshot = await db
        .collection("users")
        .doc(username)
        .collection("characters")
        .get();

    // Then use the sourceIDs to query the image collection & collect all the images that match the sourceIds
    // In otherwords, get a list of all the characters
    return await Promise.all(
        characterSnapshot.docs.map(async (characterDoc) => {
            const characterData = characterDoc.data();
            const sourceID = characterData.sourceID;
            const characterID = characterDoc.id;

            const imageDoc = await db
                .collection("users")
                .doc(username)
                .collection("images")
                .doc(sourceID)
                .get();

            if (!imageDoc.exists) return null;

            const imageData = imageDoc.data();

            return {
                id: characterID,
                alias: imageData.alias,
                storyList: characterData.storyList || [],
                url: imageData.publicUrl,
            };
        })
    );
}

/*
 Self-explanatory
 */
async function GetAllUserStories(username) {
    const storySnapshot = await db
        .collection("users")
        .doc(username)
        .collection("stories")
        .get();

    return storySnapshot.docs.map((storyDoc) => {
        const storyData = storyDoc.data();

        return{
            id: storyDoc.id,
            title: storyData.title,
            description: storyData.description || "",
            pageCount: storyData.pageCount || 0
        };
    });
}

/*
Returns
- List of all the needed info to display & store character
- sourceID
- alias
- publicUrl
 */
async function GetStoryCharacters(username, storyID) {
    const storyDoc = await db
        .collection("users")
        .doc(username)
        .collection("stories")
        .doc(storyID)
        .get();

    if(!storyDoc.exists) return [];

    const storyData = storyDoc.data();
    // Check and see if storyData even has any characters, if so then get the list (will be a list of characterIDs)
    const characterList = Array.isArray(storyData.characterList) ? storyData.characterList : [];

    /*
     For every characterID in storyDoc.data() characterList...
    Look up the character in users/username/characters/
    Retrieve the sourceID from that document field
    Look up image using sourceID from users/username/images/
    Return {sourceID, alias, publicUrl} fields for that image
     */
    return await Promise.all(
        characterList.map(async (characterID) => {
            const characterDoc = await db
                .collection("users")
                .doc(username)
                .collection("characters")
                .doc(characterID)
                .get();

            if (!characterDoc.exists) return null;

            const characterData = characterDoc.data();
            const sourceID = characterData.sourceID;

            if (!sourceID) return null;

            const imageDoc = await db
                .collection("users")
                .doc(username)
                .collection("images")
                .doc(sourceID)
                .get()

            if (!imageDoc.exists) return null;

            const imageData = imageDoc.data();

            return {
                sourceID: sourceID,
                alias: imageData.alias,
                url: imageData.publicUrl,
            };
        })
    );
}

/*
 Use the storyID to get the storyDoc, then use pageNumber to index into the storyID's pageList to get the pageID
 Then use the pageID to retrieve the pageDoc to get audioPrompt, and the sourceID
 Then use the sourceID to get the publicUrl
 */
async function GetPageInfo(username, storyID, pageNumber) {
    // Get story doc
    const storyDoc = await db
        .collection("users")
        .doc(username)
        .collection("stories")
        .doc(storyID)
        .get();

    if(!storyDoc.exists) return null;

    const storyData = storyDoc.data();
    const pageList = Array.isArray(storyData.pageList) ? storyData.pageList : [];

    // Make sure page number not negative
    if(pageNumber < 0) return null;

    const pageID = pageList[pageNumber];
    console.log(pageID);

    // Get page doc
    const pageDoc = await db
        .collection("users")
        .doc(username)
        .collection("pages")
        .doc(pageID)
        .get();

    if(!pageDoc.exists) return null;

    const pageData = pageDoc.data();
    const sourceID = pageData.sourceID;

    let publicUrl = "";

    // get public url for image display
    if(sourceID){
        const imageDoc = await db
            .collection("users")
            .doc(username)
            .collection("images")
            .doc(sourceID)
            .get();

        if (imageDoc.exists) publicUrl = imageDoc.data().publicUrl;
    }

    return {
        audioPrompt: pageData.audioPrompt,
        sourceID: pageData.sourceID,
        generatedImage: publicUrl
    };
}

// Delete any page document with pageID in pageList
// Go to each character with characterID in characterList, remove story from storyList if id matches storyID
// Finally delete the story document
async function RemoveStory(username, storyID) {
    const storyRef = await db
        .collection("users")
        .doc(username)
        .collection("stories")
        .doc(storyID);

    const storyDoc = await storyRef.get();
    if(!storyDoc.exists) return false;

    const storyData = storyDoc.data();
    const pageList = Array.isArray(storyData.pageList) ? storyData.pageList : [];
    const characterList = Array.isArray(storyData.characterList) ? storyData.characterList : [];

    await Promise.all(
        // Go through page list, delete any page documents with a match pageID
        pageList.map(async (pageID) => {
            if(!pageID) return;
            await db
                .collection("users")
                .doc(username)
                .collection("pages")
                .doc(pageID)
                .delete();
        })
    );

    await Promise.all(
        characterList.map(async (characterID) => {
            if(!characterID) return;

            // Retrieve the character
            const characterRef = db
                .collection("users")
                .doc(username)
                .collection("characters")
                .doc(characterID)

            const characterDoc = await characterRef.get();
            if (!characterDoc.exists) return;

            const characterData = characterDoc.data();
            const storyList = Array.isArray(characterData.storyList) ? characterData.storyList : [];

            // Get the storyList without the storyID
            const filterList = storyList.filter((story) => {
                return story.id !== storyID;

            })

            // set the storyList to be the list without the storyID
            await characterRef.set(
                {
                    storyList: filterList,
                },
                {merge: true}
            );

        })
    );

    await storyRef.delete();
    return true;
}

module.exports = {SaveCharacter, AddCharacterToStory, GetAllUserCharacters, GetAllUserStories, AddStory, AddPage, SavePage, GetPageInfo, GetStoryCharacters, RemoveStory}