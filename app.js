'use strict';
const express = require('express');
const app = express();

const path = require('path');

const multer = require('multer');
const upload = multer();

const fs = require('fs');
const StarParser = require('./backend/src/star-parser.js');
const { response } = require('express');
const { Server } = require('http');

// Set the port to listen on
const DEFAULT_PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON requests and make the contents available in the request body
app.use(express.json({ limit: '15mb' }));

// Set up the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function deserializeStarRecords(data) {
    // Process the data as needed
    let starParser = new StarParser();
    const parsedData = starParser.deserialize(data);
    return parsedData;
}

// Set up routes to handle JSON data and serve static assets
app.post('/upload-star-records', upload.single('file'), (req, res) => {
    // Access the file data in the request body
    const file = req.file;

    // Read the binary data in the file object
    const buffer = file.buffer;

    // Deserialize star records
    const starRecords = deserializeStarRecords(buffer);

    // Send a response to the client
    res.send({ status: 'success', data: starRecords });
});

app.get('/example-star-records', (req, res) => {
    // Open example star record file
    let fname = path.join(__dirname, 'backend/bin/stars.bin');
    fs.readFile(fname, (err, fd) => {
        let responseStatus;

        // Handle error reading star.bin file
        if (err) {
            console.error(err);
            if (err.code == 'ENOENT')
                // file not found
                responseStatus = 404;
            else
                // some other error
                responseStatus = 500;
            res.send({ status: responseStatus });
            return;
        }

        // Deserialize star records
        let starRecords;
        try {
            starRecords = deserializeStarRecords(fd);
        } catch (e) {
            // handle error deserializing star records
            responseStatus = 500;
            res.send({ status: responseStatus });
            return;
        }

        // Send a response to the client
        if (starRecords.length == 0)
            // no content
            responseStatus = 204;
        else
            // success
            responseStatus = 200;

        res.send({ status: responseStatus, data: starRecords });
    });
});

// Start the server
app.listen(DEFAULT_PORT, () => {
    console.log(`Server listening on port ${DEFAULT_PORT}`);
    console.log(`Open localhost:${DEFAULT_PORT} in your browser`);
});
