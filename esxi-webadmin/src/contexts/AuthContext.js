import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  sessionId: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        sessionId: action.payload.sessionId,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        sessionId: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const user = localStorage.getItem('user');
      
      if (sessionId && user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { 
            user: JSON.parse(user), 
            sessionId 
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (username, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(username, password);
      
      if (response.success) {
        localStorage.setItem('sessionId', response.sessionId);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { 
            user: response.user, 
            sessionId: response.sessionId 
          },
        });
        return { success: true };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
