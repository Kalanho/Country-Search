export const ruToEn = {
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
export const enToRu = {
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
export function translateQuery(query) {
    const lower = query.toLowerCase().trim();
    return ruToEn[lower] || lower;
}
export function getRussianName(englishName) {
    const lower = englishName.toLowerCase().trim();
    return enToRu[lower] || null;
}
//# sourceMappingURL=translations.js.map