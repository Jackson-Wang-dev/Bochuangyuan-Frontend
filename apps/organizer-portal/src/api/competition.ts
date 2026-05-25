import { apiClient } from '@bochuangyuan/api'
import type { OrganizerCompetition, ScoreDimensionConfig } from '@bochuangyuan/types'

export async function fetchCompetitions(): Promise<OrganizerCompetition[]> {
  const { data } = await apiClient.get<OrganizerCompetition[]>('/organizer/competitions')
  return data
}

export async function fetchCompetition(id: string): Promise<OrganizerCompetition> {
  const { data } = await apiClient.get<OrganizerCompetition>(`/organizer/competitions/${id}`)
  return data
}

export async function createCompetition(payload: Partial<OrganizerCompetition>): Promise<OrganizerCompetition> {
  const { data } = await apiClient.post<OrganizerCompetition>('/organizer/competitions', payload)
  return data
}

export async function updateCompetition(id: string, payload: Partial<OrganizerCompetition>): Promise<OrganizerCompetition> {
  const { data } = await apiClient.put<OrganizerCompetition>(`/organizer/competitions/${id}`, payload)
  return data
}

export async function saveDimensions(id: string, dims: ScoreDimensionConfig[]): Promise<void> {
  await apiClient.put(`/organizer/competitions/${id}/dimensions`, { dimensions: dims })
}
