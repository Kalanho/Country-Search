import { debounce } from './debounce.js';
import { searchCountries } from './search-countries.js';
import { mapCountryResponse } from './map-country.js';
import { classifyError } from './error-classifier.js';
import type { CountryCard } from './types.js';

const DEBOUNCE_MS = 350;
const TIMEOUT_MS = 8000;

let activeController: AbortController | null = null;
let lastQuery = '';

const app = document.createElement('div');
app.className = 'app-container';

const title = document.createElement('h1');
title.textContent = 'Country Search';

const input = document.createElement('input');
input.type = 'search';
input.placeholder = 'Search country...';
input.className = 'search-input';

const statusEl = document.createElement('div');
statusEl.className = 'status-message';

const listEl = document.createElement('ul');
listEl.className = 'country-list';

const detailEl = document.createElement('div');
detailEl.className = 'country-detail';

app.append(title, input, statusEl, listEl, detailEl);
document.body.append(app);

function setLoading(): void {
  statusEl.textContent = 'Loading...';
  statusEl.className = 'status-message loading';
}

function setEmpty(): void {
  statusEl.textContent = 'Nothing found';
  statusEl.className = 'status-message empty';
}

function setError(message: string, onRetry: () => void): void {
  statusEl.textContent = '';
  statusEl.className = 'status-message error';

  const text = document.createElement('span');
  text.textContent = message + ' ';

  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'Retry';
  retryBtn.addEventListener('click', onRetry);

  statusEl.append(text, retryBtn);
}

function clearStatus(): void {
  statusEl.textContent = '';
  statusEl.className = 'status-message';
}

function renderList(cards: CountryCard[]): void {
  listEl.replaceChildren();
  for (const card of cards) {
    const li = document.createElement('li');
    li.className = 'country-card';

    const img = document.createElement('img');
    img.src = card.flagUrl;
    img.alt = `Flag of ${card.name}`;
    img.width = 40;

    const info = document.createElement('div');
    info.className = 'card-info';

    const name = document.createElement('strong');
    name.textContent = card.name;

    const capital = document.createElement('span');
    capital.textContent = `Capital: ${card.capital}`;

    info.append(name, document.createElement('br'), capital);
    li.append(img, info);

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
  close.textContent = 'Close Details';
  close.className = 'close-btn';
  close.addEventListener('click', () => detailEl.replaceChildren());

  detailEl.append(h2, p, close);
}

async function performSearch(query: string): Promise<void> {
  lastQuery = query;

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

    if (lastQuery !== query) return;

    if (raw.length === 0) {
      setEmpty();
      return;
    }

    const cards = raw.map(mapCountryResponse);
    clearStatus();
    renderList(cards);
  } catch (error) {
    const kind = classifyError(error);

    if (kind === 'aborted') return;
    if (lastQuery !== query) return;

    if (kind === 'timeout') {
      setError('Request timed out.', () => performSearch(lastQuery));
    } else {
      setError('Something went wrong.', () => performSearch(lastQuery));
    }
  }
}

input.addEventListener('input', () => {
  const query = input.value.trim();

  if (activeController) {
    activeController.abort();
    activeController = null;
  }

  if (query === '') {
    listEl.replaceChildren();
    clearStatus();
    detailEl.replaceChildren();
    lastQuery = '';
    return;
  }

  debouncedSearch(query);
});

const debouncedSearch = debounce((query: string) => {
  void performSearch(query);
}, DEBOUNCE_MS);
