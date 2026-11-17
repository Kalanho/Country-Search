import { HttpError } from './http-error.js';
const BASE = 'https://countries.dev';
export async function searchCountries(query, signal) {
    const url = `${BASE}/name/${encodeURIComponent(query)}`;
    const response = await fetch(url, { signal });
    if (response.status === 404) {
        return [];
    }
    if (!response.ok) {
        throw new HttpError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
}
//# sourceMappingURL=search-countries.js.map