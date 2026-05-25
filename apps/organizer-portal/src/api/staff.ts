import { apiClient } from '@bochuangyuan/api'
import type { StaffMember, OperationLog } from '@bochuangyuan/types'

export async function fetchStaff(): Promise<StaffMember[]> {
  const { data } = await apiClient.get<StaffMember[]>('/organizer/staff')
  return data
}

export async function addStaff(payload: Partial<StaffMember>): Promise<StaffMember> {
  const { data } = await apiClient.post<StaffMember>('/organizer/staff', payload)
  return data
}

export async function removeStaff(staffId: string): Promise<void> {
  await apiClient.delete(`/organizer/staff/${staffId}`)
}

export async function fetchLogs(): Promise<OperationLog[]> {
  const { data } = await apiClient.get<OperationLog[]>('/organizer/logs')
  return data
}
