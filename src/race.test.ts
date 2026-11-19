import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from './search-countries';
import type { RawCountry } from './types';

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
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const promise1 = searchCountries('sp', controller1.signal);
    controller1.abort();
    const promise2 = searchCountries('spain', controller2.signal);
    const spainEntry = pending.find((p) => p.query === 'spain');
    spainEntry!.resolve([{ name: 'Spain' }]);

    await expect(promise2).resolves.toEqual([{ name: 'Spain' }]);
    await expect(promise1).rejects.toMatchObject({ name: 'AbortError' });
    const spEntry = pending.find((p) => p.query === 'sp');
    expect(spEntry).toBeDefined();
  });
});
