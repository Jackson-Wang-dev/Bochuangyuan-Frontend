import type { PrefillSchema, PrefillTaskResponse } from '@/types/prefillTypes'

// Empty string = relative URL, proxied by Vite to localhost:8002.
// Set VITE_PREFILL_API_URL only if the prefill service is on a different host.
const BASE = import.meta.env.VITE_PREFILL_API_URL ?? ''

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

/** Poll a prefill task until done/failed, or until timeout (default 180 s). */
export async function pollPrefillTask(
  taskId: string,
  opts: {
    intervalMs?: number
    timeoutMs?: number
    onProgress?: (progress: number, stage: string) => void
  } = {},
): Promise<PrefillTaskResponse> {
  const { intervalMs = 1500, timeoutMs = 180_000, onProgress } = opts
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/api/prefill/tasks/${taskId}`)
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      throw new Error(`查询预填状态失败：${res.status} ${text}`)
    }

    const data = (await res.json()) as PrefillTaskResponse
    if (onProgress && data.progress !== undefined) {
      onProgress(data.progress, data.stage ?? '')
    }
    if (data.status === 'done' || data.status === 'failed') return data

    await new Promise((r) => setTimeout(r, intervalMs))
  }

  throw new Error('AI 预填超时，请稍后重试')
}
