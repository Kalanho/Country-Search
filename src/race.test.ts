import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from './search-countries';
import type { RawCountry } from './types';

/**
 * Мок fetch, который:
 * 1. Возвращает промис, резолвящийся вручную (через resolve/reject извне).
 * 2. Слушает signal и отклоняет промис с AbortError, если signal уже aborted
 *    или если abort произойдёт до ручного resolve.
 */
function createControllableFetch() {
  const pending: Array<{
    query: string;
    resolve: (countries: RawCountry[]) => void;
    reject: (err: unknown) => void;
  }> = [];

  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const query = decodeURIComponent(String(url).split('/name/')[1] ?? '');
    const signal = init?.signal;

    return new Promise<Response>((resolve, reject) => {
      const entry = {
        query,
        resolve: (countries: RawCountry[]) =>
          resolve(new Response(JSON.stringify(countries), { status: 200 })),
        reject,
      };
      pending.push(entry);

      if (signal) {
        if (signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
          return;
        }
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), {
          once: true,
        });
      }
    });
  });

  return { fetchMock, pending };
}

describe('гонка запросов: отмена через AbortController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('устаревший ответ не должен перезаписывать более новый результат', async () => {
    const { fetchMock, pending } = createControllableFetch();
    vi.stubGlobal('fetch', fetchMock);

    // Симулируем: пользователь ввёл "sp", затем быстро "spain".
    const controller1 = new AbortController();
    const controller2 = new AbortController();

    // Первый запрос ("sp") стартует.
    const promise1 = searchCountries('sp', controller1.signal);

    // Пользователь вводит дальше — приложение отменяет первый запрос.
    controller1.abort();

    // Второй запрос ("spain") стартует с новым сигналом.
    const promise2 = searchCountries('spain', controller2.signal);

    // Теперь сервер "отвечает" на spain первым (более новый запрос).
    const spainEntry = pending.find((p) => p.query === 'spain');
    spainEntry!.resolve([{ name: 'Spain' }]);

    await expect(promise2).resolves.toEqual([{ name: 'Spain' }]);

    // Первый промис должен быть отклонён как AbortError (настоящая отмена).
    await expect(promise1).rejects.toMatchObject({ name: 'AbortError' });

    // Даже если бы "sp" ответил позже, его промис уже мёртв — рендер не случится.
    const spEntry = pending.find((p) => p.query === 'sp');
    // Не резолвим sp — он уже отклонён. Проверяем, что отклонение было.
    expect(spEntry).toBeDefined();
  });
});
