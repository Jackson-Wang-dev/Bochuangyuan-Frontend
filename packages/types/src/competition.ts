import type { ID, ISODate, FileRef } from './shared'

export type CompetitionStatus = 'Draft' | 'Unpublished' | 'Registering' | 'Ongoing' | 'Ended'
export type CompetitionTag = 'Registering' | 'Ongoing' | 'NotStarted' | 'Unpublished' | 'Ended'
export type SignUpType = 'Individual' | 'Team' | 'Both'

export interface Track {
  id: ID
  name: string
}

export interface Sponsor {
  id: ID
  name: string
  logo?: FileRef
}

export interface PhaseNode {
  phase: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7'
  startAt?: ISODate
  endAt?: ISODate
  enabled?: boolean
}

// E01 — table: competitions
export interface Competition {
  competitionId: ID
  name: string
  hostId: ID
  coverImage?: FileRef
  summary?: string
  intro?: string
  location?: string
  signUpStart: ISODate
  signUpEnd: ISODate
  matchStart?: ISODate
  matchEnd?: ISODate
  status: CompetitionStatus
  tags?: CompetitionTag[]
  tracks?: Track[]
  signUpType: SignUpType
  signupCountIndiv?: number
  signupCountTeam?: number
  greenChannelEnabled?: boolean
  nodeConfig?: PhaseNode[]
  sponsors?: Sponsor[]
  smsConfig?: Record<string, unknown>
  isDeleted?: boolean
}
