const tokenKey: string = 'token';

export interface Token {
  token: string;
  timestamp?: number;
}

export interface AuthenticationErrorMessage {
  errorMessage: string;
}

export function getToken (): Token {
  return JSON.parse(localStorage.getItem(tokenKey) || '');
}

export function getTokenTimestamp (): number {
  return JSON.parse(localStorage.getItem(tokenKey) || '');
}

export function setToken (token: Token): void {
  token.timestamp = Date.now();
  localStorage.setItem(tokenKey, JSON.stringify(token));
}

export function deleteToken (): void {
  if (Date.now() - getTokenTimestamp() >= 600000) {
    localStorage.removeItem(tokenKey);
  }
}


