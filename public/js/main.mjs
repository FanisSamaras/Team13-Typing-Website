// Configuration Constants
const DIFFICULTY_CONFIG = {
  easy: { quoteLength: 55, wordCount: 10 },
  medium: { quoteLength: 100, wordCount: 25 },
  hard: { quoteLength: Infinity, wordCount: 50 },
};

const COLOR_SCHEME = {
  correct: '#00ff00',
  incorrect: '#ff0000',
  upcoming: '#cccccc',
  pending: 'white',
  completed: '#99ff99',
  empty: 'gray',
};

const SELECTORS = {
  input: 'input',
  textDisplay: '#text',
  feedbackDisplay: '#character-feedback',
  form: 'form',
  modeSelect: '#modeSelect',
  languageSelect: '#languageSelect',
  difficultySelect: '#difficultySelect',
  restartButton: '#restartButton',
};

// Game State
const gameState = {
  items: [],
  wordArray: [],
  currentWordIndex: 0,
  currentQuoteSource: '',
  currentMode: 'quotes',
  currentLanguage: 'english',
  currentDifficulty: 'easy',
  startTime: null,
  isTyping: false,
  totalChars: 0,
  totalCorrectChars: 0,
  previousInputValue: '',
};

// Utility Functions
function getInputField() {
  return document.querySelector(SELECTORS.input);
}

function getTextDisplay() {
  return document.getElementById('text');
}

function getFeedbackDisplay() {
  return document.getElementById('character-feedback');
}

function resetAccuracyTracking() {
  gameState.totalChars = 0;
  gameState.totalCorrectChars = 0;
  gameState.previousInputValue = '';
  gameState.currentWordIndex = 0;
  gameState.startTime = null;
  gameState.isTyping = false;
}

// API Functions
async function loadContent(language, mode, difficulty) {
  gameState.currentLanguage = language;
  gameState.currentMode = mode;
  gameState.currentDifficulty = difficulty;
  getInputField().value = '';
  gameState.startTime = null;
  gameState.isTyping = false;
  resetAccuracyTracking();

  if (mode === 'words') {
    await loadWords(language);
  } else {
    await loadQuotes();
  }
}

async function loadQuotes() {
  try {
    const langCode = (gameState.currentLanguage === 'greek' || gameState.currentLanguage === 'el') ? 'el' : 'en';
    const response = await fetch(`/api/quotes?lang=${langCode}`);
    const data = await response.json();
    gameState.items = data.quotes || [];
    displayRandomQuote();
  } catch (error) {
    console.error('Error loading quotes:', error);
  }
}

async function loadWords(language) {
  try {
    const response = await fetch(`/api/words/${language}`);
    const data = await response.json();
    gameState.items = data.words || [];
    displayRandomWord();
  } catch (error) {
    console.error('Error loading words:', error);
  }
}

// Content Processing Functions
function filterQuotesByDifficulty(quotes, difficulty) {
  if (!quotes.length) return [];
  const maxLength = DIFFICULTY_CONFIG[difficulty]?.quoteLength || Infinity;
  return quotes.filter((quote) => {
    const length = quote.length || quote.text.length || 0;
    return length <= maxLength;
  });
}

function getWordCountForDifficulty(difficulty) {
  return DIFFICULTY_CONFIG[difficulty]?.wordCount || 50;
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function getTextForWord(entry) {
  const rawWord = entry.targetWord && entry.targetWord.trim() ? entry.targetWord : entry.englishWord;
  return normalizeText(rawWord);
}

// Display Functions
function displayRandomQuote() {
  if (!gameState.items.length) {
    gameState.wordArray = ['No quotes available.'];
    gameState.currentQuoteSource = '';
  } else {
    const filtered = filterQuotesByDifficulty(gameState.items, gameState.currentDifficulty);
    const activeQuotes = filtered.length ? filtered : gameState.items;
    const randomIndex = Math.floor(Math.random() * activeQuotes.length);
    const quoteText = normalizeText(activeQuotes[randomIndex].text);
    gameState.wordArray = quoteText.split(' ').filter((w) => w.length > 0);
    gameState.currentQuoteSource = activeQuotes[randomIndex].source || '';
  }
  resetAccuracyTracking();
  displayCurrentWord();
}

function displayRandomWord() {
  const wordCount = getWordCountForDifficulty(gameState.currentDifficulty);
  if (!gameState.items.length) {
    gameState.wordArray = ['No words available.'];
  } else {
    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * gameState.items.length);
      selectedWords.push(getTextForWord(gameState.items[randomIndex]));
    }
    gameState.wordArray = selectedWords;
  }
  gameState.currentQuoteSource = '';
  resetAccuracyTracking();
  displayCurrentWord();
}

