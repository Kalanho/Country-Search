import { debounce } from './debounce.js';
import { searchCountries } from './search-countries.js';
import { mapCountryResponse } from './map-country.js';
import { classifyError } from './error-classifier.js';
import { translateQuery } from './translations.js';
import type { CountryCard } from './types.js';

const DEBOUNCE_MS = 350;
const TIMEOUT_MS = 8000;

let activeController: AbortController | null = null;
let lastQuery = '';
let searchHistory: string[] = [];

// --- DOM ЭЛЕМЕНТЫ ---
const app = document.createElement('div');
app.className = 'app-container';

const header = document.createElement('div');
header.className = 'header';

const titleGroup = document.createElement('div');
titleGroup.className = 'title-group';
const title = document.createElement('h1');
title.textContent = 'Country Search';
const subtitle = document.createElement('p');
subtitle.textContent = 'Live search with cancellation of stale requests';
titleGroup.append(title, subtitle);

const themeBtn = document.createElement('button');
themeBtn.className = 'theme-toggle';
themeBtn.textContent = '🌓';

header.append(titleGroup, themeBtn);

const input = document.createElement('input');
input.type = 'search';
input.placeholder = 'Search country...';
input.className = 'search-input';

// Блок истории
const historySection = document.createElement('div');
historySection.className = 'history-section';
historySection.style.display = 'none';

const historyLabel = document.createElement('span');
historyLabel.className = 'history-label';
historyLabel.textContent = 'Recent Searches';

const historyTags = document.createElement('div');
historyTags.style.display = 'flex';
historyTags.style.gap = '8px';
historySection.append(historyLabel, historyTags);

const statusEl = document.createElement('div');
statusEl.className = 'status-message';

const listEl = document.createElement('ul');
listEl.className = 'country-list';

app.append(header, input, historySection, statusEl, listEl);
document.body.append(app);

// Элементы модалки
const modalOverlay = document.getElementById('country-modal') as HTMLDivElement;
const modalContent = document.getElementById('modal-content') as HTMLDivElement;

// --- ТЕМА ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
initTheme();

// --- ИСТОРИЯ ---
function loadHistory() {
  const saved = localStorage.getItem('searchHistory');
  if (saved) {
    try {
      searchHistory = JSON.parse(saved);
    } catch {
      searchHistory = [];
    }
  }
  renderHistory();
}

function saveHistory(query: string) {
  if (!query) return;
  const norm = query.toLowerCase().trim();
  searchHistory = searchHistory.filter((q) => q.toLowerCase() !== norm);
  searchHistory.unshift(query);
  if (searchHistory.length > 3) searchHistory.pop();
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  renderHistory();
}

function renderHistory() {
  historyTags.replaceChildren();
  if (searchHistory.length === 0) {
    historySection.style.display = 'none';
    return;
  }
  historySection.style.display = 'flex';
  for (const q of searchHistory) {
    const tag = document.createElement('button');
    tag.className = 'history-tag';
    tag.textContent = q;
    tag.addEventListener('click', () => {
      input.value = q;
      void performSearch(q);
    });
    historyTags.append(tag);
  }
}

// --- СТАТУСЫ ---
function setLoading(): void {
  statusEl.textContent = 'Searching...';
  statusEl.className = 'status-message loading';
}
function setEmpty(): void {
  statusEl.textContent = 'Nothing found';
  statusEl.className = 'status-message empty';
}
function setError(msg: string): void {
  statusEl.textContent = msg;
  statusEl.className = 'status-message error';
}
function clearStatus(): void {
  statusEl.textContent = '';
  statusEl.className = 'status-message';
}

// --- РЕНДЕР СПИСКА ---
function renderList(cards: CountryCard[]): void {
  listEl.replaceChildren();
  for (const card of cards) {
    const li = document.createElement('li');
    li.className = 'country-card';

    const img = document.createElement('img');
    img.src = card.flagUrl;
    img.className = 'country-flag';
    img.alt = `Флаг ${card.name}`;

    const info = document.createElement('div');
    info.className = 'country-info';

    const nameRow = document.createElement('h3');
    nameRow.textContent = card.name;

    const capital = document.createElement('p');
    capital.textContent = card.capital;

    const region = document.createElement('p');
    region.textContent = card.region;

    const pop = document.createElement('p');
    pop.className = 'population';
    pop.textContent = `Population: ${card.population.toLocaleString('en-US')}`;

    info.append(nameRow, capital, region, pop);
    li.append(img, info);

    li.addEventListener('click', () => openModal(card));
    listEl.append(li);
  }
}

// --- МОДАЛЬНОЕ ОКНО (ДЕТАЛИ) ---
function openModal(card: CountryCard): void {
  modalContent.replaceChildren();

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeModal);

  const img = document.createElement('img');
  img.src = card.flagUrl;
  img.className = 'modal-flag';

  const h2 = document.createElement('h2');
  h2.className = 'modal-title';
  h2.textContent = card.name;

  const grid = document.createElement('div');
  grid.className = 'detail-grid';

  const details = [
    { label: 'Столица', value: card.capital },
    { label: 'Регион', value: card.region },
    { label: 'Население', value: card.population.toLocaleString('ru-RU') },
    { label: 'Площадь', value: card.area ? `${card.area.toLocaleString('ru-RU')} км²` : '—' },
    { label: 'Языки', value: card.languages.join(', ') || '—' },
    { label: 'Валюты', value: card.currencies.join(', ') || '—' },
  ];

  for (const d of details) {
    const item = document.createElement('div');
    item.className = 'detail-item';

    const label = document.createElement('div');
    label.className = 'detail-label';
    label.textContent = d.label;

    const val = document.createElement('div');
    val.className = 'detail-value';
    val.textContent = d.value;

    item.append(label, val);
    grid.append(item);
  }

  modalContent.append(closeBtn, img, h2, grid);
  modalOverlay.classList.add('active');

  // Просто закрываем при клике на фон (без лишних переменных, чтобы не ругался линтер)
  modalOverlay.addEventListener('click', closeModal, { once: true });
}

function closeModal(): void {
  modalOverlay.classList.remove('active');
}

// --- ПОИСК ---
async function performSearch(rawQuery: string): Promise<void> {
  const query = translateQuery(rawQuery);
  lastQuery = query;

  if (activeController) activeController.abort();
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
    saveHistory(rawQuery);
  } catch (error) {
    if (classifyError(error) === 'aborted') return;
    if (lastQuery !== query) return;
    setError('Something went wrong. Please try again.');
  }
}

input.addEventListener('input', () => {
  const rawQuery = input.value.trim();
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
  if (rawQuery === '') {
    listEl.replaceChildren();
    clearStatus();
    lastQuery = '';
    return;
  }
  debouncedSearch(rawQuery);
});

const debouncedSearch = debounce((rawQuery: string) => {
  void performSearch(rawQuery);
}, DEBOUNCE_MS);

// Инициализация истории при загрузке
loadHistory();
