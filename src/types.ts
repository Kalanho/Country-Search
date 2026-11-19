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
  demonyms?: { eng?: { m?: string; f?: string } }; // Добавили демоним
}

export interface CountryCard {
  name: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  flagUrl: string;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
  description: string; // Добавили описание
}