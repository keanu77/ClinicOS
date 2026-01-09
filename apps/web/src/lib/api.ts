import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function api<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const session = await getSession();
  const { params, ...fetchOptions } = options;

  let url = `${API_URL}/api${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (session?.accessToken) {
    (headers as Record<string, string>)['Authorization'] =
      `Bearer ${session.accessToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

// Convenience methods
export const apiGet = <T>(endpoint: string, params?: FetchOptions['params']) =>
  api<T>(endpoint, { method: 'GET', params });

export const apiPost = <T>(endpoint: string, data?: unknown) =>
  api<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });

export const apiPatch = <T>(endpoint: string, data?: unknown) =>
  api<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) });

export const apiDelete = <T>(endpoint: string) =>
  api<T>(endpoint, { method: 'DELETE' });
