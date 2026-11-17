import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('вызывает функцию только после задержки', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledWith('a');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('сбрасывает таймер при повторном вызове', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    vi.advanceTimersByTime(200);

    debounced('b');
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledWith('b');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('передаёт все аргументы последнего вызова', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1, 'two', { three: 3 });
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith(1, 'two', { three: 3 });
  });
});
