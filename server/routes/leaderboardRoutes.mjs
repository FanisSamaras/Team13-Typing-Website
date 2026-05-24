import db from '../config/db.mjs';
import { ALLOWED_LANGUAGES, ALLOWED_MODES, LEADERBOARD_LIMIT } from '../config/constants.mjs';

const setupLeaderboardRoutes = (app) => {
  app.get('/leaderboards', (req, res) => {
    const selectedLanguage = (req.query.language || 'all').toLowerCase();
    const selectedMode = (req.query.mode || 'all').toLowerCase();
    const filters = [];
    const params = [];

    if (ALLOWED_LANGUAGES.includes(selectedLanguage)) {
      filters.push('scores.language = ?');
      params.push(selectedLanguage);
    }

    if (ALLOWED_MODES.includes(selectedMode)) {
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
      LIMIT ${LEADERBOARD_LIMIT}
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
};

export default setupLeaderboardRoutes;
