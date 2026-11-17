import type { RawCountry, CountryCard } from './types.js';

export function mapCountryResponse(raw: RawCountry): CountryCard {
  return {
    name: raw.name,
    capital: raw.capital ?? '—',
    region: raw.region ?? '—',
    population: raw.population ?? 0,
    flagUrl: raw.flags?.png ?? raw.flags?.svg ?? '',
    area: raw.area ?? null,
    borders: raw.borders ?? [],
    languages: (raw.languages ?? []).map((l: { name: string }) => l.name),
    currencies: (raw.currencies ?? []).map(
      (c: { name?: string; code?: string; symbol?: string }) =>
        c.symbol ? `${c.name ?? c.code ?? ''} (${c.symbol})` : (c.name ?? c.code ?? ''),
    ),
    subregion: raw.subregion ?? '',
  };
}
