const path = require('path');
const {bucket, db, write_to_collection, read_collection} = require('./firestore');

async function GetSignedURL(file){
    return await file.getSignedUrl({
        action: "read",
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });
}

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

    await file.save(imageBuffer, {
        contentType: mimeType || 'image/jpeg',
        metadata: {
            username,
            source: "google_photos",
            sourceID
        },
        resumable: false,
    });

    const [signedURL] = await GetSignedURL(file)

    const docRef = await write_to_collection("users", username, {
        source: "google_photos",
            sourceID,
            filename: name,
            mimeType: mimeType || "image/jpeg",
            storagePath: objectPath,
            publicUrl: signedURL,
            createdAt: Date.now(),
        });

    return {
        id: docRef.id,
        url: signedURL,
        storagePath: objectPath
    };
}

module.exports = {SaveGoogleImageToStorage}