import { gameState } from './state.mjs';
import { normalizeText } from './utils.mjs';
import { updateTypingAccuracy } from './accuracy.mjs';
import { displayCurrentWord } from './display.mjs';
import { saveScore } from './api.mjs';

export function advanceWord(inputValue = '') {
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

export function finishGame() {
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

export function redirectToResults(scoreData) {
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
