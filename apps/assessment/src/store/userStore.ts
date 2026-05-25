import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AssessmentSession } from '../types'
import { getOrCreateClientId } from '../utils/clientId'

interface UserStore {
  clientId: string
  allReports: AssessmentSession[]

  initClientId: () => string
  saveReport: (session: AssessmentSession) => void
  getLastActiveReport: () => AssessmentSession | null
  deleteReport: (uuid: string) => void
  getReportByUuid: (uuid: string) => AssessmentSession | null
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      clientId: '',
      allReports: [],

      initClientId: () => {
        const id = getOrCreateClientId()
        set({ clientId: id })
        return id
      },

      saveReport: (session) => {
        set((state) => {
          // Archive any existing active report
          const updated = state.allReports.map((r) =>
            r.clientId === session.clientId && r.status === 'completed'
              ? { ...r, status: 'completed' as const }
              : r,
          )
          // Add new report, avoiding duplicate uuids
          const filtered = updated.filter((r) => r.uuid !== session.uuid)
          return { allReports: [session, ...filtered] }
        })
      },

      getLastActiveReport: () => {
        const { allReports, clientId } = get()
        return (
          allReports.find((r) => r.clientId === clientId && r.status === 'completed') ?? null
        )
      },

      deleteReport: (uuid) => {
        set((state) => ({
          allReports: state.allReports.filter((r) => r.uuid !== uuid),
        }))
      },

      getReportByUuid: (uuid) => {
        return get().allReports.find((r) => r.uuid === uuid) ?? null
      },
    }),
    {
      name: 'user-storage',
    },
  ),
)
