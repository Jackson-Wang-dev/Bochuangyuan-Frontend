// Types for the AI pre-fill feature.
// The frontend is the single source of truth for field definitions;
// this schema is serialised and sent to the backend with every prefill request.

export type PrefillFieldType =
  | 'string'   // text, textarea, phone
  | 'number'   // float
  | 'integer'
  | 'boolean'
  | 'date'     // YYYY-MM-DD or YYYY-MM
  | 'enum'     // options[]
  | 'array'    // array of objects (fields[]) or primitives (item)
  | 'object'   // nested object (fields[])

export interface PrefillFieldDef {
  key: string
  label: string
  type: PrefillFieldType
  /** Extraction hint sent to the AI model (Chinese preferred) */
  description?: string
  options?: string[]          // enum
  unit?: string               // number — model must convert to this unit
  fields?: PrefillFieldDef[]  // object / array-of-objects
  item?: PrefillFieldDef      // array-of-primitives element
}

export interface PrefillSchema {
  fields: PrefillFieldDef[]
}

// ─── Task API types ────────────────────────────────────────────────────────────

export type PrefillTaskStatus = 'pending' | 'running' | 'done' | 'failed'

export interface PrefillTaskResponse {
  taskId: string
  status: PrefillTaskStatus
  /** Filled when status === 'done'. Keys match DraftState / project field keys. */
  values?: Record<string, unknown>
  error?: string
}
