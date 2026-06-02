import { create } from 'zustand'
import type { Judge, JudgeAssignment, ReviewStage } from '@bochuangyuan/types'

interface ExpertState {
  judges: Judge[]
  selectedExperts: Judge[]
  assignments: JudgeAssignment[]

  setJudges: (list: Judge[]) => void
  selectExpert: (judge: Judge) => void
  deselectExpert: (judgeId: string) => void
  addManualExpert: (judge: Judge) => void
  setAssignments: (list: JudgeAssignment[]) => void
  assignEnrollments: (judgeId: string, projectIds: string[]) => void
}

export const useExpertStore = create<ExpertState>()((set) => ({
  judges: [],
  selectedExperts: [],
  assignments: [],

  setJudges: (judges) => set({ judges }),

  selectExpert: (judge) =>
    set((s) => ({
      selectedExperts: s.selectedExperts.find((j) => j.judgeId === judge.judgeId)
        ? s.selectedExperts
        : [...s.selectedExperts, judge],
    })),

  deselectExpert: (judgeId) =>
    set((s) => ({ selectedExperts: s.selectedExperts.filter((j) => j.judgeId !== judgeId) })),

  addManualExpert: (judge) =>
    set((s) => ({ judges: [...s.judges, judge] })),

  setAssignments: (assignments) => set({ assignments }),

  assignEnrollments: (judgeId, projectIds) =>
    set((s) => {
      const existing = s.assignments.find((a) => a.judgeId === judgeId)
      const stage: ReviewStage = 'Prelim'
      const newAssignment: JudgeAssignment = {
        assignId: existing?.assignId ?? `assign-${Date.now()}`,
        competitionId: '',
        stage,
        judgeId,
        projectIds,
        assignedAt: new Date().toISOString(),
      }
      return {
        assignments: existing
          ? s.assignments.map((a) => a.judgeId === judgeId ? newAssignment : a)
          : [...s.assignments, newAssignment],
      }
    }),
}))
