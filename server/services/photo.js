const path = require('path');
const {bucket, db} = require('./firestore');
const {SaveCharacter, AddCharacterToStory} = require('./storage');


async function GetSignedURL(file){
    return await file.getSignedUrl({
        action: "read",
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });
}



/*
Note: saving an image from non-google image will probably looks VERY similar to below
 */

/*
https://docs.cloud.google.com/storage/docs/access-control/signed-urls?utm_source=chatgpt.com
SignedURL basically is an authorized url request to download an item from the bucket
 */
async function SaveGoogleImageToStorage({
    username,
    imageBuffer,
    filename,
    mimeType,
    sourceID,
    storyID
                                        }){
    const name = filename || `${sourceID}.jpg`;
    const ext = path.extname(name) || '.jpg';
    const objectPath = `users/${username}/images/${sourceID}${ext}`;

    const file = bucket.file(objectPath);

    let existingFile = await db
        .collection('users')
        .doc(username)
        .collection('images')
        .doc(sourceID)
        .get();

    // New file, save to bucket & firestore
    if(!existingFile.exists){

        await file.save(imageBuffer, {
            contentType: mimeType,
            metadata: {
                username,
                source: "google_photos",
                sourceID
            },
            resumable: false,
        });

        const [signedURL] = await GetSignedURL(file)

        existingFile = await db
            .collection("users")
            .doc(username)
            .collection("images")
            .doc(sourceID)
            .set({
                source: "google_photos",
                sourceID: sourceID,
                filename: name,
                mimeType: mimeType || "image/jpeg",
                storagePath: objectPath,
                publicUrl: signedURL,
                createdAt: Date.now(),
                alias: "Default"
            });

        existingFile = await db
            .collection('users')
            .doc(username)
            .collection('images')
            .doc(sourceID)
            .get();
    }

    const imageData = existingFile.data();
    const alias = imageData?.alias || "Default";
    const signedURL = imageData?.publicUrl || (await GetSignedURL(file))[0];

    const characterID = await SaveCharacter(username, sourceID, alias);

    if(storyID){
        await AddCharacterToStory(username, storyID, characterID)
    }

    // Return the ID of the file, the signed url,
    return {
        id: sourceID,
        url: signedURL
    };
}

module.exports = {SaveGoogleImageToStorage}