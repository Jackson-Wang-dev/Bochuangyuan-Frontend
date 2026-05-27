// TODO: API — replace localStorage mock with axios calls when backend is ready
// Real endpoints:
//   GET  /api/review-tasks?expertId=&phase=&status=
//   GET  /api/review-tasks/:id
//   PUT  /api/review-tasks/:id          — save draft
//   POST /api/review-tasks/:id/submit   — final submit (backend locks)

import type { ExpertTask } from '@bochuangyuan/types'

const STORAGE_KEY = 'bochuangyuan:review-tasks'

function readAll(): ExpertTask[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeAll(tasks: ExpertTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export const reviewTaskApi = {
  list: async (filters?: {
    expertId?: string
    phase?: ExpertTask['phase']
    status?: ExpertTask['status']
  }): Promise<ExpertTask[]> => {
    let tasks = readAll()
    if (filters?.expertId) tasks = tasks.filter((t) => t.expertId === filters.expertId)
    if (filters?.phase) tasks = tasks.filter((t) => t.phase === filters.phase)
    if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status)
    return tasks
  },

  get: async (id: string): Promise<ExpertTask | null> =>
    readAll().find((t) => t.id === id) ?? null,

  saveDraft: async (id: string, patch: Partial<ExpertTask>): Promise<ExpertTask> => {
    const all = readAll()
    const idx = all.findIndex((t) => t.id === id)
    const current = all[idx]
    if (idx < 0 || !current) throw new Error(`Task ${id} not found`)
    const updated: ExpertTask = { ...current, ...patch, status: 'in_progress' }
    all[idx] = updated
    writeAll(all)
    return updated
  },

  submit: async (id: string, patch: Partial<ExpertTask>): Promise<ExpertTask> => {
    const all = readAll()
    const idx = all.findIndex((t) => t.id === id)
    const current = all[idx]
    if (idx < 0 || !current) throw new Error(`Task ${id} not found`)
    // TODO: POST /api/review-tasks/:id/submit — backend locks the record
    const updated: ExpertTask = {
      ...current,
      ...patch,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    }
    all[idx] = updated
    writeAll(all)
    return updated
  },

  seedMockData: (tasks: ExpertTask[]): void => {
    const existing = readAll()
    const existingIds = new Set(existing.map((t) => t.id))
    const incoming = tasks.filter((t) => !existingIds.has(t.id))
    if (incoming.length > 0) writeAll([...existing, ...incoming])
  },
}
