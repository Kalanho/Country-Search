export function debounce(fn, delay) {
    let timerId = null;
    return (...args) => {
        if (timerId !== null) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    };
}
//# sourceMappingURL=debounce.js.map