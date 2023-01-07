const express = require('express');
const app = express();

const path = require('path');

const multer = require('multer');
const upload = multer();

const StarParser = require('./stars')

// Set the port to listen on
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON requests and make the contents available in the request body
app.use(express.json({ limit: '15mb' }));

// Set up the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Set up routes to handle JSON data and serve static assets
app.post('/process-star-data', upload.single('file'), (req, res) => {
  // Access the file data in the request body
  const file = req.file;

  // Read the binary data in the file object
  const data = file.buffer;

  // Process the data as needed
  starParser = new StarParser();
  const parsedData = starParser.deserialize(data);

  // Send a response to the client
  res.send({ status: 'success', data: parsedData });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
