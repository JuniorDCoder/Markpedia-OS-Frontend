// lib/api/client.ts
// A lightweight API client for browser-side calls to the FastAPI backend

export type ValidationError = {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
};

export type LoginResponse = {
  access_token: string;
  token_type: 'bearer' | string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    department?: string;
    position?: string;
    avatar?: string;
    permissions?: string[];
    id: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
  };
};

function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL; // support either name
  if (!base) {
    // In development we can default to the provided URL for convenience
    return 'http://127.0.0.1:8000';
  }
  return base.replace(/\/$/, '');
}

function getAuthToken() {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem('auth_token') || undefined;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
    };

    const token = getAuthToken();
    if (token) {
        (headers as any).Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    // Handle successful responses with no content
    if (res.status === 204 || res.headers.get('content-length') === '0') {
        return undefined as T;
    }

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!isJson) {
        // For non-JSON successful responses, return as is
        if (res.ok) {
            return undefined as T;
        }
        // For non-JSON error responses, throw with status text
        const error: any = new Error(res.statusText);
        error.status = res.status;
        throw error;
    }

    const data = await res.json();

    if (!res.ok) {
        // Bubble up FastAPI validation errors and messages
        const error: any = new Error(data?.detail?.[0]?.msg || data?.detail || res.statusText);
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data as T;
}

export async function loginApi(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
