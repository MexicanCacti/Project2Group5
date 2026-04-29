const {CreateOAuthClient} = require("./oauth");

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

/*
    Function to use the saved refreshToken to obtain an access token. access token is used for picker api
 */
async function GetOAuthToken(username) {
    const userRef = await CheckUserExists(username);
    if (!userRef) return null;

    const userData = userRef.data();
    const refreshToken = userData?.refreshToken;
    if (!refreshToken) return null;

    const OAuth2Client = CreateOAuthClient();
    OAuth2Client.setCredentials({ refresh_token: refreshToken });

    const accessTokenRequest = await OAuth2Client.getAccessToken();
    return accessTokenRequest?.token || null;
}

module.exports = {CheckUserExists, CreateUser, DoPasswordHash, SaveOAuthToken, GetOAuthToken}