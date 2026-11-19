import type { RawCountry, CountryCard } from './types.js';

export function mapCountryResponse(raw: RawCountry): CountryCard {
  const demonym = raw.demonyms?.eng?.m;
  const regionText = raw.subregion || raw.region || 'the world';
  const description = `${raw.name} is a country in ${regionText}.${demonym ? ` Demonym: ${demonym}.` : ''}`;

  return {
    name: raw.name,
    capital: raw.capital ?? '—',
    region: raw.region ?? '—',
    subregion: raw.subregion ?? '',
    population: raw.population ?? 0,
    flagUrl: raw.flags?.png ?? raw.flags?.svg ?? '',
    area: raw.area ?? null,
    borders: raw.borders ?? [],
    languages: (raw.languages ?? []).map((l: { name: string }) => l.name),
    currencies: (raw.currencies ?? []).map((c: { name?: string; code?: string; symbol?: string }) =>
      c.symbol ? `${c.name ?? c.code ?? ''} (${c.code ?? ''})` : c.name ?? c.code ?? '',
    ),
    description: description,
  };
}