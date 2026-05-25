import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@bochuangyuan/types'

interface UserState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    { name: 'bcy-user' },
  ),
)
