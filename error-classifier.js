import { HttpError } from './http-error.js';
export function classifyError(error) {
    if (error instanceof DOMException) {
        if (error.name === 'AbortError')
            return 'aborted';
        if (error.name === 'TimeoutError')
            return 'timeout';
    }
    if (error instanceof HttpError)
        return 'http';
    return 'network';
}
//# sourceMappingURL=error-classifier.js.map