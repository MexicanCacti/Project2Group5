const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    return res.status(200).send(`<h1>Hello!</h1>`);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});