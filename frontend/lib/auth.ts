/**
 * Authentication Utilities
 * Simple auth helpers - replace with your actual auth provider
 */

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_email');
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_role');
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
  window.location.href = '/login';
}

export function setAuthToken(token: string, email: string, role: string = 'user'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_email', email);
  localStorage.setItem('user_role', role);
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const userRole = getUserRole();
  return userRole === role || userRole === 'admin';
}

/**
 * Protected route wrapper for client components
 */
export function requireAuth() {
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}
