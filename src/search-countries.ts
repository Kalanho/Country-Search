import type { RawCountry } from './types';
import { HttpError } from './http-error';

const BASE = 'https://countries.dev';

export async function searchCountries(query: string, signal: AbortSignal): Promise<RawCountry[]> {
  const url = `${BASE}/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status, `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<RawCountry[]>;
}
