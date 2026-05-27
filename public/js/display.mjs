import { COLOR_SCHEME, DIFFICULTY_CONFIG } from './config.mjs';
import { gameState } from './state.mjs';
import { getInputField, getTextDisplay, getFeedbackDisplay, resetAccuracyTracking, normalizeText, getTextForWord } from './utils.mjs';
import { finishGame } from './game.mjs';

export function filterQuotesByDifficulty(quotes, difficulty) {
  if (!quotes.length) return [];
  const maxLength = DIFFICULTY_CONFIG[difficulty]?.quoteLength || Infinity;
  return quotes.filter((quote) => {
    const length = quote.length || quote.text.length || 0;
    return length <= maxLength;
  });
}

export function getWordCountForDifficulty(difficulty) {
  return DIFFICULTY_CONFIG[difficulty]?.wordCount || 50;
}

export function displayRandomQuote() {
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

export function displayRandomWord() {
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

export function renderTextWithInput(inputValue = '') {
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

export function renderCharacterComparison(input, word) {
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

export function displayCurrentWord() {
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

export function displayCharacterFeedback() {
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
