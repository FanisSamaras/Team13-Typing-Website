import { SELECTORS } from './config.mjs';
import { gameState } from './state.mjs';

export function getInputField() {
  return document.querySelector(SELECTORS.input);
}

export function getTextDisplay() {
  return document.getElementById('text');
}

export function getFeedbackDisplay() {
  return document.getElementById('character-feedback');
}

export function resetAccuracyTracking() {
  gameState.totalChars = 0;
  gameState.totalCorrectChars = 0;
  gameState.previousInputValue = '';
  gameState.currentWordIndex = 0;
  gameState.startTime = null;
  gameState.isTyping = false;
}

export function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

export function getTextForWord(entry) {
  const rawWord = entry.targetWord && entry.targetWord.trim() ? entry.targetWord : entry.englishWord;
  return normalizeText(rawWord);
}
