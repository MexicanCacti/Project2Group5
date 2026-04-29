const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");

const { CheckUserExists, CreateUser, DoPasswordHash, SaveOAuthToken } = require('../services/userfunctions');

const {HandleOAuthCallback, InitOAuth} = require("../services/oauth");

const {db} = require('../services/firestore');
const {GetAllUserCharacters} = require("../services/photo");

// A test route to ensure database connection works
router.get("/firestore-test", async (req, res) => {
    try {
        const docRef = db.collection("users").doc("alovelace");

        await docRef.set({
            first: "Ada",
            last: "Lovelace",
            born: 1815
        });

        const aTuringRef = db.collection("users").doc("aturing");

        await aTuringRef.set({
            first: "Alan",
            middle: "Mathison",
            last: "Turing",
            born: 1912
        });

        const snapshot = await db.collection("users").get();
        const docs = [];

        snapshot.forEach((doc) => {
            docs.push({ id: doc.id, ...doc.data() });
        });

        return res.json({
            ok: true,
            databaseId: "default",
            docs
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            code: err.code,
            message: err.message,
            details: err.details || null,
            note: err.note || null
        });
    }
});

/*
* Expecting: Req.body to be of JSON format containing two fields: username, password
 */
router.post('/login', async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;

        if(!username || !password){
            return res.status(400).json({ error: "Username and password are required" });
        }

        const userDoc = await CheckUserExists(username);

        // If user doesn't exist, create a new user
        if(!userDoc){
            const hashedPassword = await DoPasswordHash(password);
            const createCheck = await CreateUser(username, hashedPassword);
            if(createCheck){
                return res.status(201).json({ message: `Created ${username}` });
            }
            return res.status(500).json({ error: "Login failed, server issue." });
        }

        const userData = userDoc.data();
        // Otherwise continue with authentication
        if(!bcrypt.compareSync(password, userData.password)){
            return res.status(401).json({ error: "Authentication failed." });
        }

        return res.status(200).json({ message: "Authentication succeeded" });
    } catch(err){
        console.log(err);
        return res.status(500).json({ error: "Login failed, server issue catch." });
    }
})

/*
    Req should contain username
 */
router.get('/o_status', async (req, res) => {
    try{
        const username = req.query.username;
        //console.log('req.query.username:', username);
        if(!username) {
            return res.status(400).json({ error: "No username supplied" });
        }

        const userRef = await CheckUserExists(username);
        if(!userRef) {
            return res.status(404).json({ error: "User not found"});
        }

        const userData = userRef.data();
        const refreshToken = userData?.refreshToken;

        if(!refreshToken) {
            const authURL = InitOAuth(req, res);
            return res.json({
                authNeeded: true,
                authURL,
            });
        }

        return res.json({
            authNeeded: false,
        });
    } catch(err){
        console.error('o_status error:', err);
        return res.status(500).json({error: "Oauth failed, o_status server issue catch."});
    }
});

router.get('/oauth_callback', async (req, res) => {
    try{
        const {tokens, username} = await HandleOAuthCallback(req, res);
        console.log('tokens:', tokens);
        if(!tokens) return;

        if(tokens.refresh_token){
            await SaveOAuthToken(username, tokens.refresh_token, tokens.expiry_date);
        }

        req.session.authenticated = true;
        delete req.session.state;
        delete req.session.username;

        return res.redirect(
            `${process.env.FRONTEND_OAUTH_COMPLETE_URL}`
        );
    } catch(err) {
        return res.status(500).json({error: "Oauth failed, server issue catch."});
    }
})

// Route to get all the character images stored for the user
router.get('/characters', async (req, res) => {
    try{
        const {username} = req.query;
        if(!username) {
            return res.status(400).json({ error: "No username supplied" });
        }

        const userRef = await CheckUserExists(username);
        if(!userRef) {
            return res.status(404).json({ error: "User not found" });
        }

        const characters = await GetAllUserCharacters(username);
        return res.json({ images: characters});

    } catch(err) {
        console.log(err);
        return res.status(500).json({error: "Failed to fetch characters.", details: err.message});
    }
});

module.exports=router;