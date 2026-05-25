import { apiClient } from '@bochuangyuan/api'
import type { Competition, CompetitionApplication } from '@bochuangyuan/types'

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
): Promise<CompetitionApplication> {
  const { data } = await apiClient.post<CompetitionApplication>('/competition-applications', {
    competitionId,
    projectVersionId,
  })
  return data
}

export async function fetchMyApplications(): Promise<CompetitionApplication[]> {
  const { data } = await apiClient.get<CompetitionApplication[]>('/competition-applications/mine')
  return data
}
