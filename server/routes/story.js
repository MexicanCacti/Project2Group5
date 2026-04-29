const express = require('express');
const {CheckUserExists} = require("../services/userfunctions");
const {AddStory, AddCharacterToStory} = require('../services/storage')

const router = express.Router();

router.post("/create", async (req, res) => {
    try{
        const {username, title, description, characterList} = req.body;

        if(!username) return res.status(400).json({error: "No username provided"});
        if(!title) return res.status(400).json({error: "No title provided"});
        if(!description) return res.status(400).json({error: "No description provided"});

        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        // Only want the characterIDs, empty list of no characters passed
        const extractedCharacterIDs = characterList ? characterList.map((character) => character.characterID) : [];

        const storyInfo = await AddStory(username, title, description);

        // Add character to story's character list & add story to list of stories character is apart of
        for (const characterID of extractedCharacterIDs) {
            console.log('Adding characterID' + characterID);
            await AddCharacterToStory(username, storyInfo.storyID, characterID);
        }

        return res.status(201).json({
            message: "Successfully created story",
            storyID: storyInfo.storyID,
        })
    } catch(err){
        return res.status(500).json({error: "Failed to create story"});
    }

});


module.exports=router;