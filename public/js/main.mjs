let items = [];
let wordArray = [];
let currentWordIndex = 0;
let currentQuoteSource = '';
let currentMode = 'quotes';
let currentLanguage = 'english';
let currentDifficulty = 'easy';
let startTime = null;
let isTyping = false;
let totalChars = 0;
let totalCorrectChars = 0;
let previousInputValue = '';

function resetAccuracyTracking() {
  totalChars = 0;
  totalCorrectChars = 0;
  previousInputValue = '';
  currentWordIndex = 0;
  startTime = null;
  isTyping = false;
}

async function loadContent(language, mode, difficulty) {
  currentLanguage = language;
  currentMode = mode;
  currentDifficulty = difficulty;
  document.querySelector('input').value = '';
  startTime = null;
  isTyping = false;
  resetAccuracyTracking();

  if (mode === 'words') {
    await loadWords(language);
  } else {
    await loadQuotes();
  }
}

async function loadQuotes() {
  try {
    const response = await fetch('/api/quotes');
    const data = await response.json();
    items = data.quotes || [];
    displayRandomQuote();
  } catch (error) {
    console.error('Error loading quotes:', error);
  }
}

async function loadWords(language) {
  try {
    const response = await fetch(`/api/words/${language}`);
    const data = await response.json();
    items = data.words || [];
    displayRandomWord();
  } catch (error) {
    console.error('Error loading words:', error);
  }
}

function filterQuotesByDifficulty(quotes, difficulty) {
  if (!quotes.length) return [];

  return quotes.filter((quote) => {
    const length = quote.length || quote.text.length || 0;
    if (difficulty === 'easy') return length <= 55;
    if (difficulty === 'medium') return length <= 100;
    return true; // hard
  });
}

function getWordCountForDifficulty(difficulty) {
  if (difficulty === 'easy') return 10;
  if (difficulty === 'medium') return 25;
  return 50;
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function getTextForWord(entry) {
  const rawWord = entry.targetWord && entry.targetWord.trim() ? entry.targetWord : entry.englishWord;
  return normalizeText(rawWord);
}

function displayRandomQuote() {
  if (!items.length) {
    wordArray = ['No quotes available.'];
    currentQuoteSource = '';
  } else {
    const filtered = filterQuotesByDifficulty(items, currentDifficulty);
    const activeQuotes = filtered.length ? filtered : items;
    const randomIndex = Math.floor(Math.random() * activeQuotes.length);
    const quoteText = normalizeText(activeQuotes[randomIndex].text);
    wordArray = quoteText.split(' ').filter((w) => w.length > 0);
    currentQuoteSource = activeQuotes[randomIndex].source || '';
  }
  resetAccuracyTracking();
  displayCurrentWord();
}

function displayRandomWord() {
  const wordCount = getWordCountForDifficulty(currentDifficulty);
  if (!items.length) {
    wordArray = ['No words available.'];
  } else {
    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * items.length);
      selectedWords.push(getTextForWord(items[randomIndex]));
    }
    wordArray = selectedWords;
  }
  currentQuoteSource = '';
  resetAccuracyTracking();
  displayCurrentWord();
}

function renderTextWithInput(inputValue = '') {
  const textDiv = document.getElementById('text');
  let html = '';
  const normalizedInput = normalizeText(inputValue);
  const currentWord = normalizeText(wordArray[currentWordIndex] || '');

  for (let i = 0; i < wordArray.length; i++) {
    if (i < currentWordIndex) {
      html += `<span style="color: #99ff99; opacity: 0.85;">${wordArray[i]}</span> `;
    } else if (i === currentWordIndex) {
      if (!normalizedInput) {
        html += `<span style="color: white;  ">${wordArray[i]}</span> `;
      } else {
        let wordHtml = '';
        const wordLength = currentWord.length;
        const inputLength = normalizedInput.length;
        const minLength = Math.min(inputLength, wordLength);

        for (let j = 0; j < minLength; j++) {
          if (normalizedInput[j] === currentWord[j]) {
            wordHtml += `<span style="color: #00ff00;  ">${normalizedInput[j]}</span>`;
          } else {
            wordHtml += `<span style="color: #ff0000;  ">${normalizedInput[j]}</span>`;
          }
        }

        if (inputLength < wordLength) {
          for (let j = inputLength; j < wordLength; j++) {
            wordHtml += `<span style="color: gray; opacity: 0.5;">${currentWord[j]}</span>`;
          }
        } else if (inputLength > wordLength) {
          for (let j = wordLength; j < inputLength; j++) {
            wordHtml += `<span style="color: #ff0000;  ">${normalizedInput[j]}</span>`;
          }
        }

        html += `<span>${wordHtml}</span> `;
      }
    } else {
      html += `<span style="color: #cccccc; opacity: 0.9;">${wordArray[i]}</span> `;
    }
  }

  textDiv.innerHTML = html;
}

function displayCurrentWord() {
  if (currentWordIndex >= wordArray.length) {
    finishGame();
    return;
  }

  renderTextWithInput('');
  const inputField = document.querySelector('input');
  inputField.value = '';
  inputField.style.borderColor = '';
  previousInputValue = '';

  const feedbackDiv = document.getElementById('character-feedback');
  if (feedbackDiv) {
    feedbackDiv.remove();
  }

  document.querySelector('input').focus();
}

function updateTypingAccuracy(currentValue) {
  const currentRaw = currentValue;
  const previousRaw = previousInputValue;
  const currentWord = normalizeText(wordArray[currentWordIndex] || '');

  if (currentRaw.length > previousRaw.length) {
    for (let i = previousRaw.length; i < currentRaw.length; i++) {
      totalChars += 1;
      if (currentRaw[i] === currentWord[i]) {
        totalCorrectChars += 1;
      }
    }
  }

  previousInputValue = currentRaw;
}

