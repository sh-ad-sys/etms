// Centralized API configuration for JWT authentication

const API_BASE_URL = 'http://localhost/etms/controllers';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/login.php`,
  logout: `${API_BASE_URL}/logout.php`,
  profile: `${API_BASE_URL}/get-profile.php`,
  notifications: `${API_BASE_URL}/notifications.php`,
  // Add more endpoints as needed
};

// Helper to get auth headers with JWT token
export function getAuthHeaders(): HeadersInit {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }
  return { 'Content-Type': 'application/json' };
}

// Store token in localStorage
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export default API_BASE_URL;
