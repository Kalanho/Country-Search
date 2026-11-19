// src/http-error.test.ts
import { describe, it, expect } from 'vitest';
import { HttpError } from './http-error';

describe('HttpError', () => {
  it('наследует Error и хранит статус', () => {
    const err = new HttpError(500, 'Server error');
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(500);
    expect(err.message).toBe('Server error');
    expect(err.name).toBe('HttpError');
  });
});
