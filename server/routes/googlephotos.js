const express = require('express');
const router = express.Router();

const { CheckUserExists, GetOAuthToken } = require('../services/userfunctions');
const {CreateOAuthClient} = require('../services/oauth');
const {SaveGoogleImageToStorage} = require('../services/photo');

const {write_to_collection, update_collection} = require('../services/firestore');

// Saves Picker session, used to later access/download images selected
async function SaveSessionInformation(username, sessionData){
    await update_collection("users", username, {
        PickerSessionID: sessionData.id,
        PickerSessionURI: sessionData.pickerUri,
        PickerSessionCreationTime: Date.now()
    } );
}

/*
    Endpoint used to initalize the google photos pickerapi session.
    -> Get OAuth Refresh Token
    -> Obtain an access token
    -> Use access token to being a picker session
    -> Save picker session id & uri
    -> Send to front-end to open window for user to select images from google photos
 */
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

// Get the sessionID of the picker session, then make a request to the picker server to check if the selected photos are ready
// for download. If they are, then go ahead and retrieve the metadata of the available photos & save one-by-one to the cloud bucket.
// Once the images are saved to the cloud bucket, generated a signed url so frontend can access & download for displaying
router.get('/session/:sessionID/media', async (req, res) => {
    try{
        const {sessionID} = req.params;
        let {username, storyID} = req.query;
        if(!storyID) storyID = null;

        if(!sessionID){
            return res.status(400).json({error: "No session ID provided"});
        }

        if(username === undefined || username === null){
            return res.status(400).json({error: "No Username provided"});
        }

        const accessToken = await GetOAuthToken(username);

        if(!accessToken){
            return res.status(401).json({error: "Access token not obtained"});
        }

        const pickerStatus = await fetch(`https://photospicker.googleapis.com/v1/sessions/${encodeURIComponent(sessionID)}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });

        const pickerData = await pickerStatus.json();

        if(!pickerStatus.ok){
            return res.status(pickerStatus.status).json(pickerData);
        }

        if (!pickerData.mediaItemsSet) {
            return res.json({
                ready: false,
                sessionID,
                mediaItemsSet: false,
            });
        }

        const mediaRes = await fetch(
            `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${encodeURIComponent(sessionID)}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        );

        const mediaData = await mediaRes.json();

        if (!mediaRes.ok) {
            return res.status(mediaRes.status).json(mediaData);
        }

        const storedImages = [];

        // So mediaData should have a list of all the user's selected Items, go one-by-one and save to cloud bucket
        for (const item of mediaData.mediaItems || []) {
            const baseUrl = item?.mediaFile?.baseUrl;
            const filename = item?.mediaFile?.filename || `${item.id}.jpg`;
            const mimeType = item?.mediaFile?.mimeType || "image/jpeg";

            if (!baseUrl) continue;

            const photoRes = await fetch(`${baseUrl}=w1200-h1200`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!photoRes.ok) {
                continue;
            }

            const arrayBuffer = await photoRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const saved = await SaveGoogleImageToStorage({
                username,
                imageBuffer: buffer,
                filename,
                mimeType,
                sourceID: item.id,
                storyID
            });

            storedImages.push({
                id: item.id,
                url: saved.url,
                filename,
                mimeType,
                alias: saved.alias
            });
        }

        return res.json({
            ready: true,
            sessionID,
            mediaItemsSet: true,
            primaryImageUrl: storedImages[0]?.url || null,
            characterList: storedImages,
        });
    } catch (err) {
        return res.status(500).json({error: "Failed to fetch picked media", details: err.message});
    }

})

module.exports = router;
