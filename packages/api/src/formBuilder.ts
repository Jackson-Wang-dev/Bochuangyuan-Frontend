// TODO: API — replace localStorage mock with axios calls when backend is ready
// Real endpoints:
//   GET    /api/contests/:contestId/form-schema
//   POST   /api/contests/:contestId/form-schema
//   PUT    /api/contests/:contestId/form-schema/:id
//   DELETE /api/contests/:contestId/form-schema/:id

import type { FormSchema } from '@bochuangyuan/types'

const STORAGE_KEY = 'bochuangyuan:form-schemas'

function readAll(): FormSchema[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeAll(schemas: FormSchema[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas))
}

export const formBuilderApi = {
  list: async (): Promise<FormSchema[]> => readAll(),

  get: async (id: string): Promise<FormSchema | null> =>
    readAll().find((s) => s.id === id) ?? null,

  save: async (schema: FormSchema): Promise<FormSchema> => {
    const all = readAll()
    const idx = all.findIndex((s) => s.id === schema.id)
    const next: FormSchema = {
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
