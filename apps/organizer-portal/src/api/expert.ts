import { apiClient } from '@bochuangyuan/api'
import type { Judge, JudgeAssignment } from '@bochuangyuan/types'

export async function fetchPlatformJudges(domain?: string): Promise<Judge[]> {
  const { data } = await apiClient.get<Judge[]>('/organizer/judges', { params: { domain } })
  return data
}

export async function addManualJudge(competitionId: string, judge: Partial<Judge>): Promise<Judge> {
  const { data } = await apiClient.post<Judge>(`/organizer/competitions/${competitionId}/judges`, judge)
  return data
}

export async function fetchAssignments(competitionId: string): Promise<JudgeAssignment[]> {
  const { data } = await apiClient.get<JudgeAssignment[]>(`/organizer/competitions/${competitionId}/assignments`)
  return data
}

export async function saveAssignments(competitionId: string, assignments: JudgeAssignment[]): Promise<void> {
  await apiClient.post(`/organizer/competitions/${competitionId}/assignments`, { assignments })
}
