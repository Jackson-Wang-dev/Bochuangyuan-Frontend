import { apiClient } from './client'

export interface DocumentResponse {
  id: number
  file_id: string
  name: string
  mime_type: string
  size: number
  version: number
  doc_type: string
  owner_id: number
  created_at: string
  updated_at: string
}

export interface DocumentSessionResponse {
  app_id: string
  file_id: string
  token: string
  office_type: 'w' | 's' | 'p' | 'f'
  mode: 'preview' | 'edit'
}

export interface DocumentVersionResponse {
  id: number
  version: number
  size: number
  editor_id: number
  editor_name: string
  created_at: string
  is_current: boolean
}

export const documentsApi = {
  list: (doc_type?: string) =>
    apiClient
      .get<DocumentResponse[]>('/api/v1/documents', {
        params: doc_type ? { doc_type } : undefined,
      })
      .then((r) => r.data),

  upload: (file: File, doc_type = 'business_plan') => {
    const form = new FormData()
    form.append('file', file)
    form.append('doc_type', doc_type)
    return apiClient
      .post<DocumentResponse>('/api/v1/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  get: (id: number) =>
    apiClient.get<DocumentResponse>(`/api/v1/documents/${id}`).then((r) => r.data),

  createSession: (id: number, mode: 'preview' | 'edit' = 'preview') =>
    apiClient
      .post<DocumentSessionResponse>(`/api/v1/documents/${id}/session`, { mode })
      .then((r) => r.data),

  versions: (id: number) =>
    apiClient
      .get<DocumentVersionResponse[]>(`/api/v1/documents/${id}/versions`)
      .then((r) => r.data),

  download: (id: number) =>
    apiClient
      .get(`/api/v1/documents/${id}/download`, { responseType: 'blob' })
      .then((r) => r.data as Blob),
}