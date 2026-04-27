const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 8080;

const geminiRouter = require("../routes/gemini");

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

app.use("/gemini", geminiRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
