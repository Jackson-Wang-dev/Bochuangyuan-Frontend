export interface EnterpriseBasicInfo {
  enterpriseId: string
  name: string
  registrationNo: string
  legalPerson: string
  registeredCapital?: string
  address?: string
  industry?: string
  foundedAt?: string
}

export interface Honor {
  honorId: string
  title: string
  level: string
  issuedBy: string
  issuedAt: string
  certificateFileId?: string
}

export interface IntellectualProperty {
  ipId: string
  type: 'patent' | 'software_copyright' | 'trademark' | 'other'
  title: string
  applicationNo: string
  status: 'pending' | 'granted' | 'rejected'
  grantedAt?: string
  fileId?: string
}

export interface Product {
  productId: string
  name: string
  description: string
  stage: 'concept' | 'prototype' | 'mvp' | 'growth' | 'mature'
}

export interface TeamMember {
  memberId: string
  name: string
  role: string
  bio?: string
  avatarFileId?: string
}

export interface EnterpriseProfile {
  basicInfo: EnterpriseBasicInfo
  honors: Honor[]
  ipList: IntellectualProperty[]
  products: Product[]
  team: TeamMember[]
}
