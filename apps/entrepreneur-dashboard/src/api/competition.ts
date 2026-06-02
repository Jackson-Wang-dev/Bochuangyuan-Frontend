import { apiClient } from '@bochuangyuan/api'
import type { Competition, Registration } from '@bochuangyuan/types'

export async function fetchCompetitions(): Promise<Competition[]> {
  const { data } = await apiClient.get<Competition[]>('/competitions')
  return data
}

export async function fetchCompetition(competitionId: string): Promise<Competition> {
  const { data } = await apiClient.get<Competition>(`/competitions/${competitionId}`)
  return data
}

export async function applyCompetition(
  competitionId: string,
  projectVersionId: string,
): Promise<Registration> {
  const { data } = await apiClient.post<Registration>('/registrations', {
    competitionId,
    projectVersionId,
  })
  return data
}

export async function fetchMyApplications(): Promise<Registration[]> {
  const { data } = await apiClient.get<Registration[]>('/registrations/mine')
  return data
}
