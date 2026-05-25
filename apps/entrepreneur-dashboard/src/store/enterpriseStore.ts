import { create } from 'zustand'
import type { EnterpriseProfile, Honor, IntellectualProperty, Product, TeamMember } from '@bochuangyuan/types'

interface EnterpriseState {
  profile: EnterpriseProfile | null
  isLoading: boolean
  setProfile: (profile: EnterpriseProfile) => void
  addHonor: (honor: Honor) => void
  removeHonor: (honorId: string) => void
  addIp: (ip: IntellectualProperty) => void
  removeIp: (ipId: string) => void
  addProduct: (product: Product) => void
  addTeamMember: (member: TeamMember) => void
  removeTeamMember: (memberId: string) => void
  setLoading: (loading: boolean) => void
}

export const useEnterpriseStore = create<EnterpriseState>()((set) => ({
  profile: null,
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  addHonor: (honor) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, honors: [...state.profile.honors, honor] } }
        : {},
    ),
  removeHonor: (honorId) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, honors: state.profile.honors.filter((h) => h.honorId !== honorId) } }
        : {},
    ),
  addIp: (ip) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, ipList: [...state.profile.ipList, ip] } }
        : {},
    ),
  removeIp: (ipId) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, ipList: state.profile.ipList.filter((ip) => ip.ipId !== ipId) } }
        : {},
    ),
  addProduct: (product) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, products: [...state.profile.products, product] } }
        : {},
    ),
  addTeamMember: (member) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, team: [...state.profile.team, member] } }
        : {},
    ),
  removeTeamMember: (memberId) =>
    set((state) =>
      state.profile
        ? { profile: { ...state.profile, team: state.profile.team.filter((m) => m.memberId !== memberId) } }
        : {},
    ),
  setLoading: (isLoading) => set({ isLoading }),
}))
