import { gameState } from './state.mjs';
import { getInputField, normalizeText, resetAccuracyTracking, getFeedbackDisplay } from './utils.mjs';
import { updateTypingAccuracy } from './accuracy.mjs';
import { renderTextWithInput } from './display.mjs';
import { advanceWord } from './game.mjs';

export function validateRealtime() {
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

export function checkInputCorrectness(input, word) {
  if (input.length === 0) return true;
  if (input.length > word.length) return false;

  for (let i = 0; i < input.length; i++) {
    if (input[i] !== word[i]) return false;
  }
  return true;
}

export function checkTypingSpace(e) {
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

export function triggerShakeEffect() {
  const inputField = getInputField();
  inputField.classList.add('shake-error');
  setTimeout(() => inputField.classList.remove('shake-error'), 300);
}

export async function restartGame() {
  const inputField = getInputField();
  inputField.value = '';
  inputField.style.borderColor = '';

  const feedbackDiv = getFeedbackDisplay();
  if (feedbackDiv) {
    feedbackDiv.innerHTML = '';
  }

  resetAccuracyTracking();

  const { displayRandomWord, displayRandomQuote } = await import('./display.mjs');
  if (gameState.currentMode === 'words') {
    displayRandomWord();
  } else {
    displayRandomQuote();
  }
  inputField.focus();
}
