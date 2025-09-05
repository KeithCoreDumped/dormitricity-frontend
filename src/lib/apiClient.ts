import { getToken } from './auth';

// const apiBase = process.env.NEXT_PUBLIC_API_BASE;

const apiBase = "https://dormitricity-worker.kcd049.workers.dev";

async function request(method: string, url: string, body?: unknown) {
  const token = getToken();
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBase}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}

export const apiClient = {
  get: (url: string) => request('GET', url),
  post: (url: string, body: unknown) => request('POST', url, body),
  put: (url: string, body: unknown) => request('PUT', url, body),
  delete: (url: string) => request('DELETE', url),
};