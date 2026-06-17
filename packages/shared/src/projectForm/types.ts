// Types shared between entrepreneur-dashboard (form rendering / AI prefill)
// and specialist-window (review volume display).

// ── Form rendering types (entrepreneur-dashboard) ────────────────────────────

/** Input widget types used in the project registration form */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'    // YYYY-MM-DD
  | 'month'   // YYYY-MM
  | 'select'
  | 'boolean'
  | 'phone'

export interface FieldSchema {
  key: string
  label: string
  type: FieldType
  required: boolean
  options?: string[]
  maxLength?: number
  max?: number
  min?: number
  placeholder?: string
  hint?: string
  needsVerification?: boolean
  showInTable?: boolean
  readonly?: boolean
  nullable?: boolean
  nullLabel?: string
  hidden?: boolean
  defaultValue?: unknown
  description?: string
  unit?: string
}

export interface CollectionSchema {
  collectionKey: string
  label: string
  aggregateLabel: string
  maxItems?: number
  minItems?: number
  fields: FieldSchema[]
  summaryField?: string
}

// ── Cross-app field definition type ─────────────────────────────────────────

/** Scalar / structured value types used in AI prefill schema and specialist display */
export type ProjectFieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'array'
  | 'object'

/**
 * A single project form field definition.
 * Serves as the single source of truth used by:
 * - entrepreneur-dashboard: builds the AI prefill schema sent to the backend
 * - specialist-window: resolves display labels and stable anchor IDs for annotations / AI challenges
 */
export interface ProjectField {
  key: string
  label: string
  type: ProjectFieldType
  description?: string
  options?: string[]
  unit?: string
  fields?: ProjectField[]  // nested fields for object / array-of-objects
  item?: ProjectField      // element definition for array-of-primitives
}

// ── Review volume layout (specialist-window) ─────────────────────────────────

/** Which review stage reveals this section's content */
export type FieldVolumeStage = 'blind' | 'open'

/**
 * Defines a section inside a review volume.
 * blind sections are visible to all reviewers; open sections unlock after blind stage.
 */
export interface ReviewSectionDef {
  id: string
  title: string
  volume: FieldVolumeStage
  /** Ordered scalar field keys (from scalarFields.ts) to display in this section */
  fieldKeys: string[]
  /** Ordered collection keys (from collectionSchemas.ts) to display in this section */
  collectionKeys: string[]
}
