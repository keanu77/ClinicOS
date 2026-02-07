import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const ERROR_MESSAGES: Record<string, string> = {
  // HTTP Status Codes
  400: '請求格式不正確，請檢查輸入資料',
  401: '登入已過期，請重新登入',
  403: '您沒有權限執行此操作',
  404: '找不到請求的資源',
  409: '資料衝突，可能已被其他人修改',
  422: '輸入資料驗證失敗',
  429: '請求過於頻繁，請稍後再試',
  500: '伺服器內部錯誤，請聯繫管理員',
  502: '伺服器暫時無法連線',
  503: '服務暫時不可用，請稍後再試',
  // Custom Error Codes
  INSUFFICIENT_STOCK: '庫存不足',
  SKU_EXISTS: 'SKU 已存在',
  EMAIL_EXISTS: 'Email 已被使用',
  INVALID_CREDENTIALS: 'Email 或密碼錯誤',
  SHIFT_CONFLICT: '班次時間衝突',
  VERSION_CONFLICT: '此資料已被其他人修改，請重新整理後再試',
};

function getErrorMessage(status: number, errorCode?: string, fallback?: string): string {
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  if (ERROR_MESSAGES[status]) {
    return ERROR_MESSAGES[status];
  }
  return fallback || `發生錯誤 (${status})`;
}

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
    const message = getErrorMessage(
      response.status,
      error.code,
      error.message,
    );
    throw new Error(message);
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
