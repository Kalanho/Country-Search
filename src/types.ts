export interface RawCountry {
  name: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  flags?: { png?: string; svg?: string; alt?: string };
  area?: number;
  borders?: string[];
  languages?: Array<{ name: string }>;
  currencies?: Array<{ code?: string; name?: string; symbol?: string }>;
}

export interface CountryCard {
  name: string;
  capital: string;
  region: string;
  population: number;
  flagUrl: string;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
  subregion: string;
}
