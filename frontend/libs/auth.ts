// Store authentication token and user info
export const setAuthToken = (token: string, email: string, role: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
};

// Logout function
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
  // Redirect to login page
  window.location.href = '/login';
};
