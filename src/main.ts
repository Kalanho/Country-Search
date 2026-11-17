import { debounce } from './debounce';
import { searchCountries } from './search-countries';
import { mapCountryResponse } from './map-country';
import { classifyError } from './error-classifier';
import type { CountryCard } from './types';

const DEBOUNCE_MS = 350;
const TIMEOUT_MS = 8000;

// Состояние
let activeController: AbortController | null = null;
let lastQuery = '';
let lastResults: CountryCard[] = [];

// DOM создаётся программно
const app = document.createElement('div');
const input = document.createElement('input');
input.type = 'search';
input.placeholder = 'Search country...';

const statusEl = document.createElement('div'); // loading / error / empty
const listEl = document.createElement('ul');
const detailEl = document.createElement('div');

app.append(input, statusEl, listEl, detailEl);
document.body.append(app);

function setLoading(): void {
  statusEl.textContent = 'Loading...';
}
function setEmpty(): void {
  statusEl.textContent = 'Nothing found';
}
function setError(message: string, onRetry: () => void): void {
  statusEl.textContent = '';
  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'Retry';
  retryBtn.addEventListener('click', onRetry);
  statusEl.append(message, retryBtn);
}
function clearStatus(): void {
  statusEl.textContent = '';
}

function renderList(cards: CountryCard[]): void {
  listEl.replaceChildren();
  for (const card of cards) {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = card.flagUrl;
    img.alt = '';
    img.width = 32;
    const name = document.createElement('span');
    name.textContent = `${card.name} — ${card.capital}`;
    li.append(img, name);
    li.addEventListener('click', () => renderDetail(card));
    listEl.append(li);
  }
}

function renderDetail(card: CountryCard): void {
  detailEl.replaceChildren();
  const h2 = document.createElement('h2');
  h2.textContent = card.name;
  const p = document.createElement('p');
  p.textContent = [
    `Region: ${card.region}`,
    `Subregion: ${card.subregion}`,
    `Area: ${card.area ?? '—'} km²`,
    `Borders: ${card.borders.join(', ') || '—'}`,
    `Languages: ${card.languages.join(', ')}`,
    `Currencies: ${card.currencies.join(', ')}`,
  ].join(' · ');
  const close = document.createElement('button');
  close.textContent = 'Close';
  close.addEventListener('click', () => detailEl.replaceChildren());
  detailEl.append(h2, p, close);
}

async function performSearch(query: string): Promise<void> {
  lastQuery = query;

  // Отменяем предыдущий активный запрос при КАЖДОМ изменении ввода
  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();
  const signal = activeController.signal;

  setLoading();
  listEl.replaceChildren();

  try {
    const combinedSignal = AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]);

    const raw = await searchCountries(query, combinedSignal);

    // Если за время запроса пользователь уже ввёл другое — не рендерим
    if (lastQuery !== query) return;

    if (raw.length === 0) {
      setEmpty();
      lastResults = [];
      return;
    }

    lastResults = raw.map(mapCountryResponse);
    clearStatus();
    renderList(lastResults);
  } catch (error) {
    const kind = classifyError(error);
    if (kind === 'aborted') {
      // Своя отмена — молча выходим, ничего не показываем
      return;
    }
    if (lastQuery !== query) return; // устаревшая ошибка
    if (kind === 'timeout') {
      setError('Request timed out.', () => performSearch(lastQuery));
    } else {
      setError('Something went wrong.', () => performSearch(lastQuery));
    }
  }
}

// debounce оборачивает performSearch; отмена при вводе — ВНЕ debounce
input.addEventListener('input', () => {
  const query = input.value.trim();

  // Отмена активного запроса — сразу при вводе, не ждём debounce
  if (activeController) {
    activeController.abort();
    activeController = null;
  }

  if (query === '') {
    listEl.replaceChildren();
    clearStatus();
    lastQuery = '';
    return;
  }

  debouncedSearch(query);
});

const debouncedSearch = debounce((query: string) => {
  void performSearch(query);
}, DEBOUNCE_MS);
