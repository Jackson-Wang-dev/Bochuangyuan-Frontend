import { apiClient } from '@bochuangyuan/api'
import type { MaterialFile } from '@bochuangyuan/types'

export async function fetchMaterials(): Promise<MaterialFile[]> {
  const { data } = await apiClient.get<MaterialFile[]>('/materials')
  return data
}

export async function uploadMaterial(
  file: File,
  category: MaterialFile['category'],
): Promise<MaterialFile> {
  const form = new FormData()
  form.append('file', file)
  form.append('category', category)
  const { data } = await apiClient.post<MaterialFile>('/materials/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteMaterial(fileId: string): Promise<void> {
  await apiClient.delete(`/materials/${fileId}`)
}
