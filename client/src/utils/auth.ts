// Authentication utility functions
export const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ep-auth-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const getAuthenticatedFetchOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    credentials: 'include', // Still include for session fallback
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ep-auth');
    localStorage.removeItem('ep-auth-token');
  }
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ep-auth') === '1' && localStorage.getItem('ep-auth-token');
  }
  return false;
};
