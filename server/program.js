const express = require('express');
const path = require('path');
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

// API to get quotes
app.get('/api/quotes', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/quotes.json'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});