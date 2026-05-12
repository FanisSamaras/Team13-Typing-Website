import { fileURLToPath } from 'url';

const languageMap = {
  english: 'en',
  greek: 'el',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const setupRoutes = (app) => {
  // Serve views
  app.get('/', (req, res) => {
    res.render('first_page', { title: '1WEB3', isHome: true });
  });

  app.get('/leaderboards', (req, res) => {
    res.render('leaderboards_page', { title: 'Leaderboards' });
  });

  app.get('/login', (req, res) => {
    res.render('login_page', { title: 'Log In' });
  });

  app.get('/signup', (req, res) => {
    res.render('sign_up_page', { title: 'Sign Up' });
  });

  // API to get quotes
  app.get('/api/quotes', (req, res) => {
    const filePath = fileURLToPath(new URL('../data/quotes.json', import.meta.url));
    res.sendFile(filePath);
  });

  app.get('/api/words/:lang', (req, res) => {
    const selectedLang = req.params.lang.toLowerCase();
    const fileCode = languageMap[selectedLang];

    if (!fileCode) {
      return res.status(400).json({ error: 'Unsupported language for words mode.' });
    }

    const filePath = fileURLToPath(new URL(`../data/${fileCode}.json`, import.meta.url));
    res.sendFile(filePath);
  });
};

export default setupRoutes;
