import { decodeJWT, getToken, removeToken, setToken, isTokenExpired } from './jwt-utils';

export type Role = "staff" | "supervisor" | "manager" | "hr" | "admin";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

/**
 * Get current session user from JWT token
 * Returns null if no valid token is found
 */
export function getSessionUser(): SessionUser | null {
  try {
    const token = getToken();
    
    if (!token) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      removeToken();
      return null;
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
      return null;
    }

    return {
      id: decoded.user_id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role.toLowerCase() as Role,
    };
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const user = getSessionUser();
  return user !== null;
}

/**
 * Store login token and user data
 */
export function setAuthToken(token: string): void {
  setToken(token);
}

/**
 * Clear authentication (logout)
 */
export function clearAuth(): void {
  removeToken();
  // Clear any other auth-related data if needed
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(role: Role | Role[]): boolean {
  const user = getSessionUser();
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Check if user is manager or admin
 */
export function isManagerOrAdmin(): boolean {
  return hasRole(['manager', 'admin']);
}

/**
 * Check if user is HR or admin
 */
export function isHROrAdmin(): boolean {
  return hasRole(['hr', 'admin']);
}

/**
 * Check if user is supervisor or manager or admin
 */
export function isSupervisorOrAbove(): boolean {
  return hasRole(['supervisor', 'manager', 'admin']);
}
