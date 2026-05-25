import { apiClient } from '@bochuangyuan/api'
import type { EnterpriseProfile, EnterpriseBasicInfo, Honor, IntellectualProperty, Product, TeamMember } from '@bochuangyuan/types'

export async function fetchEnterpriseProfile(): Promise<EnterpriseProfile> {
  const { data } = await apiClient.get<EnterpriseProfile>('/enterprise/profile')
  return data
}

export async function updateBasicInfo(info: Partial<EnterpriseBasicInfo>): Promise<EnterpriseBasicInfo> {
  const { data } = await apiClient.patch<EnterpriseBasicInfo>('/enterprise/basic-info', info)
  return data
}

export async function addHonor(honor: Omit<Honor, 'honorId'>): Promise<Honor> {
  const { data } = await apiClient.post<Honor>('/enterprise/honors', honor)
  return data
}

export async function deleteHonor(honorId: string): Promise<void> {
  await apiClient.delete(`/enterprise/honors/${honorId}`)
}

export async function addIp(ip: Omit<IntellectualProperty, 'ipId'>): Promise<IntellectualProperty> {
  const { data } = await apiClient.post<IntellectualProperty>('/enterprise/ip', ip)
  return data
}

export async function addProduct(product: Omit<Product, 'productId'>): Promise<Product> {
  const { data } = await apiClient.post<Product>('/enterprise/products', product)
  return data
}

export async function addTeamMember(member: Omit<TeamMember, 'memberId'>): Promise<TeamMember> {
  const { data } = await apiClient.post<TeamMember>('/enterprise/team', member)
  return data
}

export async function removeTeamMember(memberId: string): Promise<void> {
  await apiClient.delete(`/enterprise/team/${memberId}`)
}
