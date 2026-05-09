import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/first_page.html'));
});

app.get('/leaderboards', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/leaderboards_page.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login_page.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/sign_up_page.html'));
});

const languageMap = {
  english: 'en',
  greek: 'el',
};

// API to get quotes
app.get('/api/quotes', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/quotes.json'));
});

app.get('/api/words/:lang', (req, res) => {
  const selectedLang = req.params.lang.toLowerCase();
  const fileCode = languageMap[selectedLang];

  if (!fileCode) {
    return res.status(400).json({ error: 'Unsupported language for words mode.' });
  }

  res.sendFile(path.join(__dirname, 'data', `${fileCode}.json`));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});