import { apiClient } from '@bochuangyuan/api'
import type { ScoreDimension } from '@bochuangyuan/types'

interface AiScoreSuggestion {
  dimensions: Omit<ScoreDimension, 'weight'>[]
  summary: string
  confidence: number
}

export async function getAiScoreSuggestion(taskId: string): Promise<AiScoreSuggestion> {
  const { data } = await apiClient.post<AiScoreSuggestion>('/ai/score-suggestion', { taskId })
  return data
}
