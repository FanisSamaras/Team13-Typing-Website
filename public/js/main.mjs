import { SELECTORS } from './config.mjs';
import { gameState } from './state.mjs';
import { getInputField } from './utils.mjs';
import { loadContent } from './api.mjs';
import { checkTypingSpace, checkTypingSpaceBeforeInput, validateRealtime, restartGame } from './input.mjs';

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
  inputField.addEventListener('beforeinput', checkTypingSpaceBeforeInput);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeFormListener();
  initializeInputListeners();
  initializeRestartButton();
  loadContent('english', 'words', 'easy');
});
