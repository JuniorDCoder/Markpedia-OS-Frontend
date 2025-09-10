import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  currentModule: string;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
  }>;
}

interface AppStore extends AppState {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentModule: (module: string) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  sidebarCollapsed: false,
  currentModule: 'dashboard',
  notifications: [],

  toggleSidebar: () => {
    set({ sidebarCollapsed: !get().sidebarCollapsed });
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  setCurrentModule: (module: string) => {
    set({ currentModule: module });
  },

  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };
    set({ notifications: [newNotification, ...get().notifications.slice(0, 49)] });
  },

  markNotificationRead: (id: string) => {
    set({
      notifications: get().notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    });
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));