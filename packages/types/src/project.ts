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

export interface Project {
  projectId: string
  name: string
  ownerId: string
  currentVersionId: string
  versions: ProjectVersion[]
  createdAt: string
  updatedAt: string
}
