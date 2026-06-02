import type { FileRef, ISODate } from './shared'

export interface ProjectContent {
  title: string
  summary: string
  problem: string
  solution: string
  market: string
  team: string
  finance: string
  attachments?: string[]
}

export interface ProjectVersion {
  versionId: string
  projectId: string
  status: 'draft' | 'submitted' | 'locked'
  content: ProjectContent
  submittedTo?: string
  wordCount?: number
  aiAnalysis?: string
  createdAt: string
  updatedAt: string
}

// E04 — table: projects
export interface Project {
  projectId: string
  name: string
  ownerId: string
  // E04 spec fields
  oneLiner?: string
  track?: string
  description?: string
  bpFile?: FileRef
  attachments?: FileRef[]
  // Existing versioning fields
  currentVersionId?: string
  versions?: ProjectVersion[]
  createdAt: ISODate
  updatedAt?: string
}
