const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const Papa = require('papaparse');

const app = express();
const PORT = 3000;
const csvFilePath = './vocab.csv';

app.use(bodyParser.json());
app.use(express.static('public'));

// Read CSV file
function readCSV() {
  if (fs.existsSync(csvFilePath)) {
    return fs.readFileSync(csvFilePath, 'utf8');
  }
  return 'Word,Definition\n';
}

// Write to CSV file
function writeCSV(data) {
  fs.writeFileSync(csvFilePath, data, 'utf8');
}

// Get vocabulary list
app.get('/getVocab', (req, res) => {
  const csvData = readCSV();
  res.json({ csvData });
});

// Add a new vocabulary word
app.post('/addVocab', (req, res) => {
  const { word, definition } = req.body;
  let csvData = readCSV();
  
  csvData += `${word},${definition}\n`;
  writeCSV(csvData);
  
  res.json({ csvData });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
