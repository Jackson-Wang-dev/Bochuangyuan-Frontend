import type { ID, ISODate, FileRef } from './shared'

export type DesensStatus = 'PendingDesens' | 'Generated' | 'OpenedToJudges'

// E18 — table: desensitization_records (prelim only)
export interface DesensitizationRecord {
  desensId: ID
  projectId: ID
  regId: ID
  stage: 'Prelim'
  sourceFiles: FileRef[]
  desensitizedFiles: FileRef[]
  maskedItems?: string[]
  status: DesensStatus
  generatedAt?: ISODate
}
