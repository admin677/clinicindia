import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, token: null }),
}));

// Notifications store
interface NotificationState {
  notifications: any[];
  unreadCount: number;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

// UI store
interface UIStore {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: true,
  isDarkMode: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleDarkMode: () =>
    set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
