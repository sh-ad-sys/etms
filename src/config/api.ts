// Centralized API configuration for JWT authentication
import { getToken, getBearerToken, removeToken as removeTokenUtil, isTokenExpired } from '@/lib/jwt-utils';

// Use environment variable for production, localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/etms/controllers';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/login.php`,
  logout: `${API_BASE_URL}/logout.php`,
  profile: `${API_BASE_URL}/get-profile.php`,
  notifications: `${API_BASE_URL}/notifications.php`,
  // Add more endpoints as needed
};

// Helper to get auth headers with JWT token
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Store token in localStorage
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

// Get token from localStorage (re-exported for backwards compatibility)
export function getTokenFromStorage(): string | null {
  return getToken();
}

// Remove token from localStorage
export function removeToken(): void {
  removeTokenUtil();
}

// Also export as removeTokenFromStorage for clarity
export function removeTokenFromStorage(): void {
  removeTokenUtil();
}

// Check if token is valid
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

// Handle unauthorized responses
export function handleUnauthorized(): void {
  removeTokenUtil();
  if (typeof window !== 'undefined') {
    // Clear any user session data
    localStorage.removeItem('user');
    // Redirect to login
    window.location.href = '/';
  }
}

export default API_BASE_URL;
