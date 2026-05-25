import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReviewTask, ScoreDraft, ScoreDimension, SubmittedScore } from '@bochuangyuan/types'

interface ReviewState {
  tasks: ReviewTask[]
  drafts: Record<string, ScoreDraft>
  submitted: SubmittedScore[]

  setTasks: (tasks: ReviewTask[]) => void
  updateDraft: (taskId: string, dimensions: ScoreDimension[], comment: string) => void
  submitScore: (taskId: string, finalScore: number) => void
  getDraft: (taskId: string) => ScoreDraft | undefined
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      tasks: [],
      drafts: {},
      submitted: [],

      setTasks: (tasks) => set({ tasks }),

      updateDraft: (taskId, dimensions, overallComment) =>
        set((s) => ({
          drafts: {
            ...s.drafts,
            [taskId]: { taskId, dimensions, overallComment, savedAt: new Date().toISOString() },
          },
        })),

      submitScore: (taskId, finalScore) => {
        const draft = get().drafts[taskId]
        if (!draft) return
        const score: SubmittedScore = { ...draft, finalScore, submittedAt: new Date().toISOString() }
        set((s) => ({
          submitted: [...s.submitted, score],
          drafts: Object.fromEntries(Object.entries(s.drafts).filter(([k]) => k !== taskId)),
          tasks: s.tasks.map((t) => t.taskId === taskId ? { ...t, status: 'done' } : t),
        }))
      },

      getDraft: (taskId) => get().drafts[taskId],
    }),
    { name: 'specialist-review' },
  ),
)
