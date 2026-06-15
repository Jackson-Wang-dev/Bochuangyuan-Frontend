import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ReviewSession {
  id: string
  projectId: number
  projectName: string
  mode: 'A' | 'B'
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  docText: string
  createdAt: string
  updatedAt: string
}

interface State {
  sessions: ReviewSession[]
  createSession: (data: Omit<ReviewSession, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateSession: (id: string, updates: Partial<Pick<ReviewSession, 'messages' | 'docText'>>) => void
  deleteSession: (id: string) => void
}

export const useReviewSessionStore = create<State>()(
  persist(
    (set) => ({
      sessions: [],
      createSession: (data) => {
        const id =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
        const now = new Date().toISOString()
        set((s) => ({ sessions: [{ ...data, id, createdAt: now, updatedAt: now }, ...s.sessions] }))
        return id
      },
      updateSession: (id, updates) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id
              ? { ...sess, ...updates, updatedAt: new Date().toISOString() }
              : sess
          ),
        }))
      },
      deleteSession: (id) => {
        set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) }))
      },
    }),
    { name: 'bp-review-sessions' }
  )
)
