import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BackendUser } from '@bochuangyuan/api'

interface UserState {
  user: BackendUser | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: BackendUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('bcyToken', accessToken)
        set({ user, accessToken, refreshToken })
      },
      clearAuth: () => {
        localStorage.removeItem('bcyToken')
        set({ user: null, accessToken: null, refreshToken: null })
      },
    }),
    {
      name: 'bcy-user',
      // rehydrate bcyToken on app load so interceptor picks it up immediately
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem('bcyToken', state.accessToken)
        }
      },
    },
  ),
)