function renderTextWithInput(inputValue = '') {
  const textDiv = getTextDisplay();
  let html = '';
  const normalizedInput = normalizeText(inputValue);
  const currentWord = normalizeText(gameState.wordArray[gameState.currentWordIndex] || '');

  for (let i = 0; i < gameState.wordArray.length; i++) {
    if (i < gameState.currentWordIndex) {
      html += `<span style="color: ${COLOR_SCHEME.completed}; opacity: 0.85;">${gameState.wordArray[i]}</span> `;
    } else if (i === gameState.currentWordIndex) {
      if (!normalizedInput) {
        html += `<span style="color: ${COLOR_SCHEME.pending};">${gameState.wordArray[i]}</span> `;
      } else {
        html += renderCharacterComparison(normalizedInput, currentWord);
      }
    } else {
      html += `<span style="color: ${COLOR_SCHEME.upcoming}; opacity: 0.9;">${gameState.wordArray[i]}</span> `;
    }
  }

  textDiv.innerHTML = html;
}

function renderCharacterComparison(input, word) {
  let wordHtml = '';
  const wordLength = word.length;
  const inputLength = input.length;
  const minLength = Math.min(inputLength, wordLength);

  for (let j = 0; j < minLength; j++) {
    const color = input[j] === word[j] ? COLOR_SCHEME.correct : COLOR_SCHEME.incorrect;
    wordHtml += `<span style="color: ${color};">${input[j]}</span>`;
  }

  if (inputLength < wordLength) {
    for (let j = inputLength; j < wordLength; j++) {
      wordHtml += `<span style="color: ${COLOR_SCHEME.empty}; opacity: 0.5;">${word[j]}</span>`;
    }
  } else if (inputLength > wordLength) {
    for (let j = wordLength; j < inputLength; j++) {
      wordHtml += `<span style="color: ${COLOR_SCHEME.incorrect};">${input[j]}</span>`;
    }
  }

  return `<span>${wordHtml}</span> `;
}

function displayCurrentWord() {
  if (gameState.currentWordIndex >= gameState.wordArray.length) {
    finishGame();
    return;
  }

  renderTextWithInput('');
  const inputField = getInputField();
  inputField.value = '';
  inputField.style.borderColor = '';
  gameState.previousInputValue = '';

  const feedbackDiv = getFeedbackDisplay();
  if (feedbackDiv) {
    feedbackDiv.remove();
  }

  inputField.focus();
}

// Accuracy Tracking Functions
function updateTypingAccuracy(currentValue) {
  const currentRaw = currentValue;
  const previousRaw = gameState.previousInputValue;
  const currentWord = normalizeText(gameState.wordArray[gameState.currentWordIndex] || '');

  if (currentRaw.length > previousRaw.length) {
    for (let i = previousRaw.length; i < currentRaw.length; i++) {
      gameState.totalChars += 1;
      if (currentRaw[i] === currentWord[i]) {
        gameState.totalCorrectChars += 1;
      }
    }
  }

  gameState.previousInputValue = currentRaw;
}

function advanceWord(inputValue = '') {
  const currentWord = normalizeText(gameState.wordArray[gameState.currentWordIndex]);
  if (!gameState.startTime) {
    gameState.startTime = new Date();
    gameState.isTyping = true;
  }

  const normalizedInput = normalizeText(inputValue);
  if (normalizedInput.length > gameState.previousInputValue.length) {
    updateTypingAccuracy(inputValue);
  }

  gameState.currentWordIndex += 1;
  displayCurrentWord();
}

// Game Completion Functions
function finishGame() {
  const endTime = new Date();
  const timeTaken = (endTime - gameState.startTime) / 1000 / 60;
  const totalQuoteChars = gameState.wordArray.join(' ').length;
  const wpm = timeTaken > 0 ? Math.round(totalQuoteChars / 5 / timeTaken) : 0;
  const accuracy = gameState.totalChars
    ? Math.max(0, Math.round((gameState.totalCorrectChars / gameState.totalChars) * 100))
    : 100;

  saveScore({ wpm, accuracy });
  redirectToResults({ wpm, accuracy });
}

function saveScore(scoreData) {
  fetch('/api/score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wpm: scoreData.wpm,
      accuracy: scoreData.accuracy,
      mode: gameState.currentMode,
      difficulty: gameState.currentDifficulty,
      language: gameState.currentLanguage,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.warn('Score not saved:', error.error || response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data?.success) {
        console.log('Score saved successfully');
      }
    })
    .catch((error) => {
      console.error('Unable to save score:', error);
    });
}

