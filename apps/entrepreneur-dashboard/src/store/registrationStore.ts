import { create } from 'zustand'
import type { Registration, RegistrationStatus } from '@bochuangyuan/types'

interface RegistrationState {
  registrations: Registration[]
  currentRegistration: Registration | null

  setRegistrations: (list: Registration[]) => void
  setCurrentRegistration: (r: Registration | null) => void
  upsertRegistration: (r: Registration) => void
  updateStatus: (regId: string, status: RegistrationStatus) => void
}

export const useRegistrationStore = create<RegistrationState>()((set) => ({
  registrations: [],
  currentRegistration: null,

  setRegistrations: (registrations) => set({ registrations }),
  setCurrentRegistration: (currentRegistration) => set({ currentRegistration }),

  upsertRegistration: (r) =>
    set((s) => {
      const exists = s.registrations.find((x) => x.regId === r.regId)
      return {
        registrations: exists
          ? s.registrations.map((x) => (x.regId === r.regId ? r : x))
          : [r, ...s.registrations],
        currentRegistration: r,
      }
    }),

  updateStatus: (regId, status) =>
    set((s) => ({
      registrations: s.registrations.map((r) =>
        r.regId === regId ? { ...r, status } : r,
      ),
      currentRegistration:
        s.currentRegistration?.regId === regId
          ? { ...s.currentRegistration, status }
          : s.currentRegistration,
    })),
}))
