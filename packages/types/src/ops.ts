import type { ID, ISODate, FileRef } from './shared'

// E15 — table: notifications
export interface CompetitionNotification {
  noticeId: ID
  competitionId: ID
  title: string
  content: string
  file?: FileRef
  creator: string
  createdAt: ISODate
  channels?: ('InApp' | 'SMS')[]
}

// E16 — table: albums
export interface Album {
  albumId: ID
  competitionId: ID
  images?: FileRef[]
}

// E17 — table: schedules
export interface CompetitionSchedule {
  scheduleId: ID
  competitionId: ID
  group?: string
  time?: ISODate
  track?: string
  venue?: string
  headers?: Record<string, string>
}
