import { apiClient } from '@bochuangyuan/api'
import type { ReviewTask, ScoreDraft } from '@bochuangyuan/types'

export async function fetchReviewQueue(): Promise<ReviewTask[]> {
  const { data } = await apiClient.get<ReviewTask[]>('/review/tasks')
  return data
}

export async function fetchTaskDetail(taskId: string): Promise<ReviewTask> {
  const { data } = await apiClient.get<ReviewTask>(`/review/tasks/${taskId}`)
  return data
}

export async function submitScore(taskId: string, draft: ScoreDraft): Promise<{ finalScore: number }> {
  const { data } = await apiClient.post(`/review/tasks/${taskId}/score`, draft)
  return data
}

export async function saveDraft(taskId: string, draft: Partial<ScoreDraft>): Promise<void> {
  await apiClient.put(`/review/tasks/${taskId}/draft`, draft)
}
