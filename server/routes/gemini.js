const express = require('express');
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Note for any backend requests, I am choosing to use the /api/ prefix. See vite.config.js, this prefix should mirror the proxy
router.post("/transcribe", async (req, res) => {
    try {
        const { audio } = req.body;

        if (!audio) {
            return res.status(400).json({ error: "No audio found" });
        }

        // Basically give the prompt, then provide the data for the prompt to work with.
        const contents = [
            { text: "Transcribe the audio exactly. Return only the raw transcript with no surrounding text. Do not add any quotes or any other extra text. Only return the transcript." },
            {
                inlineData: {
                    mimeType: "audio/wav",
                    data: audio,
                },
            },
        ];

        // Model 2.5-flash-light used for cost-efficiency
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents,
        });

        return res.json({ text: response.text });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message || "Transcription failed",
        });
    }
});

// Note: This function will not work because we don't have api key permission to access flash-image
router.post("/generate", async (req, res) => {
    try {
        const { text } = req.body;

        if (typeof text !== "string") {
            return res.status(400).json({ error: "Invalid text input" });
        }

        // Basically give the prompt, then provide the data for the prompt to work with.
        const TextPrompt = `Create a cartoon-style illustration with clean outlines, vibrant colors, and a playful look: ${text}
    Do not give request further options or elaboration, just generate a single image and return that.`
        ;

        console.log(TextPrompt);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: TextPrompt
        });



        for (const part of response.parts || []) {
            if (part.inlineData) {
                return res.json({
                    imageBuffer: part.inlineData.data,
                    mimeType: part.inlineData.mimeType,
                });
            }
        }

        return res.status(500).json({
            error: "Generation failed",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message || "Generation failed",
        });
    }
});

module.exports=router;