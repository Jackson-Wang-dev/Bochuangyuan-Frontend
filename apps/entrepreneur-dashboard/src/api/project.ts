import { apiClient } from '@bochuangyuan/api'
import type {
  IdType,
  TeamMember,
  Education,
  Work,
  MajorProject,
  Paper,
  Patent,
  ProjectStage,
  OrgHonor,
} from '../types/project'

// ─── Backend-specific applicant type (subset of frontend Applicant) ───────────

export interface ApiApplicant {
  name: string
  nameEn: string
  gender: '男' | '女' | '其他'
  birthDate: string
  birthPlace: string
  nationality: string
  idType: IdType
  idNumber: string
  phone: string
  email: string
  highestDegree: string
  highestDegreeInstitution: string
  highestDegreeMajor: string
  isFullTimeOnBoarded: boolean
  intendedPosition: string
  plannedArrivalDate: string
  laborContractStart: string
  laborContractEnd: string
  comeToNingboDate: string
  lastOrgBeforeComeToNingbo: string
  returnFromAbroadDate: string
  lastOrgBeforeReturnFromAbroad: string
  personalBrief: string
  achievementsSummary: string
  hasEntrepreneurExperience: boolean
  educations: Education[]
  works: Work[]
  majorProjects: MajorProject[]
  papers: Paper[]
  patents: Patent[]
}

// ─── Backend-specific orgInfo type (subset of frontend OrgInfo) ───────────────

export interface ApiOrgInfo {
  name: string
  orgType: string
  creditCode: string
  establishedDate: string
  registeredCapital: number
  totalEmployees: number
  address: string
  contactPerson: string
  contactPhone: string
  orgBrief: string
  honors: OrgHonor[]
}

// ─── Response Types ───────────────────────────────────────────────────────────

/** GET /api/v1/projects 列表摘要 */
export interface ApiProjectListItem {
  id: number
  status: string
  declarationName: string
  projectName: string
  projectBrief: string
  applicantName: string
  applicantPhone: string
  createdAt: string
  updatedAt: string
}

/** GET/POST/PUT /api/v1/projects/{id} 完整项目 */
export interface ApiProject {
  id: number
  status: string
  declarationName: string
  projectName: string
  coverImage: string | null
  professionalDomain: Record<string, unknown>
  coreTech: string
  projectBrief: string
  applicant: ApiApplicant
  teamMembers: TeamMember[]
  projectBackground: string
  projectContent: string
  projectStages: ProjectStage[]
  workBasis: string
  expectedContribution: string
  economicEfficiency: string
  totalInvestmentForecast: number
  alreadyInvestedByOrg: number
  govSupportReceived: number
  plannedInvestmentByOrg: number
  orgInfo: ApiOrgInfo
  verificationStatus: Record<string, string>
  commitmentChecked: boolean
  createdAt: string
  updatedAt: string
}

// ─── Request Types ────────────────────────────────────────────────────────────

export type CreateProjectDto = Partial<
  Omit<ApiProject, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'>
>

export interface UpdateProjectDto {
  projectName?: string
  projectBrief?: string
  status?: string
  applicant?: Partial<ApiApplicant>
  teamMembers?: TeamMember[]
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listProjects(): Promise<ApiProjectListItem[]> {
  const { data } = await apiClient.get<ApiProjectListItem[]>('/api/v1/projects')
  return data
}

export async function getProject(id: number): Promise<ApiProject> {
  const { data } = await apiClient.get<ApiProject>(`/api/v1/projects/${id}`)
  return data
}

export async function createProject(dto: CreateProjectDto): Promise<ApiProject> {
  const { data } = await apiClient.post<ApiProject>('/api/v1/projects', dto)
  return data
}

export async function updateProject(id: number, dto: UpdateProjectDto): Promise<ApiProject> {
  const { data } = await apiClient.put<ApiProject>(`/api/v1/projects/${id}`, dto)
  return data
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${id}`)
}
