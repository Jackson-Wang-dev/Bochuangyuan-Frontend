import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { BPManager } from '@/components/BPManager'
import { BPEditor } from '@/components/BPEditor'
import { BPPreviewModal } from '@/components/BPPreviewModal'
import type { BusinessPlan } from '@/types'

const BP_MOCKS: BusinessPlan[] = [
  { id: 'bp-1', title: '商业计划书1', lastModified: '15:21', previewText: '以本项目代表了我们下一财年的核心计划...', isLinked: true },
  { id: 'bp-2', title: '商业计划书2', lastModified: '昨日 10:30', previewText: '基于AI算法的城市交通疏导方案...', isLinked: false },
]

export default function ProjectEditorPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<BusinessPlan | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewPlan, setPreviewPlan] = useState<BusinessPlan | null>(null)

  const handleEdit = (plan: BusinessPlan) => {
    setCurrentPlan(plan)
    setIsEditorOpen(true)
  }

  const handlePreview = (plan: BusinessPlan) => {
    setPreviewPlan(plan)
    setIsPreviewOpen(true)
  }

  return (
    <>
      <BPManager
        plans={BP_MOCKS}
        onCreateNew={() => { setCurrentPlan(null); setIsEditorOpen(true) }}
        onEdit={handleEdit}
        onPreview={handlePreview}
      />

      <AnimatePresence>
        {isEditorOpen && (
          <BPEditor
            key="bp-editor"
            plan={currentPlan}
            onClose={() => setIsEditorOpen(false)}
          />
        )}
        <BPPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => { setIsPreviewOpen(false); setPreviewPlan(null) }}
          plan={previewPlan}
        />
      </AnimatePresence>
    </>
  )
}
