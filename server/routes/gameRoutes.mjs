import db from '../config/db.mjs';
import { TYPING_LEVELS,ALLOWED_LANGUAGES,ALLOWED_MODES,LEADERBOARD_LIMIT } from '../config/constants.mjs';

const getTypingLevel = (wpm) => {
  if (wpm < TYPING_LEVELS.NOVICE.threshold) {
    return { label: TYPING_LEVELS.NOVICE.label, description: TYPING_LEVELS.NOVICE.description };
  }
  if (wpm < TYPING_LEVELS.INTERMEDIATE.threshold) {
    return { label: TYPING_LEVELS.INTERMEDIATE.label, description: TYPING_LEVELS.INTERMEDIATE.description };
  }
  if (wpm < TYPING_LEVELS.ADVANCED.threshold) {
    return { label: TYPING_LEVELS.ADVANCED.label, description: TYPING_LEVELS.ADVANCED.description };
  }
  return { label: TYPING_LEVELS.EXPERT.label, description: TYPING_LEVELS.EXPERT.description };
};

const setupGameRoutes = (app) => {
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
  app.get("/user_page/personalHistory", (req,res)=>{
    if (!req.session.user){
      return res.redirect("/login");
    }
    const selectedLanguage = (req.query.language || 'all').toLowerCase();
    const selectedMode = (req.query.mode || 'all').toLowerCase();
    const filters = ['scores.user_id = ?'];
    const params = [req.session.user.id];

    if (ALLOWED_LANGUAGES.includes(selectedLanguage)) {
      filters.push('scores.language = ?');
      params.push(selectedLanguage);
    }

    if (ALLOWED_MODES.includes(selectedMode)) {
      filters.push('scores.mode = ?');
      params.push(selectedMode);
    }

    const whereClause = `WHERE ${filters.join('AND')}`;

    const stmt = db.prepare(`
      SELECT scores.wpm, scores.acc, scores.mode, scores.difficulty, scores.language, users.username
      FROM scores
      JOIN users ON scores.user_id = users.id
      ${whereClause}
      ORDER BY scores.wpm DESC, scores.acc DESC
      LIMIT ${LEADERBOARD_LIMIT}
    `);

    const rows = stmt.all(...params).map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

    res.render('leaderboards_page', {
      title: 'Personal History',
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
};

export default setupGameRoutes;
