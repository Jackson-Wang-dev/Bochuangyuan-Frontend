import { create } from 'zustand'
import {
  MOCK_PROJECTS,
  MOCK_REGISTRATIONS,
  MOCK_COMPETITIONS,
  type ProjectV2,
  type RegistrationInstance,
  type CompetitionTemplate,
  type GrowthSnapshot,
  type FieldChange,
} from '@/mock/projectMock'

interface ProjectDashboardState {
  projects: ProjectV2[]
  registrations: RegistrationInstance[]
  competitions: CompetitionTemplate[]

  addProject: (p: ProjectV2) => void
  updateProject: (id: string, patch: Partial<ProjectV2>) => void
  addRegistration: (r: RegistrationInstance) => void

  // Record a "维护编辑" event and update growth fields
  recordEdit: (projectId: string, description: string, changes: FieldChange[], snapshot: GrowthSnapshot) => void
  // Record a "报名" event
  recordApply: (projectId: string, registrationId: string, competitionName: string, snapshot: GrowthSnapshot) => void
}

export const useProjectDashboardStore = create<ProjectDashboardState>()((set) => ({
  projects: MOCK_PROJECTS,
  registrations: MOCK_REGISTRATIONS,
  competitions: MOCK_COMPETITIONS,

  addProject: (p) =>
    set((state) => ({ projects: [...state.projects, p] })),

  updateProject: (id, patch) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
    })),

  addRegistration: (r) =>
    set((state) => ({ registrations: [...state.registrations, r] })),

  recordEdit: (projectId, description, changes, snapshot) =>
    set((state) => {
      const now = new Date().toISOString()
      const event = {
        id: `ev-${Date.now()}`,
        type: '维护编辑' as const,
        timestamp: now,
        description,
        changes,
        snapshot,
      }
      return {
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, events: [...p.events, event], updatedAt: now }
            : p,
        ),
      }
    }),

  recordApply: (projectId, registrationId, competitionName, snapshot) =>
    set((state) => {
      const now = new Date().toISOString()
      const event = {
        id: `ev-${Date.now()}`,
        type: '报名' as const,
        timestamp: now,
        description: `报名${competitionName}`,
        registrationId,
        snapshot,
      }
      return {
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, events: [...p.events, event], updatedAt: now }
            : p,
        ),
      }
    }),
}))
