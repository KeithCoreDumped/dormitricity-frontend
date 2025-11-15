'use client';

import { getToken } from './auth';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/xapi";
const redirectExemptEndpoints = ["/auth/login", "/auth/register"];

function shouldSkipRedirect(url: string) {
  return redirectExemptEndpoints.some((endpoint) => url.startsWith(endpoint));
}

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
    let errorMessage = "Something went wrong";
    try {
      const errorBody = await response.json();
      if (typeof errorBody === "string") {
        errorMessage = errorBody;
      } else if (errorBody?.error || errorBody?.message) {
        errorMessage = errorBody.error || errorBody.message;
      }
    } catch {
      // ignore parse errors and keep fallback message
    }

    if (response.status === 401 && !shouldSkipRedirect(url)) {
      const loginUrl = new URL(window.location.origin + "/login");
      loginUrl.searchParams.set("reason", "session-expired");
      const nextPath = window.location.pathname + window.location.search;
      if (nextPath && nextPath !== "/login") {
        loginUrl.searchParams.set("next", nextPath);
      }
      window.location.href = loginUrl.toString();
      throw new Error("UNAUTHORIZED");
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export const apiClient = {
  get: (url: string) => request('GET', url),
  post: (url: string, body: unknown) => request('POST', url, body),
  put: (url: string, body: unknown) => request('PUT', url, body),
  delete: (url: string) => request('DELETE', url),
};
