import { create } from 'zustand'
import type { Expert, ReviewAssignment } from '@bochuangyuan/types'

interface ExpertState {
  experts: Expert[]
  selectedExperts: Expert[]
  assignments: ReviewAssignment[]

  setExperts: (list: Expert[]) => void
  selectExpert: (expert: Expert) => void
  deselectExpert: (expertId: string) => void
  addManualExpert: (expert: Expert) => void
  setAssignments: (list: ReviewAssignment[]) => void
  assignEnrollments: (expertId: string, enrollIds: string[]) => void
}

export const useExpertStore = create<ExpertState>()((set) => ({
  experts: [],
  selectedExperts: [],
  assignments: [],

  setExperts: (experts) => set({ experts }),

  selectExpert: (expert) =>
    set((s) => ({
      selectedExperts: s.selectedExperts.find((e) => e.expertId === expert.expertId)
        ? s.selectedExperts
        : [...s.selectedExperts, expert],
    })),

  deselectExpert: (expertId) =>
    set((s) => ({ selectedExperts: s.selectedExperts.filter((e) => e.expertId !== expertId) })),

  addManualExpert: (expert) =>
    set((s) => ({ experts: [...s.experts, expert] })),

  setAssignments: (assignments) => set({ assignments }),

  assignEnrollments: (expertId, enrollIds) =>
    set((s) => {
      const existing = s.assignments.find((a) => a.expertId === expertId)
      const newAssignment: ReviewAssignment = {
        assignmentId: existing?.assignmentId ?? `assign-${Date.now()}`,
        competitionId: '',
        expertId,
        enrollIds,
        assignedAt: new Date().toISOString(),
      }
      return {
        assignments: existing
          ? s.assignments.map((a) => a.expertId === expertId ? newAssignment : a)
          : [...s.assignments, newAssignment],
      }
    }),
}))
