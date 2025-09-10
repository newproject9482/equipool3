// Utility functions for role-based navigation
export const getPoolsUrlForRole = (role: 'borrower' | 'investor' | null): string => {
  if (role === 'investor') {
    return '/pools-investor';
  }
  return '/pools';
};

export const redirectToPoolsForRole = (role: 'borrower' | 'investor' | null): void => {
  const url = getPoolsUrlForRole(role);
  window.location.href = url;
};
