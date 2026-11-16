import { create } from 'zustand';

type Role = 'parent' | 'brother' | 'sister' | null;

interface UserState {
  userRole: Role;
  setUserRole: (role: Role) => void;
}

export const useStore = create<UserState>((set) => ({
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),
}));
