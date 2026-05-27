export const DIFFICULTY_CONFIG = {
  easy: { quoteLength: 55, wordCount: 10 },
  medium: { quoteLength: 100, wordCount: 25 },
  hard: { quoteLength: Infinity, wordCount: 50 },
};

export const COLOR_SCHEME = {
  correct: '#00ff00',
  incorrect: '#ff0000',
  upcoming: '#cccccc',
  pending: 'white',
  completed: '#99ff99',
  empty: 'gray',
};

export const SELECTORS = {
  input: 'input',
  textDisplay: '#text',
  feedbackDisplay: '#character-feedback',
  form: 'form',
  modeSelect: '#modeSelect',
  languageSelect: '#languageSelect',
  difficultySelect: '#difficultySelect',
  restartButton: '#restartButton',
};
