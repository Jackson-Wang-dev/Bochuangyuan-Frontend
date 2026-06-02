import { apiClient } from '@bochuangyuan/api'
import type { Competition } from '@bochuangyuan/types'

export async function fetchCompetitions(): Promise<Competition[]> {
  const { data } = await apiClient.get<Competition[]>('/organizer/competitions')
  return data
}

export async function fetchCompetition(id: string): Promise<Competition> {
  const { data } = await apiClient.get<Competition>(`/organizer/competitions/${id}`)
  return data
}

export async function createCompetition(payload: Partial<Competition>): Promise<Competition> {
  const { data } = await apiClient.post<Competition>('/organizer/competitions', payload)
  return data
}

export async function updateCompetition(id: string, payload: Partial<Competition>): Promise<Competition> {
  const { data } = await apiClient.put<Competition>(`/organizer/competitions/${id}`, payload)
  return data
}
