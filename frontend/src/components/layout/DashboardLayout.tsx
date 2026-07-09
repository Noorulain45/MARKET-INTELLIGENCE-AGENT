'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authApi } from '@/lib/api';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, setAuth, clearAuth, setLoading } = useAuthStore();
  const { theme } = useUIStore();

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        clearAuth();
        router.replace('/login');
        return;
      }
      try {
        const { data } = await authApi.me();
        const user = data.data;
        setAuth(user, token);
      } catch {
        clearAuth();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
