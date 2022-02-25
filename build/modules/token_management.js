const tokenKey = 'token';
export function getToken() {
    return JSON.parse(localStorage.getItem(tokenKey));
}
export function getTokenTimestamp() {
    return JSON.parse(localStorage.getItem(tokenKey)).timestamp;
}
export function setToken(token) {
    token.timestamp = Date.now();
    localStorage.setItem(tokenKey, JSON.stringify(token));
}
export function deleteToken() {
    if (Date.now() - getTokenTimestamp() >= 600000) {
        localStorage.removeItem(tokenKey);
    }
}
