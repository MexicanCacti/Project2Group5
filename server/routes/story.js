const express = require('express');
const {CheckUserExists} = require("../services/userfunctions");
const {AddStory, AddCharacterToStory, GetStoryCharacters, GetPageInfo, AddPage, SavePage, RemoveStory} = require('../services/storage')

const router = express.Router();

/*
 Input =
  {username, title of story, description of story, characterList}
  Uses above fields to create a story document & add the storyID to each character in the characterList document
 */
router.post("/create", async (req, res) => {
    try{
        const {username, title, description, characterList} = req.body;

        if(username === undefined || username === null) return res.status(400).json({error: "No username provided"});
        if(!title) return res.status(400).json({error: "No title provided"});
        if(!description) return res.status(400).json({error: "No description provided"});

        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        // Only want the characterIDs, empty list if no characters passed
        const extractedCharacterIDs = characterList ? characterList.map((character) => character.id) : [];

        const storyInfo = await AddStory(username, title, description);

        // Add character to story's character list & add story to list of stories character is apart of
        for (const characterID of extractedCharacterIDs) {
            await AddCharacterToStory(username, storyInfo.storyID, characterID);
        }

        // console.log("Story created")
        return res.status(201).json({
            storyTitle: storyInfo.storyTitle,
            storyID: storyInfo.storyID,
        })
    } catch(err){
        return res.status(500).json({error: "Failed to create story"});
    }

});

/*
 Input =
 { username, pageNumber, image sourceID, audioPrompt text, storyID}

 Saves into the pages collection, creates a document with the above fields then saves the pageID to the story document pageList field
 */
router.post("/create/page", async (req, res) => {
    try{
        const {username, pageNumber, storyID} = req.body;
        if(username === undefined || username === null) return res.status(400).json({error: "No username provided"});
        if(pageNumber === undefined || pageNumber === null) return res.status(400).json({error: "No page number provided"});
        if(storyID === undefined || storyID === null) return res.status(400).json({error: "No storyID provided"});

        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        const pageID = await AddPage(username, pageNumber, storyID);

        return res.status(201).json({
            message: "Successfully created page",
            pageID: pageID,
        })
    } catch(err) {
        return res.status(500).json({error: "Failed to create page"});
    }
})

/*
 Input =
 { username, pageNumber, image sourceID, audioPrompt text, pageID}

 Saves into the pages collection, creates a document with the above fields then saves the pageID to the story document pageList field
 */
router.post("/save/page", async (req, res) => {
    try{
        const {username, pageNumber, sourceID, audioPrompt, pageID} = req.body;
        console.log(`Received: ${username}, ${pageNumber}, ${sourceID}, ${audioPrompt}, ${pageID}`);
        if(username === undefined || username === null) return res.status(400).json({error: "No username provided"});
        if(pageNumber === undefined || pageNumber === null) return res.status(400).json({error: "No page number provided"});
        if(sourceID === undefined || sourceID === null) return res.status(400).json({error: "No source ID provided"});
        if(pageID === undefined || pageID === null) return res.status(400).json({error: "No pageID provided"});
        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        const result = await SavePage(username, pageNumber, sourceID, audioPrompt, pageID);

        return res.status(201).json({
            message: "Successfully created page",
            pageID: result,
        })
    } catch(err) {
        return res.status(500).json({error: "Failed to create page"});
    }
})

/*
Returns
characterList: { {sourceID, alias, publicUrl} ... }
 */

router.get("/characters/:username/:storyID", async (req, res) => {
    try{
        const {username, storyID} = req.params;
        if(username === undefined || username === null) return res.status(400).json({error: "No username provided"});
        if(storyID === undefined || storyID === null) return res.status(400).json({error: "No storyID provided"});

        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        const characters = await GetStoryCharacters(username, storyID);

        return res.status(200).json({
            characterList: characters
        });
    }
    catch(err){
        return res.status(500).json({error: "Failed to fetch characters"});
    }
})

/*
* Returns
* - audioPrompt: The text transcript used to create the generated page image
* - generatedImage: The publicUrl used to access the stored generated image
 */
router.get("/page/:username/:storyID/:pageNumber", async (req, res) => {
    try{
        const { username, storyID, pageNumber} = req.params;
        console.log("backend /page/.../page# receieved: ", username + " " + storyID + " " + pageNumber);
        if(username === undefined || username === null) return res.status(400).json({error: "No username provided"});
        if(storyID === undefined || storyID === null) return res.status(400).json({error: "No storyID provided"});
        if(pageNumber === undefined || pageNumber === null) return res.status(404).json({error: "No page number provided"});
        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        // Note: Add a check to see if the page number is valid!
        const pageInfo = await GetPageInfo(username, storyID, pageNumber);

        return res.status(200).json({
            audioPrompt: pageInfo.audioPrompt,
            sourceID: pageInfo.sourceID,
            generatedImage: pageInfo.generatedImage
        });

    } catch(err){
        return res.status(500).json({error: "Failed to fetch page number"});
    }
})

router.delete("/:username/:storyID", async (req, res) => {
    try{
        const {username, storyID} = req.params;
        //console.log(`Delete recieved: ${username}, ${storyID}`);
        if(username === undefined || username === null) return res.status(400).json({error: "No username provided"});
        if(storyID === undefined || storyID === null) return res.status(400).json({error: "No storyID provided"});

        const userRef = await CheckUserExists(username);

        if(!userRef) return res.status(404).json({error: "User not found"});

        const storyRemove = await RemoveStory(username, storyID);
        if(!storyRemove){
            return res.status(500).json({error: "Failed to remove story"});
        }

        return res.status(200).json({message: "Successfully removed story with id " + storyRemove.id});
    } catch (err){
        return res.status(500).json({error: "Failed to remove story"})
    }

})

module.exports=router;