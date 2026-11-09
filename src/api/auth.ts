// Functions that talk to the CampusConnect API. Components call these functions
// instead of calling fetch directly.
import type { LoginResult, User } from '../types';

// The API address comes from the project root .env (VITE_API_URL), never typed in code.
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

if (!API_URL) {
  console.warn('VITE_API_URL is not set. Copy .env.example to .env and restart npm run dev.');
}

const TOKEN_KEY = 'campusconnect.token';

// ---------- Errors the page can understand ----------

export type AuthErrorKind =
  | 'badRequest' // 400: the API says the email or password is missing or badly formed
  | 'unauthorized' // 401: wrong login, or the token is missing, wrong or expired
  | 'network' // the server is stopped, or the address is wrong
  | 'server'; // 500 or higher, or an answer we cannot read

export class AuthError extends Error {
  kind: AuthErrorKind;

  constructor(kind: AuthErrorKind) {
    super(kind);
    this.name = 'AuthError';
    this.kind = kind;
  }
}

// Plain sentences for the user. Never raw text such as "TypeError: Failed to fetch".
export function describeLoginError(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.kind) {
      case 'unauthorized':
        return 'Wrong email or password.';
      case 'badRequest':
        return 'Please check your email and password and try again.';
      case 'network':
        return 'Cannot reach the server. Please try again.';
      default:
        break;
    }
  }
  return 'Something went wrong on our side. Please try again later.';
}

// ---------- Requests ----------

async function send(path: string, init?: RequestInit): Promise<Response> {
  if (!API_URL) throw new AuthError('network');
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    // fetch only fails like this when the server cannot be reached
    throw new AuthError('network');
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new AuthError('server');
  }
}

function isUser(value: unknown): value is User {
  const user = value as User | null;
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string'
  );
}

function isLoginResult(value: unknown): value is LoginResult {
  const result = value as LoginResult | null;
  return (
    typeof result === 'object' &&
    result !== null &&
    typeof result.token === 'string' &&
    result.token.length > 0 &&
    isUser(result.user)
  );
}

// POST /sessions : log in. Resolves ONLY when the API answers 200 with a token and a user.
export async function login(email: string, password: string): Promise<LoginResult> {
  const response = await send('/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  // fetch does not fail on 400, 401 or 500, so we check the status ourselves
  if (response.status === 200) {
    const data = await readJson(response);
    if (!isLoginResult(data)) throw new AuthError('server');
    return data;
  }
  if (response.status === 400) throw new AuthError('badRequest');
  if (response.status === 401) throw new AuthError('unauthorized');
  throw new AuthError('server');
}

// GET /users/me : who is logged in? The token goes in the Authorization header.
export async function getMe(token: string): Promise<User> {
  const response = await send('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 200) {
    const data = await readJson(response);
    if (!isUser(data)) throw new AuthError('server');
    return data;
  }
  if (response.status === 401) throw new AuthError('unauthorized');
  throw new AuthError('server');
}

// ---------- Token storage (sessionStorage: cleared when the tab closes) ----------
// Storage can be blocked (private mode), so every call is wrapped in try/catch.
// The token is never put in the URL and never printed with console.log.

export function saveToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // the user simply stays logged in until the page is refreshed
  }
}

export function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // nothing to clear
  }
}
