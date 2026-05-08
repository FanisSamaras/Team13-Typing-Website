// program.js

let quotes = [];
let currentQuote = '';
let startTime;
let isTyping = false;

async function loadQuotes() {
  try {
    const response = await fetch('/api/quotes');
    const data = await response.json();
    quotes = data.quotes;
    displayRandomQuote();
  } catch (error) {
    console.error('Error loading quotes:', error);
  }
}

function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  currentQuote = quotes[randomIndex].text;
  document.getElementById('text').textContent = currentQuote;
  startTime = null;
  isTyping = false;
}

function startTyping() {
  document.querySelector('input').focus();
}

function checkTyping() {
  if (!startTime) {
    startTime = new Date();
    isTyping = true;
  }
  const input = document.querySelector('input').value;
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

  if (input === currentQuote) {
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000 / 60; // minutes
    const wpm = timeTaken > 0 ? Math.round(currentQuote.length / 5 / timeTaken) : 0;
    alert(`Finished! WPM: ${wpm}`);
    document.querySelector('input').value = '';
    displayRandomQuote();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  document.querySelector('input').addEventListener('input', checkTyping);
  document.querySelector('button[type="submit"]').addEventListener('click', (e) => {
    e.preventDefault();
    startTyping();
  });
});