import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SpecialistUser {
  expertId: string
  name: string
  phone: string
  organization: string
  domain: string[]
}

interface UserState {
  user: SpecialistUser | null
  token: string | null
  login: (user: SpecialistUser, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'specialist-user' },
  ),
)
