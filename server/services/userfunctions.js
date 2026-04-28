const bcrypt = require("bcryptjs");
const saltRounds = 1;

// DB already connected, see firestore.js, all db transactions use db
const {db} = require('./firestore');

async function CheckUserExists(username) {
    // Note: Username are the docIDs, guaranteed to be unique
    const doc = await db.collection('users').doc(username).get();
    return doc.exists ? doc : null;
}

async function CreateUser(username, password) {

    //Goes to the collection "user", sets the DocID to be username, then sets the username & password fields
    const docRef = db.collection("users").doc(username);

    await docRef.set({
        username: username,
        password: password
    });

    return true;
}

async function DoPasswordHash(password){
    return bcrypt.hash(password, saltRounds);
}

async function SaveOAuthToken(username, refreshToken, expiryTime) {
    const update = {
        photosConnected: true,
        connectedAt: Date.now(),
        refreshToken: refreshToken,
        refreshExpire: expiryTime
    };

    await db.collection('users').doc(username).set(update, { merge: true });
}

module.exports = {CheckUserExists, CreateUser, DoPasswordHash, SaveOAuthToken}