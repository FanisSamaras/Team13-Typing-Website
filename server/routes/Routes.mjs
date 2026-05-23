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

const getTypingLevel = (wpm) => {
  if (wpm < 30) {
    return {
      label: 'Novice',
      description: 'You can only go up from here, keep up the good work!',
    };
  }
  if (wpm < 60) {
    return {
      label: 'Intermediate',
      description: 'You are getting better and it shows.',
    };
  }
  if (wpm < 90) {
    return {
      label: 'Advanced',
      description: 'You are getting pretty good at this just a little more to go.',
    };
  }
  return {
    label: 'Expert',
    description: 'You are in the 95th percentile in terms of typing speed and are ready for any sort of typing job',
  };
};

const getRequestedLanguage = (req, defaultLang = 'english') => {
  const requested = (req.params.lang || req.query.lang || req.query.language || defaultLang).toLowerCase();
  if (requested === 'el' || requested === 'greek') {
    return 'greek';
  }
  return 'english';
};

const setupRoutes = (app) => {
  // Serve views
  app.get('/', (req, res) => {
    res.render('first_page', { title: 'Faster', isHome: true });
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

  app.get('/result', (req, res) => {
    const mode = req.query.mode || 'words';
    const language = req.query.language || 'english';
    const difficulty = req.query.difficulty || 'easy';
    const source = req.query.source || '';
    const wpm = Number(req.query.wpm) || 0;
    const accuracy = Number(req.query.accuracy) || 0;
    const isLoggedIn = Boolean(req.session.user);
    const typingLevel = getTypingLevel(wpm);

    res.render('result_page', {
      title: 'Result',
      mode,
      language,
      difficulty,
      source,
      wpm,
      accuracy,
      showSource: mode === 'quotes' && Boolean(source),
      isLoggedIn,
      statusMessage: isLoggedIn
        ? 'Your score was submitted successfully.'
        : 'You are not logged in, so this score was not saved. Please log in to submit future scores.',
      levelLabel: typingLevel.label,
      levelDescription: typingLevel.description,
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
  app.get('/api/quotes/:lang?', (req, res) => {
    const requested = getRequestedLanguage(req, 'english');
    const fileName = requested === 'greek' ? 'quotes_el.json' : 'quotes_en.json';
    const filePath = fileURLToPath(new URL(`../data/${fileName}`, import.meta.url));
    res.sendFile(filePath);
  });

  app.get('/api/words/:lang?', (req, res) => {
    const requested = getRequestedLanguage(req, 'english');
    const fileCode = languageMap[requested];

    if (!fileCode) {
      return res.status(400).json({ error: 'Unsupported language for words mode.' });
    }

    const filePath = fileURLToPath(new URL(`../data/${fileCode}.json`, import.meta.url));
    res.sendFile(filePath);
  });
};

export default setupRoutes;
