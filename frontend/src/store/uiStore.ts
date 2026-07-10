import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  showNotifications: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleNotifications: () => void;
  setShowNotifications: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  showNotifications: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  toggleNotifications: () => set((s) => ({ showNotifications: !s.showNotifications })),
  setShowNotifications: (showNotifications) => set({ showNotifications }),
}));
