const express = require('express');
const {CheckUserExists} = require("../services/userfunctions");
const {db} = require("../services/firestore");
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads' });

router.post("/character/upload", upload.single("file"), async (req, res) => {
    console.log(req.file)
    console.log(req.body)
});

router.post("/alias/update", async (req, res) => {
    try{
        const { username, alias, sourceID } = req.body;

        if(!username) return res.status(400).json({error: "No username provided"});
        if(!alias) return res.status(400).json({error: "No alias provided"});
        if(!sourceID) return res.status(400).json({error: "No source ID provided"});

        const userRef = await CheckUserExists(username);
        if(!userRef) return res.status(404).json({error: "User not found"});

        const imageDocRef = db
            .collection("users")
            .doc(username)
            .collection("images")
            .doc(sourceID)

        const imageDoc = await imageDocRef.get();

        if(!imageDoc.exists){
            return res.status(404).json({error: "Image not found"});
        }

        await imageDocRef.update({
            alias: alias
        });

        return res.json({
            success: true,
            id: sourceID,
            alias
        });

    } catch (err){
        return res.status(500).json({error: err});
    }
})

module.exports=router;