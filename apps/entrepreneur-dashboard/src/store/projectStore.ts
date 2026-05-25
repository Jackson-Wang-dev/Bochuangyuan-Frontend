import { create } from 'zustand'
import type { Project, ProjectVersion } from '@bochuangyuan/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addVersion: (projectId: string, version: ProjectVersion) => void
  lockVersion: (projectId: string, versionId: string, competitionId: string) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addVersion: (projectId, version) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.projectId === projectId
          ? { ...p, versions: [...p.versions, version] }
          : p,
      ),
    })),
  lockVersion: (projectId, versionId, competitionId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.projectId === projectId
          ? {
              ...p,
              versions: p.versions.map((v) =>
                v.versionId === versionId
                  ? { ...v, status: 'locked' as const, submittedTo: competitionId }
                  : v,
              ),
            }
          : p,
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
