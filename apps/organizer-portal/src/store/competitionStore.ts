import { create } from 'zustand'
import type { Competition, Registration } from '@bochuangyuan/types'

interface CompetitionState {
  competitions: Competition[]
  currentCompetition: Competition | null
  registrations: Registration[]

  setCompetitions: (list: Competition[]) => void
  setCurrentCompetition: (c: Competition | null) => void
  setRegistrations: (list: Registration[]) => void
  upsertCompetition: (c: Competition) => void
}

export const useCompetitionStore = create<CompetitionState>()((set) => ({
  competitions: [],
  currentCompetition: null,
  registrations: [],

  setCompetitions: (competitions) => set({ competitions }),
  setCurrentCompetition: (currentCompetition) => set({ currentCompetition }),
  setRegistrations: (registrations) => set({ registrations }),

  upsertCompetition: (c) =>
    set((s) => {
      const exists = s.competitions.find((x) => x.competitionId === c.competitionId)
      return {
        competitions: exists
          ? s.competitions.map((x) => (x.competitionId === c.competitionId ? c : x))
          : [c, ...s.competitions],
      }
    }),
}))
