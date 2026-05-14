import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from '../config/db.mjs';

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
    const stmt = db.prepare(`
      SELECT scores.wpm, scores.acc, scores.mode, scores.difficulty, scores.created_at, users.username
      FROM scores
      JOIN users ON scores.user_id = users.id
      ORDER BY scores.wpm DESC, scores.acc DESC, scores.created_at ASC
      LIMIT 20
    `);
    const rows = stmt.all().map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
    res.render('leaderboards_page', { title: 'Leaderboards', scores: rows });
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

    const { wpm, accuracy, mode, difficulty } = req.body;
    if (typeof wpm !== 'number' || typeof accuracy !== 'number' || !mode || !difficulty) {
      return res.status(400).json({ error: 'Incomplete score data.' });
    }

    const insertStmt = db.prepare(
      'INSERT INTO scores (user_id, acc, wpm, difficulty, mode) VALUES (?, ?, ?, ?, ?)'
    );
    insertStmt.run(req.session.user.id, accuracy, wpm, difficulty, mode);

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
