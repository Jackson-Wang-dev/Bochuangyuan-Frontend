import type { FieldType, FieldOption, FormField, FormSchema, ReviewPhaseConfig, ReviewRuleSchema } from '@bochuangyuan/types'

export type BuilderMode = 'form' | 'review'

export interface FormBuilderProps {
  mode: BuilderMode
  initialSchema?: FormSchema | ReviewRuleSchema
  onChange?: (schema: FormSchema | ReviewRuleSchema) => void
  onSave?: (schema: FormSchema | ReviewRuleSchema) => Promise<void>
  readOnly?: boolean
  contestId?: string
}

export type { FieldType, FieldOption, FormField, FormSchema, ReviewPhaseConfig, ReviewRuleSchema }
