let items = [];
let currentQuote = '';
let currentMode = 'quotes';
let currentLanguage = 'english';
let currentDifficulty = 'noob';
let startTime = null;
let isTyping = false;

async function loadContent(language, mode, difficulty) {
  currentLanguage = language;
  currentMode = mode;
  currentDifficulty = difficulty;
  document.querySelector('input').value = '';
  startTime = null;
  isTyping = false;

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
    if (difficulty === 'noob') return length <= 55;
    if (difficulty === 'intermediate') return length <= 100;
    return true; // pro
  });
}

function getWordCountForDifficulty(difficulty) {
  if (difficulty === 'noob') return 10;
  if (difficulty === 'intermediate') return 25;
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
    currentQuote = 'No quotes available.';
  } else {
    const filtered = filterQuotesByDifficulty(items, currentDifficulty);
    const activeQuotes = filtered.length ? filtered : items;
    const randomIndex = Math.floor(Math.random() * activeQuotes.length);
    currentQuote = normalizeText(activeQuotes[randomIndex].text);
  }
  document.getElementById('text').textContent = currentQuote;
  startTime = null;
  isTyping = false;
}

function displayRandomWord() {
  if (!items.length) {
    currentQuote = 'No words available.';
  } else {
    const wordCount = getWordCountForDifficulty(currentDifficulty);
    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * items.length);
      selectedWords.push(getTextForWord(items[randomIndex]));
    }
    currentQuote = normalizeText(selectedWords.join(' '));
  }
  document.getElementById('text').textContent = currentQuote;
  startTime = null;
  isTyping = false;
}

function checkTyping() {
  if (!startTime) {
    startTime = new Date();
    isTyping = true;
  }

  const input = document.querySelector('input').value;
  const normalizedInput = normalizeText(input);
  const textDiv = document.getElementById('text');
  let html = '';

  for (let i = 0; i < currentQuote.length; i++) {
    if (i < input.length) {
      if (input[i] === currentQuote[i]) {
        html += `<span style="color: green;">${currentQuote[i]}</span>`;
      } else {
        html += `<span style="color: red;">${currentQuote[i]}</span>`;
      }
    } else {
      html += currentQuote[i];
    }
  }

  textDiv.innerHTML = html;

  if (normalizedInput === currentQuote) {
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000 / 60;
    const wpm = timeTaken > 0 ? Math.round(currentQuote.length / 5 / timeTaken) : 0;
    alert(`Finished! WPM: ${wpm}`);
    document.querySelector('input').value = '';
    if (currentMode === 'words') {
      displayRandomWord();
    } else {
      displayRandomQuote();
    }
  }
}

function restartGame() {
  document.querySelector('input').value = '';
  startTime = null;
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
    const difficulty = document.getElementById('difficultySelect').value || 'noob';
    await loadContent(language, mode, difficulty);
    document.querySelector('input').focus();
  });

  const inputField = document.querySelector('input');
  inputField.addEventListener('input', checkTyping);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      restartGame();
    }
  });

  document.getElementById('restartButton').addEventListener('click', restartGame);
  loadContent('english', 'words', 'intermediate');
});