export function mapCountryResponse(raw) {
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
        languages: (raw.languages ?? []).map((l) => l.name),
        currencies: (raw.currencies ?? []).map((c) => c.symbol ? `${c.name ?? c.code ?? ''} (${c.code ?? ''})` : c.name ?? c.code ?? ''),
        description: description,
    };
}
//# sourceMappingURL=map-country.js.map