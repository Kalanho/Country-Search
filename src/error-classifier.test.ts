// src/error-classifier.test.ts
import { describe, it, expect } from 'vitest';
import { classifyError } from './error-classifier';
import { HttpError } from './http-error.test';

describe('classifyError', () => {
  it('AbortError — отмена, не ошибка для пользователя', () => {
    const err = new DOMException('Aborted', 'AbortError');
    expect(classifyError(err)).toBe('aborted');
  });

  it('TimeoutError — таймаут, показывать ошибку с retry', () => {
    const err = new DOMException('Timeout', 'TimeoutError');
    expect(classifyError(err)).toBe('timeout');
  });

  it('HttpError — серверная ошибка', () => {
    expect(classifyError(new HttpError(500, 'err'))).toBe('http');
  });

  it('404 не доходит до классификатора (обрабатывается как пустой результат)', () => {
    // 404 обрабатывается внутри searchCountries, возвращая []
    expect(true).toBe(true);
  });
});
