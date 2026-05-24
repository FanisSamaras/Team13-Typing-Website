import bcrypt from 'bcryptjs';
import db from '../config/db.mjs';

const setupAuthRoutes = (app) => {
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
};

export default setupAuthRoutes;
