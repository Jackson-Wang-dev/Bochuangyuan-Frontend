import type { ID } from './shared'

export interface FormFieldDef {
  key: string
  label: string
  type: string
  required: boolean
  options?: string[]
}

export interface ReviewFieldDef {
  key: string
  label: string
  max: number
  weight?: number
}

// E02 — table: reg_form_configs
export interface RegistrationFormConfig {
  formId: ID
  competitionId: ID
  formFields: FormFieldDef[]
  reviewFields: ReviewFieldDef[]
  limitConditions?: Record<string, unknown>
  requireExistingProject?: boolean
}
