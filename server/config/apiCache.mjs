import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let cachedData = {};

export const loadApiData = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dataDir = path.join(__dirname, '../data');

    cachedData.quotes_en = JSON.parse(fs.readFileSync(path.join(dataDir, 'quotes_en.json'), 'utf-8'));
    cachedData.quotes_el = JSON.parse(fs.readFileSync(path.join(dataDir, 'quotes_el.json'), 'utf-8'));
    cachedData.words_en = JSON.parse(fs.readFileSync(path.join(dataDir, 'en.json'), 'utf-8'));
    cachedData.words_el = JSON.parse(fs.readFileSync(path.join(dataDir, 'el.json'), 'utf-8'));

    console.log('API data cached successfully');
  } catch (error) {
    console.error('Error loading API data:', error);
  }
};

export const getQuotes = (language) => {
  const key = language === 'greek' ? 'quotes_el' : 'quotes_en';
  return cachedData[key] || null;
};

export const getWords = (language) => {
  const key = language === 'greek' ? 'words_el' : 'words_en';
  return cachedData[key] || null;
};
