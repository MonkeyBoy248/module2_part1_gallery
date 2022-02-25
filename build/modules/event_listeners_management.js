export function removeEventListeners(listeners) {
    for (let listener of listeners) {
        listener.target.removeEventListener(listener.type, listener.handler);
    }
}
