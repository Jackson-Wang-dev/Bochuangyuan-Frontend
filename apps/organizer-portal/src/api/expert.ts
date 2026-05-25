import { apiClient } from '@bochuangyuan/api'
import type { Expert, ReviewAssignment } from '@bochuangyuan/types'

export async function fetchPlatformExperts(domain?: string): Promise<Expert[]> {
  const { data } = await apiClient.get<Expert[]>('/organizer/experts', { params: { domain } })
  return data
}

export async function addManualExpert(competitionId: string, expert: Partial<Expert>): Promise<Expert> {
  const { data } = await apiClient.post<Expert>(`/organizer/competitions/${competitionId}/experts`, expert)
  return data
}

export async function fetchAssignments(competitionId: string): Promise<ReviewAssignment[]> {
  const { data } = await apiClient.get<ReviewAssignment[]>(`/organizer/competitions/${competitionId}/assignments`)
  return data
}

export async function saveAssignments(competitionId: string, assignments: ReviewAssignment[]): Promise<void> {
  await apiClient.post(`/organizer/competitions/${competitionId}/assignments`, { assignments })
}
