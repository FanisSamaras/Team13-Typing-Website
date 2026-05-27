import { gameState } from './state.mjs';
import { normalizeText } from './utils.mjs';

export function updateTypingAccuracy(currentValue) {
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
