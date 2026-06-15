import type { PrefillSchema, PrefillTaskResponse } from '@/types/prefillTypes'

const BASE = import.meta.env.VITE_PREFILL_API_URL ?? 'http://localhost:8002'

/**
 * Upload a file and the current form schema.
 * Returns a task_id for polling.
 */
export async function createPrefillTask(
  file: File,
  schema: PrefillSchema,
): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('schema', JSON.stringify(schema))

  const res = await fetch(`${BASE}/api/prefill/tasks`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`预填任务创建失败：${res.status} ${text}`)
  }

  const data = (await res.json()) as { task_id: string }
  return data.task_id
}

/** Poll a prefill task until done/failed, or until timeout (default 120 s). */
export async function pollPrefillTask(
  taskId: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<PrefillTaskResponse> {
  const { intervalMs = 2000, timeoutMs = 120_000 } = opts
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/api/prefill/tasks/${taskId}`)
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`查询预填状态失败：${res.status} ${text}`)
    }

    const data = (await res.json()) as PrefillTaskResponse
    if (data.status === 'done' || data.status === 'failed') return data

    await new Promise((r) => setTimeout(r, intervalMs))
  }

  throw new Error('AI 预填超时，请稍后重试')
}
