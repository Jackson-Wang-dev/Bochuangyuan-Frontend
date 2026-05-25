import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CompetitionDetail } from '@/components/CompetitionDetail'
import { ProjectFormModal } from '@/components/ProjectFormModal'
import { Check } from 'lucide-react'
import type { BusinessPlan } from '@/types'

const BP_MOCKS: BusinessPlan[] = [
  { id: 'bp-1', title: '商业计划书1', lastModified: '15:21', previewText: '以本项目代表了我们下一财年的核心计划...', isLinked: true },
]

export default function CompetitionPage() {
  const navigate = useNavigate()
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  const handleRegisterQuick = () => {
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  return (
    <>
      <CompetitionDetail
        onBack={() => navigate('/home')}
        onRegisterOfficial={() => setIsProjectModalOpen(true)}
        onRegisterQuick={handleRegisterQuick}
      />

      <AnimatePresence>
        {isProjectModalOpen && (
          <ProjectFormModal
            key="project-modal"
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onlinePlans={BP_MOCKS}
          />
        )}
        {showSuccessToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[2000] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span>报名成功！</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
