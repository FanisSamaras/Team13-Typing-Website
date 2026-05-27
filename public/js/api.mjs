import { gameState } from './state.mjs';
import { getInputField, resetAccuracyTracking } from './utils.mjs';
import { displayRandomQuote, displayRandomWord } from './display.mjs';

export async function loadContent(language, mode, difficulty) {
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

export async function loadQuotes() {
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

export async function loadWords(language) {
  try {
    const response = await fetch(`/api/words/${language}`);
    const data = await response.json();
    gameState.items = data.words || [];
    displayRandomWord();
  } catch (error) {
    console.error('Error loading words:', error);
  }
}

export function saveScore(scoreData) {
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
