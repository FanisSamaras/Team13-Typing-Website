import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from '../config/db.mjs';
import { title } from 'process';

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

  app.get('/user_page', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user.id;
    const username = req.session.user.username;
    const scores = db.prepare('SELECT wpm, acc FROM scores WHERE user_id = ?').all(userId);

    const hasScores = scores.length > 0;
    const stats = {
      hasScores,
      username,
      averageWpm: hasScores ? Number((scores.reduce((sum, score) => sum + score.wpm, 0) / scores.length).toFixed(1)) : null,
      averageAcc: hasScores ? Number((scores.reduce((sum, score) => sum + score.acc, 0) / scores.length).toFixed(1)) : null,
      bestWpm: hasScores ? Math.max(...scores.map((score) => score.wpm)) : null,
      bestAcc: hasScores ? Number(Math.max(...scores.map((score) => score.acc)).toFixed(1)) : null,
    };

    res.render('user_page', { title: 'Userdata', ...stats });
  });

  app.get('/leaderboards', (req, res) => {
    const allowedLanguages = ['english', 'greek'];
    const allowedModes = ['quotes', 'words'];

    const selectedLanguage = (req.query.language || 'all').toLowerCase();
    const selectedMode = (req.query.mode || 'all').toLowerCase();
    const filters = [];
    const params = [];

    if (allowedLanguages.includes(selectedLanguage)) {
      filters.push('scores.language = ?');
      params.push(selectedLanguage);
    }

    if (allowedModes.includes(selectedMode)) {
      filters.push('scores.mode = ?');
      params.push(selectedMode);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const stmt = db.prepare(`
      SELECT scores.wpm, scores.acc, scores.mode, scores.difficulty, scores.language, users.username
      FROM scores
      JOIN users ON scores.user_id = users.id
      ${whereClause}
      ORDER BY scores.wpm DESC, scores.acc DESC
      LIMIT 10
    `);

    const rows = stmt.all(...params).map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

    res.render('leaderboards_page', {
      title: 'Leaderboards',
      scores: rows,
      selectedLanguage,
      selectedMode,
      selectedLanguageEnglish: selectedLanguage === 'english',
      selectedLanguageGreek: selectedLanguage === 'greek',
      selectedLanguageAll: selectedLanguage !== 'english' && selectedLanguage !== 'greek',
      selectedModeQuotes: selectedMode === 'quotes',
      selectedModeWords: selectedMode === 'words',
      selectedModeAll: selectedMode !== 'quotes' && selectedMode !== 'words',
    });
  });

  app.get('/login', (req, res) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    res.render('login_page', { title: 'Log In' });
  });

  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('login_page', { title: 'Log In', error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('login_page', { title: 'Log In', error: 'Invalid email or password.' });
    }

    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.redirect('/');
  });

  app.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  app.get('/signup', (req, res) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    res.render('sign_up_page', { title: 'Sign Up' });
  });

  app.post('/api/signup', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.render('sign_up_page', { title: 'Sign Up', error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.render('sign_up_page', { title: 'Sign Up', error: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(normalizedEmail, username);
    if (existingUser) {
      return res.render('sign_up_page', { title: 'Sign Up', error: 'That email or username is already taken.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertStmt = db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
    const result = insertStmt.run(username, hashedPassword, normalizedEmail);

    req.session.user = { id: result.lastInsertRowid, username, email: normalizedEmail };
    res.redirect('/');
  });

  app.post('/api/score', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'You must be logged in to save scores.' });
    }

    const { wpm, accuracy, mode, difficulty, language } = req.body;
    if (typeof wpm !== 'number' || typeof accuracy !== 'number' || !mode || !difficulty || !language) {
      return res.status(400).json({ error: 'Incomplete score data.' });
    }

    const insertStmt = db.prepare(
      'INSERT INTO scores (user_id, language, acc, wpm, difficulty, mode) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertStmt.run(req.session.user.id, language, accuracy, wpm, difficulty, mode);

    res.json({ success: true });
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
