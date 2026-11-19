import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from './map-country';
import type { RawCountry } from './types';

const raw: RawCountry = {
  name: 'Germany',
  capital: 'Berlin',
  region: 'Europe',
  population: 83240525,
  flags: { png: 'https://flagcdn.com/w320/de.png', svg: '...', alt: '...' },
  area: 357022,
  borders: ['AUT', 'BEL', 'CZE'],
  languages: [{ name: 'German' }],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
};

describe('mapCountryResponse', () => {
  it('маппит основные поля карточки', () => {
    const result = mapCountryResponse(raw);
    expect(result.name).toBe('Germany');
    expect(result.capital).toBe('Berlin');
    expect(result.region).toBe('Europe');
    expect(result.population).toBe(83240525);
    expect(result.flagUrl).toBe('https://flagcdn.com/w320/de.png');
  });

  it('извлекает языки как массив строк', () => {
    const result = mapCountryResponse(raw);
    expect(result.languages).toEqual(['German']);
  });

  it('извлекает валюты как читаемые строки', () => {
    const result = mapCountryResponse(raw);
    expect(result.currencies).toEqual(['Euro (€)']);
  });

  it('сохраняет площадь и границы для детального вида', () => {
    const result = mapCountryResponse(raw);
    expect(result.area).toBe(357022);
    expect(result.borders).toEqual(['AUT', 'BEL', 'CZE']);
  });

  it('не падает, если capital отсутствует', () => {
    const withoutCapital = { ...raw, capital: undefined };
    expect(() => mapCountryResponse(withoutCapital)).not.toThrow();
  });
});
