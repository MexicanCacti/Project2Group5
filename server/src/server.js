const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

const clientPath = path.join(__dirname, '../../client/src');
app.use(express.static(clientPath));

const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});


app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});