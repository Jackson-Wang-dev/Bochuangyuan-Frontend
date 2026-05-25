import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OrganizerUser {
  organizerId: string
  name: string
  organization: string
}

interface UserState {
  user: OrganizerUser | null
  token: string | null
  login: (user: OrganizerUser, token: string) => void
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
    { name: 'organizer-user' },
  ),
)
