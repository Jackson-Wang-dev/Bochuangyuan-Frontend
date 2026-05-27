// TODO: API — replace localStorage mock with axios calls when backend is ready
// Real endpoints:
//   GET  /api/contests/:contestId/review-rules
//   POST /api/contests/:contestId/review-rules
//   PUT  /api/contests/:contestId/review-rules/:id

import type { ReviewRuleSchema } from '@bochuangyuan/types'

const STORAGE_KEY = 'bochuangyuan:review-rules'

function readAll(): ReviewRuleSchema[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeAll(schemas: ReviewRuleSchema[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas))
}

export const reviewRuleApi = {
  list: async (): Promise<ReviewRuleSchema[]> => readAll(),

  get: async (id: string): Promise<ReviewRuleSchema | null> =>
    readAll().find((s) => s.id === id) ?? null,

  getByContest: async (contestId: string): Promise<ReviewRuleSchema | null> =>
    readAll().find((s) => s.contestId === contestId) ?? null,

  save: async (schema: ReviewRuleSchema): Promise<ReviewRuleSchema> => {
    const all = readAll()
    const idx = all.findIndex((s) => s.id === schema.id)
    const next: ReviewRuleSchema = {
      ...schema,
      updatedAt: new Date().toISOString(),
      _syncStatus: 'local',
    }
    if (idx >= 0) all[idx] = next
    else all.push(next)
    writeAll(all)
    return next
  },

  remove: async (id: string): Promise<void> => {
    writeAll(readAll().filter((s) => s.id !== id))
  },
}
