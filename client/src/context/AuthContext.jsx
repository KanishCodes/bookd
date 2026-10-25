import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe as apiGetMe } from '../api/auth.api.js';
import { MOCK_USERS } from '../mock/users.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage or set default demo member for instant evaluation
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('bookd_token');
        const storedUser = localStorage.getItem('bookd_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // By default, set member demo account so the UI works right away without extra clicks
          const defaultMember = MOCK_USERS[0];
          const demoToken = `mock-jwt-token-for-${defaultMember.role}-${defaultMember.id}`;
          setToken(demoToken);
          setUser(defaultMember);
          localStorage.setItem('bookd_token', demoToken);
          localStorage.setItem('bookd_user', JSON.stringify(defaultMember));
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('bookd_token', data.token);
    localStorage.setItem('bookd_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bookd_token');
    localStorage.removeItem('bookd_user');
  };

  /**
   * Fast Demo Role Switcher for the evaluation demo
   * Allows 1-click role toggling between Member, Librarian, Admin
   */
  const switchDemoRole = (role) => {
    const targetUser = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    const demoToken = `mock-jwt-token-for-${targetUser.role}-${targetUser.id}`;
    setToken(demoToken);
    setUser(targetUser);
    localStorage.setItem('bookd_token', demoToken);
    localStorage.setItem('bookd_user', JSON.stringify(targetUser));
  };

  const refreshUser = async () => {
    try {
      const data = await apiGetMe();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('bookd_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.warn('Could not refresh user profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        switchDemoRole,
        refreshUser
      }}
    >
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
