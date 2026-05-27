import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  FormField,
  FormSchema,
  FieldType,
  ReviewDimension,
  ReviewPhaseConfig,
  ReviewRuleSchema,
} from '@bochuangyuan/types'
import type { BuilderMode } from './types'

interface FormBuilderState {
  mode: BuilderMode
  // form mode
  fields: FormField[]
  formName: string
  formDescription: string
  // review mode
  phases: ReviewPhaseConfig[]
  // shared
  selectedFieldId: string | null
  selectedPhase: ReviewPhaseConfig['phase'] | null
  isDirty: boolean
  isSaving: boolean

  // form actions
  addField: (type: FieldType, afterId?: string) => void
  removeField: (id: string) => void
  updateField: (id: string, patch: Partial<FormField>) => void
  reorderFields: (fromIndex: number, toIndex: number) => void
  duplicateField: (id: string) => void
  selectField: (id: string | null) => void
  setFormMeta: (name: string, description: string) => void

  // review actions
  addDimension: (phase: ReviewPhaseConfig['phase']) => void
  updateDimension: (phase: ReviewPhaseConfig['phase'], dimId: string, patch: Partial<ReviewDimension>) => void
  removeDimension: (phase: ReviewPhaseConfig['phase'], dimId: string) => void
  reorderDimensions: (phase: ReviewPhaseConfig['phase'], fromIndex: number, toIndex: number) => void
  autoBalanceWeights: (phase: ReviewPhaseConfig['phase']) => void
  updatePhaseConfig: (phase: ReviewPhaseConfig['phase'], patch: Partial<Omit<ReviewPhaseConfig, 'phase' | 'dimensions'>>) => void
  selectPhase: (phase: ReviewPhaseConfig['phase'] | null) => void

  // persistence
  loadSchema: (schema: FormSchema | ReviewRuleSchema, mode: BuilderMode) => void
  exportSchema: () => FormSchema | ReviewRuleSchema
  resetDirty: () => void
}

function isFormSchema(s: FormSchema | ReviewRuleSchema): s is FormSchema {
  return 'fields' in s
}

function defaultField(type: FieldType): FormField {
  const base: FormField = {
    id: nanoid(),
    type,
    label: defaultLabel(type),
    required: false,
  }
  if (type === 'select' || type === 'radio' || type === 'checkbox') {
    base.options = [
      { label: '选项一', value: 'option_1' },
      { label: '选项二', value: 'option_2' },
    ]
  }
  return base
}

function defaultLabel(type: FieldType): string {
  const map: Record<FieldType, string> = {
    text: '单行文本',
    textarea: '多行文本',
    number: '数字',
    date: '日期',
    select: '下拉选择',
    radio: '单选',
    checkbox: '多选',
  }
  return map[type]
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  mode: 'form',
  fields: [],
  formName: '未命名表单',
  formDescription: '',
  phases: [],
  selectedFieldId: null,
  selectedPhase: null,
  isDirty: false,
  isSaving: false,

  addField: (type, afterId) => {
    const field = defaultField(type)
    set((state) => {
      const fields = [...state.fields]
      if (afterId) {
        const idx = fields.findIndex((f) => f.id === afterId)
        fields.splice(idx + 1, 0, field)
      } else {
        fields.push(field)
      }
      return { fields, selectedFieldId: field.id, isDirty: true }
    })
  },

  removeField: (id) => {
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      isDirty: true,
    }))
  },

  updateField: (id, patch) => {
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      isDirty: true,
    }))
  },

  reorderFields: (fromIndex, toIndex) => {
    set((state) => {
      const fields = [...state.fields]
      const item = fields[fromIndex]
      if (!item) return state
      fields.splice(fromIndex, 1)
      fields.splice(toIndex, 0, item)
      return { fields, isDirty: true }
    })
  },

  duplicateField: (id) => {
    set((state) => {
      const idx = state.fields.findIndex((f) => f.id === id)
      const source = state.fields[idx]
      if (idx < 0 || !source) return state
      const copy: FormField = { ...source, id: nanoid() }
      const fields = [...state.fields]
      fields.splice(idx + 1, 0, copy)
      return { fields, selectedFieldId: copy.id, isDirty: true }
    })
  },

  selectField: (id) => set({ selectedFieldId: id }),

  setFormMeta: (name, description) => set({ formName: name, formDescription: description, isDirty: true }),

  addDimension: (phase) => {
    const dim: ReviewDimension = {
      id: nanoid(),
      label: '新维度',
      weight: 0,
      maxScore: 10,
    }
    set((state) => ({
      phases: state.phases.map((p) =>
        p.phase === phase ? { ...p, dimensions: [...p.dimensions, dim] } : p,
      ),
      isDirty: true,
    }))
  },

  updateDimension: (phase, dimId, patch) => {
    set((state) => ({
      phases: state.phases.map((p) =>
        p.phase === phase
          ? { ...p, dimensions: p.dimensions.map((d) => (d.id === dimId ? { ...d, ...patch } : d)) }
          : p,
      ),
      isDirty: true,
    }))
  },

  removeDimension: (phase, dimId) => {
    set((state) => ({
      phases: state.phases.map((p) =>
        p.phase === phase
          ? { ...p, dimensions: p.dimensions.filter((d) => d.id !== dimId) }
          : p,
      ),
      isDirty: true,
    }))
  },

  reorderDimensions: (phase, fromIndex, toIndex) => {
    set((state) => ({
      phases: state.phases.map((p) => {
        if (p.phase !== phase) return p
        const dims = [...p.dimensions]
        const item = dims[fromIndex]
        if (!item) return p
        dims.splice(fromIndex, 1)
        dims.splice(toIndex, 0, item)
        return { ...p, dimensions: dims }
      }),
      isDirty: true,
    }))
  },

  autoBalanceWeights: (phase) => {
    set((state) => ({
      phases: state.phases.map((p) => {
        if (p.phase !== phase) return p
        const count = p.dimensions.length
        if (count === 0) return p
        const base = Math.floor(100 / count)
        const remainder = 100 - base * count
        return {
          ...p,
          dimensions: p.dimensions.map((d, i) => ({
            ...d,
            weight: i === 0 ? base + remainder : base,
          })),
        }
      }),
      isDirty: true,
    }))
  },

  updatePhaseConfig: (phase, patch) => {
    set((state) => ({
      phases: state.phases.map((p) => (p.phase === phase ? { ...p, ...patch } : p)),
      isDirty: true,
    }))
  },

  selectPhase: (phase) => set({ selectedPhase: phase }),

  loadSchema: (schema, mode) => {
    if (mode === 'form' && isFormSchema(schema)) {
      set({
        mode,
        fields: schema.fields,
        formName: schema.name,
        formDescription: schema.description ?? '',
        selectedFieldId: null,
        isDirty: false,
      })
    } else if (mode === 'review' && !isFormSchema(schema)) {
      set({
        mode,
        phases: (schema as ReviewRuleSchema).phases,
        selectedFieldId: null,
        selectedPhase: null,
        isDirty: false,
      })
    }
  },

  exportSchema: () => {
    const state = get()
    const now = new Date().toISOString()
    if (state.mode === 'form') {
      const schema: FormSchema = {
        id: nanoid(),
        name: state.formName,
        description: state.formDescription || undefined,
        fields: state.fields,
        createdAt: now,
        updatedAt: now,
      }
      return schema
    } else {
      const schema: ReviewRuleSchema = {
        id: nanoid(),
        name: '评审规则',
        phases: state.phases,
        createdAt: now,
        updatedAt: now,
      }
      return schema
    }
  },

  resetDirty: () => set({ isDirty: false }),
}))
