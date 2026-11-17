import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from './search-countries';
import { HttpError } from './http-error';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('searchCountries', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('возвращает массив стран при 200', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse([{ name: 'Spain' }]));

    const result = await searchCountries('spain', new AbortController().signal);

    expect(result).toEqual([{ name: 'Spain' }]);
  });

  it('404 означает пустой результат, а не ошибку', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse('Not found', 404));

    const result = await searchCountries('zzzz', new AbortController().signal);

    expect(result).toEqual([]);
  });

  it('500 бросает HttpError', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse('oops', 500));

    await expect(searchCountries('x', new AbortController().signal)).rejects.toThrow(HttpError);
  });

  it('передаёт signal в fetch', async () => {
    const controller = new AbortController();
    vi.mocked(fetch).mockResolvedValue(jsonResponse([]));

    await searchCountries('a', controller.signal);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/name/a'),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
