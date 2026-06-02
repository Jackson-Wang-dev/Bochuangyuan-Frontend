import { apiClient } from '@bochuangyuan/api'

export interface StaffMember {
  staffId: string
  name: string
  email: string
  role: 'admin' | 'reviewer' | 'viewer'
  joinedAt: string
}

export interface OperationLog {
  logId: string
  operatorId: string
  operatorName: string
  action: string
  targetType: string
  targetId: string
  detail: string
  createdAt: string
}

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
