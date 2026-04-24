/**
 * JWT Utilities for Frontend
 * Note: This decodes the token payload only (doesn't verify signature)
 * Signature verification happens on the backend
 */

export interface JWTPayload {
  user_id: number;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token payload
 * WARNING: This does NOT verify the signature - only decodes the payload
 * Always trust the backend to verify the token
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get token from localStorage
 * Uses 'token' key for consistency with existing code
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Store token in localStorage
 * Uses 'token' key for consistency with existing code
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/**
 * Remove token from localStorage
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

/**
 * Get Bearer token for Authorization header
 */
export function getBearerToken(): string | null {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
}
