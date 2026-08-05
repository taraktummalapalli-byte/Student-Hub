import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function useAuth() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: 'student' | 'admin' } | null>(null);

  useEffect(() => {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      try {
        setUser(JSON.parse(authUser));
      } catch (e) {
        console.error('Failed to parse auth user', e);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setLocation('/');
  };

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    logout
  };
}
