'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';
import socket from './socket';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'crew' | 'traveler';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('pothole_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          socket.connect();
        } catch (err) {
          console.error('Session expired', err);
          localStorage.removeItem('pothole_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('pothole_token', token);
    setUser(userData);
    socket.connect();
    router.push(`/dashboard/${userData.role}`);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, user: userData } = res.data;
    localStorage.setItem('pothole_token', token);
    setUser(userData);
    socket.connect();
    router.push(`/dashboard/${userData.role}`);
  };

  const logout = () => {
    localStorage.removeItem('pothole_token');
    setUser(null);
    socket.disconnect();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
