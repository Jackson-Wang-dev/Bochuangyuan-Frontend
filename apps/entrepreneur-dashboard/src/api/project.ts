import { apiClient } from '@bochuangyuan/api'
import type { Project, ProjectVersion, ProjectContent } from '@bochuangyuan/types'

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>('/projects')
  return data
}

export async function fetchProject(projectId: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${projectId}`)
  return data
}

export async function createProject(name: string): Promise<Project> {
  const { data } = await apiClient.post<Project>('/projects', { name })
  return data
}

export async function saveVersion(
  projectId: string,
  content: ProjectContent,
): Promise<ProjectVersion> {
  const { data } = await apiClient.post<ProjectVersion>(`/projects/${projectId}/versions`, { content })
  return data
}

export async function submitVersion(
  projectId: string,
  versionId: string,
  competitionId: string,
): Promise<ProjectVersion> {
  const { data } = await apiClient.post<ProjectVersion>(
    `/projects/${projectId}/versions/${versionId}/submit`,
    { competitionId },
  )
  return data
}
