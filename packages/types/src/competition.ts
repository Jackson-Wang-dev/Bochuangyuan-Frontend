export interface Competition {
  competitionId: string
  title: string
  organizer: string
  description: string
  deadline: string
  status: 'open' | 'closed' | 'reviewing' | 'finished'
  tags: string[]
  coverUrl?: string
  createdAt: string
}

export interface CompetitionApplication {
  applicationId: string
  competitionId: string
  projectVersionId: string
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  submittedAt: string
}
