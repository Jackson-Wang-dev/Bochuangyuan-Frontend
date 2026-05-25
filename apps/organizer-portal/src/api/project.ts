import { apiClient } from '@bochuangyuan/api'
import type { EnrollmentRecord } from '@bochuangyuan/types'

export async function fetchEnrollments(competitionId: string): Promise<EnrollmentRecord[]> {
  const { data } = await apiClient.get<EnrollmentRecord[]>(`/organizer/competitions/${competitionId}/enrollments`)
  return data
}

export async function fetchEnrollment(competitionId: string, enrollId: string): Promise<EnrollmentRecord> {
  const { data } = await apiClient.get<EnrollmentRecord>(`/organizer/competitions/${competitionId}/enrollments/${enrollId}`)
  return data
}
