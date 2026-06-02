import { create } from 'zustand'
import type { Competition } from '@bochuangyuan/types'

interface CompetitionState {
  competitions: Competition[]
  currentCompetition: Competition | null
  setCompetitions: (list: Competition[]) => void
  setCurrentCompetition: (c: Competition | null) => void
}

export const useCompetitionStore = create<CompetitionState>()((set) => ({
  competitions: [],
  currentCompetition: null,
  setCompetitions: (competitions) => set({ competitions }),
  setCurrentCompetition: (currentCompetition) => set({ currentCompetition }),
}))
