export function sleep(time) {
    try {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    catch (e) { }
}
//# sourceMappingURL=sleep.js.map