// Utility functions for role-based navigation
export const getPoolsUrlForRole = (role: 'borrower' | 'investor' | null): string => {
  if (role === 'investor') {
    return '/pools-investor';
  }
  return '/pools';
};

// Smart navigation that can infer role from current location if role is not provided
export const getSmartPoolsUrl = (role?: 'borrower' | 'investor' | null): string => {
  // If role is explicitly provided, use it
  if (role) {
    return getPoolsUrlForRole(role);
  }
  
  // If no role provided, infer from current path
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pools-investor')) {
      return '/pools-investor';
    }
  }
  
  // Default to borrower pools
  return '/pools';
};

export const redirectToPoolsForRole = (role: 'borrower' | 'investor' | null): void => {
  const url = getPoolsUrlForRole(role);
  window.location.href = url;
};
