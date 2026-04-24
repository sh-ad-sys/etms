/**
 * API Client with JWT Authentication
 * Automatically adds Authorization header with JWT token to all requests
 */

import { getAuthHeaders, handleUnauthorized } from '@/config/api';
import { getToken, isTokenExpired } from './jwt-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/etms/controllers';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any;
}

/**
 * Fetch with automatic JWT token attachment
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  // Check if token is expired
  if (token && isTokenExpired(token)) {
    console.warn('Token expired, removing...');
    handleUnauthorized();
    throw new Error('Token expired');
  }

  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  } as Record<string, string>;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  console.log('API Request:', { url, method: options.method || 'GET', headers });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies if needed
    });

    console.log('API Response:', { url, status: response.status });

    // Handle 401 Unauthorized - token invalid or expired
    if (response.status === 401) {
      console.warn('Unauthorized - clearing token');
      handleUnauthorized();
      throw new Error('Unauthorized');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const data = await response.json();
      throw new Error(data.error || `Access forbidden`);
    }

    const data = await response.json();

    // Check if response is successful
    if (!response.ok) {
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API request error:', { url, error });
    throw error;
  }
}

/**
 * GET request
 */
export function apiGet<T = any>(
  endpoint: string,
  options?: Omit<RequestInit, 'method'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request
 */
export function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestInit, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestInit, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request
 */
export function apiPatch<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestInit, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export function apiDelete<T = any>(
  endpoint: string,
  options?: Omit<RequestInit, 'method'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

export default {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};
