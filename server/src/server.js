const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 8080;

// 10mb just to catch any audio transcribed too large errors
app.use(express.json({ limit:"10mb"}));
app.use(cors({
  origin: "http://localhost:" + (process.env.CLIENT_PORT || 5173)
}));

const geminiRouter = require("../routes/gemini");
const userRouter = require("../routes/user");
const googlePhotosRouter = require("../routes/googlephotos");
const characterRouter = require("../routes/character");
const storyRouter = require("../routes/story");

const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

// Needed to send state for OAuth w/ Google
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
  },
}));

app.use("/gemini", geminiRouter);
app.use("/user", userRouter);
app.use("/googlephotos", googlePhotosRouter);
app.use("/character", characterRouter)
app.use('/story', storyRouter)

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
