// Authentication utilities
import Cookies from 'js-cookie';
import { User } from '../types';

export const AUTH_TOKEN_KEY = 'vg_auth_token';
export const REFRESH_TOKEN_KEY = 'vg_refresh_token';
export const USER_DATA_KEY = 'vg_user_data';

// Token management
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// Refresh token management (secure cookies)
export const setRefreshToken = (token: string): void => {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    httpOnly: false, // Note: In production, this should be httpOnly: true and set by server
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 7, // 7 days
  });
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = (): void => {
  Cookies.remove(REFRESH_TOKEN_KEY);
};

// User data management
export const setUserData = (user: User): void => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const getUserData = (): User | null => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = (): void => {
  localStorage.removeItem(USER_DATA_KEY);
};

// Clear all auth data
export const clearAuthData = (): void => {
  removeAuthToken();
  removeRefreshToken();
  removeUserData();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getUserData();
  return !!(token && user);
};

// JWT token validation
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiry time
export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

// Mask sensitive data
export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;
  return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
};

export const maskPAN = (pan: string): string => {
  if (pan.length < 4) return pan;
  return pan.slice(0, 3) + '*'.repeat(pan.length - 4) + pan.slice(-1);
};

export const maskAadhaar = (aadhaar: string): string => {
  if (aadhaar.length < 4) return aadhaar;
  return '*'.repeat(aadhaar.length - 4) + aadhaar.slice(-4);
};

export const maskBankAccount = (account: string): string => {
  if (account.length < 4) return account;
  return '*'.repeat(account.length - 4) + account.slice(-4);
};
