import { HttpError } from './http-error';

export type ErrorKind = 'aborted' | 'timeout' | 'http' | 'network';

export function classifyError(error: unknown): ErrorKind {
  if (error instanceof DOMException) {
    if (error.name === 'AbortError') return 'aborted';
    if (error.name === 'TimeoutError') return 'timeout';
  }
  if (error instanceof HttpError) return 'http';
  return 'network';
}
