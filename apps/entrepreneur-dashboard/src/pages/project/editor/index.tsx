import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { BPManager } from '@/components/BPManager'
import { WPSFrame } from '@/components/WPSFrame'
import { documentsApi, type DocumentResponse, type DocumentSessionResponse } from '@bochuangyuan/api'

interface WPSState {
  title: string
  session: DocumentSessionResponse
}

// DEV: 演示用占位文档，接口就绪后可删除
const DEMO_DOC: DocumentResponse = {
  id: 1,
  file_id: 'demo-file-id',
  name: '示例商业计划书.docx',
  mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  size: 102400,
  version: 1,
  doc_type: 'business_plan',
  owner_id: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default function ProjectEditorPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([DEMO_DOC])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [wps, setWps] = useState<WPSState | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    documentsApi
      .list('business_plan')
      .then((docs) => setDocuments([DEMO_DOC, ...docs]))
      .catch(() => setDocuments([DEMO_DOC]))
      .finally(() => setLoading(false))
  }, [])

  const openWPS = async (doc: DocumentResponse, mode: 'edit' | 'preview') => {
    try {
      const session = await documentsApi.createSession(doc.id, mode)
      setWps({ title: doc.name, session })
    } catch (err) {
      console.error('Failed to create WPS session', err)
    }
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const doc = await documentsApi.upload(file)
      setDocuments((prev) => [doc, ...prev])
      await openWPS(doc, 'edit')
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {/* Hidden file input for "新建BP" — triggers upload then opens WPS */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ''
        }}
      />

      <BPManager
        documents={documents}
        loading={loading}
        uploading={uploading}
        onCreateNew={() => fileInputRef.current?.click()}
        onEdit={(doc) => openWPS(doc, 'edit')}
        onPreview={(doc) => openWPS(doc, 'preview')}
        onUpload={handleUpload}
      />

      <AnimatePresence>
        {wps && (
          <WPSFrame
            key="wps-frame"
            title={wps.title}
            session={wps.session}
            onClose={() => setWps(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
