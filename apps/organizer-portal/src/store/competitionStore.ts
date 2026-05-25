import { create } from 'zustand'
import type { OrganizerCompetition, EnrollmentRecord, ScoreDimensionConfig } from '@bochuangyuan/types'

interface CompetitionState {
  competitions: OrganizerCompetition[]
  currentCompetition: OrganizerCompetition | null
  enrollments: EnrollmentRecord[]

  setCompetitions: (list: OrganizerCompetition[]) => void
  setCurrentCompetition: (c: OrganizerCompetition | null) => void
  setEnrollments: (list: EnrollmentRecord[]) => void
  upsertCompetition: (c: OrganizerCompetition) => void
  updateDimensions: (competitionId: string, dims: ScoreDimensionConfig[]) => void
}

export const useCompetitionStore = create<CompetitionState>()((set) => ({
  competitions: [],
  currentCompetition: null,
  enrollments: [],

  setCompetitions: (competitions) => set({ competitions }),
  setCurrentCompetition: (currentCompetition) => set({ currentCompetition }),
  setEnrollments: (enrollments) => set({ enrollments }),

  upsertCompetition: (c) =>
    set((s) => {
      const exists = s.competitions.find((x) => x.competitionId === c.competitionId)
      return {
        competitions: exists
          ? s.competitions.map((x) => x.competitionId === c.competitionId ? c : x)
          : [c, ...s.competitions],
      }
    }),

  updateDimensions: (competitionId, dims) =>
    set((s) => ({
      competitions: s.competitions.map((c) =>
        c.competitionId === competitionId ? { ...c, scoreDimensions: dims } : c,
      ),
    })),
}))
