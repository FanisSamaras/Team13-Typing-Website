export const TYPING_LEVELS = {
  NOVICE: { threshold: 30, label: 'Novice', description: 'You can only go up from here, keep up the good work!' },
  INTERMEDIATE: { threshold: 60, label: 'Intermediate', description: 'You are getting better and it shows.' },
  ADVANCED: { threshold: 90, label: 'Advanced', description: 'You are getting pretty good at this just a little more to go.' },
  EXPERT: { label: 'Expert', description: 'You are in the 95th percentile in terms of typing speed and are ready for any sort of typing job' },
};

export const ALLOWED_LANGUAGES = ['english', 'greek'];
export const ALLOWED_MODES = ['quotes', 'words'];
export const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'];

export const LEADERBOARD_LIMIT = 10;

export const LANGUAGE_MAP = {
  english: 'en',
  greek: 'el',
};
