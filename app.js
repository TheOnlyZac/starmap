'use strict';
const express = require('express');
const app = express();
const PORT = 4200;

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Redirect root route
app.get('/', (req, res) => {
    res.redirect('/starmap');
});

// Serve client on /starmap
app.get('/starmap', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
