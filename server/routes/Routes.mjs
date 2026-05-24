import setupAuthRoutes from './authRoutes.mjs';
import setupGameRoutes from './gameRoutes.mjs';
import setupLeaderboardRoutes from './leaderboardRoutes.mjs';
import { getQuotes, getWords } from '../config/apiCache.mjs';
import { LANGUAGE_MAP, ALLOWED_LANGUAGES } from '../config/constants.mjs';

const getRequestedLanguage = (req, defaultLang = 'english') => {
  const requested = (req.params.lang || req.query.lang || req.query.language || defaultLang).toLowerCase();
  if (requested === 'el' || requested === 'greek') {
    return 'greek';
  }
  return 'english';
};

const setupRoutes = (app) => {
  // Home page
  app.get('/', (req, res) => {
    res.render('first_page', { title: 'Faster', isHome: true });
  });

  // Setup route groups
  setupAuthRoutes(app);
  setupGameRoutes(app);
  setupLeaderboardRoutes(app);

  // API endpoints with caching
  app.get('/api/quotes/:lang?', (req, res) => {
    const requested = getRequestedLanguage(req, 'english');
    const data = getQuotes(requested);
    res.json(data);
  });

  app.get('/api/words/:lang?', (req, res) => {
    const requested = getRequestedLanguage(req, 'english');

    if (!ALLOWED_LANGUAGES.includes(requested)) {
      return res.status(400).json({ error: 'Unsupported language for words mode.' });
    }

    const data = getWords(requested);
    res.json(data);
  });
};

export default setupRoutes;
