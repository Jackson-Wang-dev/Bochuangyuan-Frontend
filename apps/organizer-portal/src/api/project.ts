import { apiClient } from '@bochuangyuan/api'
import type { Registration } from '@bochuangyuan/types'

export async function fetchRegistrations(competitionId: string): Promise<Registration[]> {
  const { data } = await apiClient.get<Registration[]>(`/organizer/competitions/${competitionId}/registrations`)
  return data
}

export async function fetchRegistration(competitionId: string, regId: string): Promise<Registration> {
  const { data } = await apiClient.get<Registration>(`/organizer/competitions/${competitionId}/registrations/${regId}`)
  return data
}
