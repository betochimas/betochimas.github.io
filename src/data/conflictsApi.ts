// API client for the Historical Conflicts API demo.
// Base URL comes from VITE_API_BASE_URL (see .env.* files); defaults to local dev.
// The JWT is kept in localStorage and attached as a Bearer token on write calls.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const TOKEN_KEY = 'hc_demo_token';

// ----- Types (mirror the API's DTOs) -----

export interface PageEnvelope<T> {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}

export interface Conflict {
  id: number;
  name: string;
  conflictType: string;
  startDate: string | null;
  endDate: string | null;
  outcome: string | null;
  description: string | null;
}

export interface Nation {
  id: number;
  name: string;
  region: string | null;
  foundedYear: number | null;
  dissolvedYear: number | null;
  description: string | null;
}

export interface Battle {
  id: number;
  conflictId: number;
  name: string;
  date: string | null;
  location: string | null;
  terrain: string | null;
  outcome: string | null;
  description: string | null;
}

export interface Participant {
  id: number;
  conflictId: number;
  nationId: number;
  role: string;
  troopsCommitted: number | null;
  casualties: number | null;
  outcome: string | null;
}

export const CONFLICT_TYPES = [
  'WAR', 'CIVIL_WAR', 'REBELLION', 'REVOLUTION',
  'CRUSADE', 'COLONIAL_WAR', 'PROXY_WAR', 'BORDER_CONFLICT',
];

// ----- Token helpers -----

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ----- Low-level request -----

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Could not reach the demo API. It may be asleep or not deployed yet.');
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    if (res.status === 401) logout(); // stale/expired token — drop it
    throw new ApiError(res.status, message);
  }
  return data as T;
}

// ----- Auth -----

export async function login(username: string, password: string): Promise<void> {
  const data = await request<{ accessToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem(TOKEN_KEY, data.accessToken);
}

// ----- Reads (public) -----

export function listConflicts(size = 20): Promise<PageEnvelope<Conflict>> {
  return request<PageEnvelope<Conflict>>(`/api/conflicts?size=${size}`);
}

export function listBattles(conflictId: number): Promise<PageEnvelope<Battle>> {
  return request<PageEnvelope<Battle>>(`/api/battles?conflictId=${conflictId}&size=100`);
}

export function listParticipants(conflictId: number): Promise<PageEnvelope<Participant>> {
  return request<PageEnvelope<Participant>>(`/api/conflict-participants?conflictId=${conflictId}&size=100`);
}

export function listNations(size = 100): Promise<PageEnvelope<Nation>> {
  return request<PageEnvelope<Nation>>(`/api/nations?size=${size}`);
}

// ----- Writes (require login) -----

export function createConflict(dto: Partial<Conflict>): Promise<Conflict> {
  return request<Conflict>('/api/conflicts', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function deleteConflict(id: number): Promise<void> {
  return request<void>(`/api/conflicts/${id}`, { method: 'DELETE' });
}

export { ApiError };
