const {db} = require('../services/firestore');
const admin = require("firebase-admin");


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
* Note for storyList, this backend function looks up every story and create a new list that has the {id, title}
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

module.exports = {SaveCharacter, AddCharacterToStory, GetAllUserCharacters, AddStory}