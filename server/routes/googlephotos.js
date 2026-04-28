const express = require('express');
const router = express.Router();

const { CheckUserExists, CreateUser, DoPasswordHash, SaveOAuthToken } = require('../services/userfunctions');
const {CreateOAuthClient} = require('../services/oauth');

const {db} = require('../services/firestore');

async function SaveSessionInformation(username, sessionData){
    await db.collection('users').doc(username).set({
        PickerSessionID: sessionData.id,
        PickerSessionURI: sessionData.pickerUri,
        PickerSessionCreationTime: Date.now()
    }, {merge : true});
}

router.post('/session', async (req, res) => {
    try{
        const { username } = req.body;

        if(!username) return res.status(400).json({error: "No username provided"});

        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        const userData = userRef.data();
        const refreshToken = userData?.refreshToken;

        if(!refreshToken) return res.status(400).json({error: "OAuth required"});

        const OAuth2Client = CreateOAuthClient();
        OAuth2Client.setCredentials({refresh_token: refreshToken});

        const accessTokenRequest = await OAuth2Client.getAccessToken();
        const accessToken = accessTokenRequest?.token;

        if(!accessToken) return res.status(401).json({error: "Access token not obtained"});

        const sessionRes = await fetch('https://photospicker.googleapis.com/v1/sessions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pickingConfig: {
                    maxItemCount: 1,
                },
            }),
        });

        const sessionData = await sessionRes.json();

        if(!sessionRes.ok) return res.status(sessionRes.status).json(sessionData);

        await SaveSessionInformation(username, sessionData);

        return res.json({
            pickerUri: sessionData.pickerUri,
            sessionID: sessionData.id,
        });
    } catch (err) {
        return res.status(500).json({error: "Failed to create picker session", details: err.message})
    }
})

module.exports = router;
