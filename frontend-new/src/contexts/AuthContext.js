import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiMethods, TokenManager } from '../api';
import { toast } from 'react-toastify';

// User roles with permissions
export const USER_ROLES = {
  VISITOR: 'visitor',
  EMPLOYEE: 'employee',
  IT_SUPPORT: 'it_support',
  SUPER_ADMIN: 'super_admin'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.VISITOR]: ['submit_ticket', 'view_own_tickets', 'update_profile'],
  [USER_ROLES.EMPLOYEE]: ['submit_ticket', 'view_own_tickets', 'update_profile', 'chat_support', 'set_priority'],
  [USER_ROLES.IT_SUPPORT]: ['view_all_tickets', 'update_tickets', 'manage_users', 'chat', 'analytics', 'bulk_actions'],
  [USER_ROLES.SUPER_ADMIN]: ['*'] // All permissions
};

// Auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  userRole: null,
  userName: null,
  permissions: [],
  loginAttempts: 0,
  lastLoginTime: null,
  sessionExpiry: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        token: action.payload.token,
        userRole: action.payload.user.role,
        userName: action.payload.user.name,
        permissions: getPermissions(action.payload.user.role),
        loginAttempts: 0,
        lastLoginTime: new Date().toISOString(),
        sessionExpiry: action.payload.sessionExpiry
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        loginAttempts: state.loginAttempts + 1,
        user: null,
        token: null,
        userRole: null,
        userName: null,
        permissions: []
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
        loginAttempts: state.loginAttempts
      };
    
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        userName: action.payload.name || state.userName
      };
    
    case 'REFRESH_SESSION':
      return {
        ...state,
        token: action.payload.token,
        sessionExpiry: action.payload.sessionExpiry
      };
    
    case 'UPDATE_PERMISSIONS':
      return {
        ...state,
        permissions: getPermissions(action.payload.role),
        userRole: action.payload.role
      };
    
    default:
      return state;
  }
};

// Get permissions for role
const getPermissions = (role) => {
  if (role === USER_ROLES.SUPER_ADMIN) {
    return ['*'];
  }
  return ROLE_PERMISSIONS[role] || [];
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Session monitoring
  useEffect(() => {
    if (state.isAuthenticated && state.sessionExpiry) {
      const checkSession = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(state.sessionExpiry).getTime();
        
        if (now >= expiry - 300000) { // 5 minutes before expiry
          refreshSession();
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkSession);
    }
  }, [state.isAuthenticated, state.sessionExpiry]);

  const initializeAuth = async () => {
    try {
      const token = TokenManager.getToken();
      const userRole = localStorage.getItem('userRole');
      const userName = localStorage.getItem('userName');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (token && !TokenManager.isTokenExpired(token)) {
        // Verify token with server
        const response = await apiMethods.users.getProfile();
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            token,
            sessionExpiry: response.data.sessionExpiry
          }
        });

        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', response.data.user.name);
      } else {
        // Clear invalid token
        TokenManager.clearAll();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      TokenManager.clearAll();
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiMethods.auth.login(credentials);
      const { user, token, refreshToken, sessionExpiry } = response.data;

      // Store tokens
      TokenManager.setToken(token);
      TokenManager.setRefreshToken(refreshToken);

      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token, sessionExpiry }
      });

      toast.success(`Welcome back, ${user.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      return { success: true, user, redirectTo: getDashboardRoute(user.role) };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      dispatch({ type: 'LOGIN_FAILURE' });
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiMethods.auth.register(userData);
      const { user, token, refreshToken, requiresVerification } = response.data;

      if (requiresVerification) {
        toast.success('Registration successful! Please check your email for verification.', {
          position: "top-right",
          autoClose: 5000,
        });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, requiresVerification: true };
      }

      // Auto-login after registration
      TokenManager.setToken(token);
      TokenManager.setRefreshToken(refreshToken);

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });

      toast.success(`Welcome to the platform, ${user.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      return { success: true, user, redirectTo: getDashboardRoute(user.role) };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiMethods.auth.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      TokenManager.clearAll();
      dispatch({ type: 'LOGOUT' });
      
      toast.info('You have been logged out successfully', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const refreshSession = async () => {
    try {
      const response = await apiMethods.auth.refreshToken();
      const { accessToken, sessionExpiry } = response.data;

      TokenManager.setToken(accessToken);
      
      dispatch({
        type: 'REFRESH_SESSION',
        payload: { token: accessToken, sessionExpiry }
      });
    } catch (error) {
      console.error('Session refresh failed:', error);
      logout();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiMethods.users.updateProfile(profileData);
      const updatedUser = response.data.user;

      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updatedUser
      });

      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userName', updatedUser.name);

      toast.success('Profile updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email) => {
    try {
      await apiMethods.auth.resetPassword(email);
      
      toast.success('Password reset instructions sent to your email', {
        position: "top-right",
        autoClose: 5000,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Get dashboard route based on role
  const getDashboardRoute = (role) => {
    switch (role) {
      case USER_ROLES.VISITOR:
        return '/visitor-dashboard';
      case USER_ROLES.EMPLOYEE:
        return '/employee-dashboard';
      case USER_ROLES.IT_SUPPORT:
      case USER_ROLES.SUPER_ADMIN:
        return '/admin-dashboard';
      default:
        return '/visitor-dashboard';
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (state.permissions.includes('*')) return true;
    return state.permissions.includes(permission);
  };

  // Check if user has any of the specified roles
  const hasRole = (roles) => {
    if (Array.isArray(roles)) {
      return roles.includes(state.userRole);
    }
    return state.userRole === roles;
  };

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    hasPermission,
    hasRole,
    getDashboardRoute,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;