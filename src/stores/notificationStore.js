import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now(), message },
      ],
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
