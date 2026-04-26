const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.SERVER_PORT || 8080;

const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// 10mb just to catch any audio transcribed to large errors
app.use(express.json({ limit:"10mb"}));

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:" + (process.env.CLIENT_PORT || 5173)
}));

const clientPath = path.join(__dirname, '../../client/src');
app.use(express.static(clientPath));

const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Note for any backend requests, I am choosing to use the /api/ prefix. See vite.config.js, this prefix should mirror the proxy
app.post("/api/transcribe", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});