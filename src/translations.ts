export const ruToEn: Record<string, string> = {
  россия: 'russia',
  сша: 'united states',
  'соединенные штаты': 'united states',
  германия: 'germany',
  франция: 'france',
  италия: 'italy',
  испания: 'spain',
  китай: 'china',
  япония: 'japan',
  великобритания: 'united kingdom',
  англия: 'united kingdom',
  канада: 'canada',
  бразилия: 'brazil',
  индия: 'india',
  австралия: 'australia',
};

export const enToRu: Record<string, string> = {
  russia: 'Россия',
  'united states': 'США',
  germany: 'Германия',
  france: 'Франция',
  italy: 'Италия',
  spain: 'Испания',
  china: 'Китай',
  japan: 'Япония',
  'united kingdom': 'Великобритания',
  canada: 'Канада',
  brazil: 'Бразилия',
  india: 'Индия',
  australia: 'Австралия',
};

export function translateQuery(query: string): string {
  const lower = query.toLowerCase().trim();
  return ruToEn[lower] || lower;
}

export function getRussianName(englishName: string): string | null {
  const lower = englishName.toLowerCase().trim();
  return enToRu[lower] || null;
}