function advanceWord(inputValue = '') {
  const currentWord = normalizeText(wordArray[currentWordIndex]);
  if (!startTime) {
    startTime = new Date();
    isTyping = true;
  }

  const normalizedInput = normalizeText(inputValue);
  if (normalizedInput.length > previousInputValue.length) {
    updateTypingAccuracy(inputValue);
  }

  currentWordIndex += 1;
  displayCurrentWord();
}

function finishGame() {
  const endTime = new Date();
  const timeTaken = (endTime - startTime) / 1000 / 60;
  const totalQuoteChars = wordArray.join(' ').length;
  const wpm = timeTaken > 0 ? Math.round(totalQuoteChars / 5 / timeTaken) : 0;
  const accuracy = totalChars
    ? Math.max(0, Math.round((totalCorrectChars / totalChars) * 100))
    : 100;

  const sourceParam = currentMode === 'quotes' ? `&source=${encodeURIComponent(currentQuoteSource || '')}` : '';
  const difficultyParam = `&difficulty=${encodeURIComponent(currentDifficulty)}`;
  const resultUrl = `/result?mode=${encodeURIComponent(currentMode)}&language=${encodeURIComponent(currentLanguage)}&wpm=${wpm}&accuracy=${accuracy}${difficultyParam}${sourceParam}`;

  fetch('/api/score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wpm,
      accuracy,
      mode: currentMode,
      difficulty: currentDifficulty,
      language: currentLanguage,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.warn('Score not saved:', error.error || response.statusText);
        return;
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.success) {
        console.log('Score saved successfully');
      }
    })
    .catch((error) => {
      console.error('Unable to save score:', error);
    })
    .finally(() => {
      window.location.href = resultUrl;
    });
}

function displayCharacterFeedback() {
  const inputField = document.querySelector('input');
  const normalizedInput = normalizeText(inputField.value);
  const currentWord = normalizeText(wordArray[currentWordIndex]);

  let feedbackHTML = '';

  // Add colored characters for typed input
  for (let i = 0; i < normalizedInput.length; i++) {
    if (normalizedInput[i] === currentWord[i]) {
      feedbackHTML += `<span style="color: #00ff00;  ">${normalizedInput[i]}</span>`;
    } else {
      feedbackHTML += `<span style="color: #ff0000;  ">${normalizedInput[i]}</span>`;
    }
  }

  // Add gray remaining letters
  for (let i = normalizedInput.length; i < currentWord.length; i++) {
    feedbackHTML += `<span style="color: gray; opacity: 0.5;">${currentWord[i]}</span>`;
  }

  // Update or create feedback display element
  let feedbackDiv = document.getElementById('character-feedback');
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

function validateRealtime() {
  const inputField = document.querySelector('input');
  const normalizedInput = normalizeText(inputField.value);
  const currentWord = normalizeText(wordArray[currentWordIndex]);

  // Check if all typed characters match so far
  let isCorrect = true;
  if (normalizedInput.length > 0) {
    if (normalizedInput.length > currentWord.length) {
      isCorrect = false;
    } else {
      for (let i = 0; i < normalizedInput.length; i++) {
        if (normalizedInput[i] !== currentWord[i]) {
          isCorrect = false;
          break;
        }
      }
    }
  }

  if (!startTime && normalizedInput.length > 0) {
    startTime = new Date();
    isTyping = true;
  }

  updateTypingAccuracy(inputField.value);

  // If the final word has been typed correctly, complete the game immediately without requiring a trailing space.
  if (currentWordIndex === wordArray.length - 1 && normalizedInput === currentWord) {
    advanceWord(inputField.value);
    return;
  }

  // Visual feedback: green for correct, red for incorrect border
  if (normalizedInput.length === 0) {
    inputField.style.borderColor = '';
  } else if (isCorrect) {
    inputField.style.borderColor = 'green';
  } else {
    inputField.style.borderColor = 'red';
  }

  renderTextWithInput(inputField.value);
}

function checkTypingSpace(e) {
  if (e.key !== ' ') {
    return;
  }

  const input = normalizeText(document.querySelector('input').value);
  const currentWord = normalizeText(wordArray[currentWordIndex]);

  // Only allow advancing if word is typed correctly
  if (input !== currentWord) {
    e.preventDefault();
    // Visual feedback - shake effect for incorrect word
    const inputField = document.querySelector('input');
    inputField.classList.add('shake-error');
    setTimeout(() => inputField.classList.remove('shake-error'), 300);
    return; // Don't advance
  }

  // Word is correct - allow advancing
  e.preventDefault();
  advanceWord(document.querySelector('input').value);
}

function restartGame() {
  document.querySelector('input').value = '';
  document.querySelector('input').style.borderColor = '';
  
  // Clear character feedback display
  const feedbackDiv = document.getElementById('character-feedback');
  if (feedbackDiv) {
    feedbackDiv.innerHTML = '';
  }
  
  resetAccuracyTracking();
  if (currentMode === 'words') {
    displayRandomWord();
  } else {
    displayRandomQuote();
  }
  document.querySelector('input').focus();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const language = document.getElementById('languageSelect').value || 'english';
    const mode = document.getElementById('modeSelect').value || 'quotes';
    const difficulty = document.getElementById('difficultySelect').value || 'easy';
    await loadContent(language, mode, difficulty);
    document.querySelector('input').focus();
  });

  const inputField = document.querySelector('input');
  inputField.addEventListener('keydown', checkTypingSpace);
  inputField.addEventListener('input', validateRealtime);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      restartGame();
    }
  });

  document.getElementById('restartButton').addEventListener('click', restartGame);
  loadContent('english', 'words', 'easy');
});