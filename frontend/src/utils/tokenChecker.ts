// Token expiry checker utility
export const checkTokenExpiry = (): boolean => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return false;
  }

  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = tokenPayload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime < expiryTime;
  } catch (e) {
    console.error('Error checking token expiry:', e);
    return false;
  }
};

export const forceLogoutIfExpired = (): void => {
  if (!checkTokenExpiry()) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
  }
};

// Check token expiry every 5 minutes
export const startTokenExpiryChecker = (): NodeJS.Timeout => {
  return setInterval(() => {
    forceLogoutIfExpired();
  }, 5 * 60 * 1000); // 5 minutes
};
