'use client';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { apiFetch } from '@/lib/api';
import { STORAGE_KEYS, ROLES } from '@/lib/constants';

const AuthContext = createContext(null);

const VIP_LEVELS = {
  NONE:  { key: null,     label: '免费用户',   color: '#717171', bg: '#717171/15' },
  VIP:   { key: 'VIP',    label: 'VIP',        color: '#F59E0B', bg: '#F59E0B/15' },
  VVIP:  { key: 'VVIP',   label: 'VVIP',       color: '#6366F1', bg: '#6366F1/15' },
  SVIP:  { key: 'SVIP',   label: 'Super VIP',  color: '#EF4444', bg: '#EF4444/15' },
};

export { VIP_LEVELS };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [vipLevel, setVipLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedVip = localStorage.getItem('vip_level');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    if (storedVip) setVipLevel(storedVip);
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    setUser(data.user);
    // Restore saved VIP level on login
    const savedVip = localStorage.getItem('vip_level');
    if (savedVip) setVipLevel(savedVip);
    return data;
  }, []);

  const register = useCallback(async (username, password, email) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // Keep vip_level so it persists across sessions
    setUser(null);
    setVipLevel(null);
  }, []);

  const upgradeVip = useCallback((levelKey) => {
    localStorage.setItem('vip_level', levelKey);
    setVipLevel(levelKey);
  }, []);

  const vipInfo = VIP_LEVELS[vipLevel] || VIP_LEVELS.NONE;

  const isAdmin = user?.role === ROLES.ADMIN;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isAuthenticated,
      vipLevel, vipInfo, upgradeVip,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
