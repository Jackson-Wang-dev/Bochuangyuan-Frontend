import { create } from 'zustand'
import {
  MOCK_PROJECTS,
  MOCK_REGISTRATIONS,
  MOCK_COMPETITIONS,
  MOCK_PROJECTS_V3,
  type ProjectV2,
  type RegistrationInstance,
  type CompetitionTemplate,
  type GrowthSnapshot,
  type FieldChange,
} from '@/mock/projectMock'
import type { Project, FieldChange as FieldChangeV3, RegistrationRecord, VerifiableField, VerificationStatusValue } from '@/types/project'
import { deriveProjectSnapshot } from '@/utils/projectMetrics'

// ── Legacy interface (Phase 3–5 will migrate pages away from ProjectV2) ────────

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

  // ── V3 Project state (new type, used by Phase 3+ pages) ──────────────────
  projectsV3: Project[]
  addProjectV3: (p: Project) => void
  updateProjectV3: (id: string, patch: Partial<Project>) => void
  recordEditV3: (
    projectId: string,
    description: string,
    changes: FieldChangeV3[],
  ) => void
  addRegistrationV3: (projectId: string, reg: RegistrationRecord) => void
  updateRegistrationV3: (projectId: string, regId: string, patch: Partial<RegistrationRecord>) => void
  recordRollbackV3: (projectId: string, description: string) => void
  updateVerificationV3: (projectId: string, field: VerifiableField, status: VerificationStatusValue) => void
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

  // ── V3 actions ──────────────────────────────────────────────────────────────

  projectsV3: MOCK_PROJECTS_V3,

  addProjectV3: (p) =>
    set((state) => ({ projectsV3: [...state.projectsV3, p] })),

  updateProjectV3: (id, patch) =>
    set((state) => ({
      projectsV3: state.projectsV3.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
      ),
    })),

  addRegistrationV3: (projectId, reg) =>
    set((state) => {
      const project = state.projectsV3.find((p) => p.id === projectId)
      const memberCount = project ? project.teamMembers.length + 1 : reg.memberCount
      return {
        projectsV3: state.projectsV3.map((p) =>
          p.id === projectId
            ? {
                ...p,
                registrations: [...p.registrations, { ...reg, memberCount }],
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      }
    }),

  updateRegistrationV3: (projectId, regId, patch) =>
    set((state) => ({
      projectsV3: state.projectsV3.map((p) =>
        p.id === projectId
          ? {
              ...p,
              registrations: p.registrations.map((r) =>
                r.id === regId ? { ...r, ...patch } : r,
              ),
            }
          : p,
      ),
    })),

  recordRollbackV3: (projectId, description) =>
    set((state) => {
      const now = new Date().toISOString()
      const snapshotId = `snap-${Date.now()}`
      const project = state.projectsV3.find((p) => p.id === projectId)
      if (!project) return {}
      const snapshot = deriveProjectSnapshot(project, snapshotId, now)
      const event = {
        id: `ev-${Date.now()}`,
        type: '回退' as const,
        timestamp: now,
        description,
        changes: [],
        snapshotId,
      }
      return {
        projectsV3: state.projectsV3.map((p) =>
          p.id === projectId
            ? {
                ...p,
                events: [...p.events, event],
                snapshots: { ...p.snapshots, [snapshotId]: snapshot },
                updatedAt: now,
              }
            : p,
        ),
      }
    }),

  updateVerificationV3: (projectId, field, status) =>
    set((state) => ({
      projectsV3: state.projectsV3.map((p) =>
        p.id === projectId
          ? {
              ...p,
              verificationStatus: { ...p.verificationStatus, [field]: status },
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    })),

  recordEditV3: (projectId, description, changes) =>
    set((state) => {
      const now = new Date().toISOString()
      const snapshotId = `snap-${Date.now()}`
      const project = state.projectsV3.find((p) => p.id === projectId)
      if (!project) return {}
      const snapshot = deriveProjectSnapshot(project, snapshotId, now)
      const event = {
        id: `ev-${Date.now()}`,
        type: '维护编辑' as const,
        timestamp: now,
        description,
        changes,
        snapshotId,
      }
      return {
        projectsV3: state.projectsV3.map((p) =>
          p.id === projectId
            ? {
                ...p,
                events: [...p.events, event],
                snapshots: { ...p.snapshots, [snapshotId]: snapshot },
                updatedAt: now,
              }
            : p,
        ),
      }
    }),
}))
