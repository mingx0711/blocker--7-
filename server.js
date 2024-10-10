const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); // Import cors
const app = express();
const PORT = 3000;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const csvFilePath = './vocab.csv';
app.use(cors({
  origin: ['chrome-extension://kmfjppppoeecclokekeibenlmcpdcohk'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req,res) => {
  res.send('Hello from Express on Vercel!');
});

app.get('/fetch/:word', async (req, res) => {
  const word = req.params.word.replaceAll('ō', 'o').replaceAll('ā', 'a').replaceAll('ī', 'i').replaceAll('ū', 'u').replaceAll('ē', 'e');
      const fetch = await import('node-fetch'); // Dynamically import node-fetch
      const response = await fetch.default(`https://en.wiktionary.org/wiki/${word}`);
      const text = await response.text();
      res.send(text);
      console.log("success "+word)
});
app.listen(PORT, () => {
  console.log(`Server is runnin`);
});



