export interface MaterialFile {
  fileId: string
  name: string
  category: 'honor' | 'ip' | 'certificate' | 'other'
  mimeType: string
  sizeBytes: number
  url: string
  thumbnailUrl?: string
  createdAt: string
}

export interface MaterialFolder {
  folderId: string
  name: string
  parentId?: string
  createdAt: string
}
