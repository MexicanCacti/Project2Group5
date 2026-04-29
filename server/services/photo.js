const path = require('path');
const {bucket, db} = require('./firestore');

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

    const [signedURL] = await GetSignedURL(file)

    // New file, save to bucket & firestore
    if(!existingFile.exists){
        await file.save(imageBuffer, {
            contentType: mimeType || 'image/jpeg',
            metadata: {
                username,
                source: "google_photos",
                sourceID
            },
            resumable: false,
        });


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
    }

    // Return the ID of the file, the signed url,
    return {
        id: sourceID,
        url: signedURL
    };
}

async function GetAllUserCharacters(username) {
    // Look in 'users' collection based on username, then the collection containing all the image storage info
    const characterSnapshot = await db
        .collection("users")
        .doc(username)
        .collection("images")
        .orderBy("createdAt", "desc")
        .get();

    // Normalize the return output
    return characterSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            url: data.publicUrl,
            alias: data.alias
        };
    })
        .filter((img) => img.url); // dont return any img with an undefined publicUrl
}

module.exports = {SaveGoogleImageToStorage, GetAllUserCharacters}