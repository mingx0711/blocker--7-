
const cors = require('cors'); // Import cors
const app = express();
const PORT = 3000;
const csvFilePath = './vocab.csv';
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/fetch/:word', async (req, res) => {
  const word = req.params.word.replaceAll('ō', 'o').replaceAll('ā', 'a').replaceAll('ī', 'i').replaceAll('ū', 'u').replaceAll('ē', 'e');
  try {
      const fetch = await import('node-fetch'); // Dynamically import node-fetch
      const response = await fetch.default(`https://en.wiktionary.org/wiki/${word}`);
      const text = await response.text();
      res.send(text);
      console.log("success "+word)
  } catch (error) {
      res.status(500).send('Error fetching from Wiktionary');
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "fetchWordData") {
      const word = request.word;
      const apiUrl = `https://en.wiktionary.org/api/rest_v1/page/html/${word}?redirect=true&stash=true`;

      fetch(apiUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error("Network response was not ok");
              }
              return response.text();  // Wiktionary API returns HTML
          })
          .then(data => {
              sendResponse({ success: true, data: data });
          })
          .catch(error => {
              sendResponse({ success: false, error: error.message });
          });

      // Required to return true to indicate that the response is sent asynchronously
      return true;
  }
});