function redirectToResults(scoreData) {
  const sourceParam = gameState.currentMode === 'quotes' ? `&source=${encodeURIComponent(gameState.currentQuoteSource || '')}` : '';
  const params = new URLSearchParams({
    mode: gameState.currentMode,
    language: gameState.currentLanguage,
    wpm: scoreData.wpm,
    accuracy: scoreData.accuracy,
    difficulty: gameState.currentDifficulty,
  });

  if (gameState.currentMode === 'quotes' && gameState.currentQuoteSource) {
    params.append('source', gameState.currentQuoteSource);
  }

  window.location.href = `/result?${params.toString()}`;
}

// Character Feedback Display
function displayCharacterFeedback() {
  const inputField = getInputField();
  const normalizedInput = normalizeText(inputField.value);
  const currentWord = normalizeText(gameState.wordArray[gameState.currentWordIndex]);

  const feedbackHTML = renderCharacterComparison(normalizedInput, currentWord);

  let feedbackDiv = getFeedbackDisplay();
  if (!feedbackDiv) {
    feedbackDiv = document.createElement('div');
    feedbackDiv.id = 'character-feedback';
    feedbackDiv.style.fontSize = '1.5rem';
    feedbackDiv.style.fontFamily = 'monospace';
    feedbackDiv.style.marginBottom = '1rem';
    feedbackDiv.style.minHeight = '2rem';
    feedbackDiv.style.lineHeight = '2rem';
    feedbackDiv.style.letterSpacing = '0.1rem';
    inputField.parentElement.insertBefore(feedbackDiv, inputField);
  }

  feedbackDiv.innerHTML = feedbackHTML;
}

// Validation Functions
function validateRealtime() {
  const inputField = getInputField();
  const normalizedInput = normalizeText(inputField.value);
  const currentWord = normalizeText(gameState.wordArray[gameState.currentWordIndex]);

  const isCorrect = checkInputCorrectness(normalizedInput, currentWord);

  if (!gameState.startTime && normalizedInput.length > 0) {
    gameState.startTime = new Date();
    gameState.isTyping = true;
  }

  updateTypingAccuracy(inputField.value);

  if (gameState.currentWordIndex === gameState.wordArray.length - 1 && normalizedInput === currentWord) {
    advanceWord(inputField.value);
    return;
  }

  inputField.style.borderColor = normalizedInput.length === 0 ? '' : (isCorrect ? 'green' : 'red');
  renderTextWithInput(inputField.value);
}

function checkInputCorrectness(input, word) {
  if (input.length === 0) return true;
  if (input.length > word.length) return false;

  for (let i = 0; i < input.length; i++) {
    if (input[i] !== word[i]) return false;
  }
  return true;
}

// Input Handling Functions
function checkTypingSpace(e) {
  if (e.key !== ' ') {
    return;
  }

  const input = normalizeText(getInputField().value);
  const currentWord = normalizeText(gameState.wordArray[gameState.currentWordIndex]);

  if (input !== currentWord) {
    e.preventDefault();
    triggerShakeEffect();
    return;
  }

  e.preventDefault();
  advanceWord(getInputField().value);
}

function triggerShakeEffect() {
  const inputField = getInputField();
  inputField.classList.add('shake-error');
  setTimeout(() => inputField.classList.remove('shake-error'), 300);
}

function restartGame() {
  const inputField = getInputField();
  inputField.value = '';
  inputField.style.borderColor = '';

  const feedbackDiv = getFeedbackDisplay();
  if (feedbackDiv) {
    feedbackDiv.innerHTML = '';
  }

  resetAccuracyTracking();
  if (gameState.currentMode === 'words') {
    displayRandomWord();
  } else {
    displayRandomQuote();
  }
  inputField.focus();
}

// Event Initialization
document.addEventListener('DOMContentLoaded', () => {
  initializeFormListener();
  initializeInputListeners();
  initializeRestartButton();
  loadContent('english', 'words', 'easy');
});

function initializeFormListener() {
  const form = document.querySelector(SELECTORS.form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const language = document.getElementById('languageSelect').value || 'english';
    const mode = document.getElementById('modeSelect').value || 'quotes';
    const difficulty = document.getElementById('difficultySelect').value || 'easy';
    await loadContent(language, mode, difficulty);
    getInputField().focus();
  });
}

function initializeInputListeners() {
  const inputField = getInputField();
  inputField.addEventListener('keydown', checkTypingSpace);
  inputField.addEventListener('input', validateRealtime);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      restartGame();
    }
  });
}

function initializeRestartButton() {
  document.getElementById('restartButton').addEventListener('click', restartGame);
}