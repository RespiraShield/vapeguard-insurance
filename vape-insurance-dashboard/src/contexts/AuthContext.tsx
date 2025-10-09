// Authentication Context for VapeGuard Insurance Dashboard
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { 
  getAuthToken, 
  getUserData, 
  setAuthToken, 
  setUserData, 
  clearAuthData,
  isTokenExpired 
} from '../utils/auth';
import apiService from '../services/api';
import { logger } from '../utils/logger';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth context type
interface AuthContextType extends AuthState {
  login: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const token = getAuthToken();
      const userData = getUserData();

      if (!token || !userData) {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // Try to refresh token
        try {
          const response = await apiService.refreshToken();
          if (response.success && response.data?.token) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: userData, token: response.data.token },
            });
            return;
          }
        } catch (error) {
          // Refresh failed, logout user
          clearAuthData();
          dispatch({ type: 'LOGOUT' });
          return;
        }
      }

      // Token is valid, set user as authenticated
      apiService.setToken(token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData, token },
      });
    } catch (error) {
      logger.error('Auth check failed:', error);
      clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email: string, otp: string): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await apiService.verifyLoginOTP(email, otp);

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store auth data
        setAuthToken(token);
        setUserData(user);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to invalidate token on server
      await apiService.logout();
    } catch (error) {
      logger.error('Logout API call failed:', error);
    } finally {
      // Clear local auth data regardless of API call result
      clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
