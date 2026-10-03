import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  profileImageFilename?: string;
  bio?: string;
  stats?: {
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    totalLikes: number;
    totalComments: number;
    totalBookmarks: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: { name?: string; bio?: string; profileImage?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  quickLogin: (role: 'admin' | 'author' | 'user') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token is present
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await authAPI.getMe();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    if (res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const res = await authAPI.register({ name, email, password, confirmPassword });
    if (res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (data: { name?: string; bio?: string; profileImage?: string }) => {
    const res = await authAPI.updateProfile(data);
    if (res.success && res.user) {
      setUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const res = await authAPI.uploadProfileImage(file);
    if (res.success && res.imageUrl) {
      setUser((prev) => (prev ? { ...prev, profileImage: res.imageUrl, profileImageFilename: res.filename } : prev));
      return res.imageUrl;
    }
    throw new Error(res.message || 'Avatar upload failed');
  };

  const quickLogin = async (role: 'admin' | 'author' | 'user') => {
    if (role === 'admin') {
      await login('admin@example.com', 'admin123');
    } else if (role === 'author') {
      await login('author@example.com', 'author123');
    } else {
      await login('user@example.com', 'user123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        uploadAvatar,
        quickLogin,
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
