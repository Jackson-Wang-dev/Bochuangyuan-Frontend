export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'

export interface FieldOption {
  label: string
  value: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  description?: string
  options?: FieldOption[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  _backendKey?: string
  _backendValidation?: unknown
}

export interface FormSchema {
  id: string
  name: string
  description?: string
  fields: FormField[]
  createdAt: string
  updatedAt: string
  contestId?: string
  version?: number
  _syncStatus?: 'local' | 'synced' | 'conflict'
}
