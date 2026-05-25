import { apiClient } from '@bochuangyuan/api'
import type { AiAssessmentResult, AiVersionDiff } from '@bochuangyuan/types'

export async function startAssessment(userId: string): Promise<AiAssessmentResult> {
  const { data } = await apiClient.post<AiAssessmentResult>('/ai/assessment', { userId })
  return data
}

export async function fetchAssessmentResult(assessmentId: string): Promise<AiAssessmentResult> {
  const { data } = await apiClient.get<AiAssessmentResult>(`/ai/assessment/${assessmentId}`)
  return data
}

export async function compareVersions(
  versionAId: string,
  versionBId: string,
): Promise<AiVersionDiff> {
  const { data } = await apiClient.post<AiVersionDiff>('/ai/version-diff', { versionAId, versionBId })
  return data
}

export async function generateProjectSuggestions(projectId: string): Promise<string[]> {
  const { data } = await apiClient.post<{ suggestions: string[] }>('/ai/project-suggestions', { projectId })
  return data.suggestions
}

export async function chatWithAssistant(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<string> {
  const { data } = await apiClient.post<{ reply: string }>('/ai/chat', { messages })
  return data.reply
}
