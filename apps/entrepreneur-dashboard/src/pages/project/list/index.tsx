import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { ProjectWorkspace } from '@/components/ProjectWorkspace'
import { ProjectDetails } from '@/components/ProjectDetails'
import { ProjectFormModal } from '@/components/ProjectFormModal'
import { BPEditor } from '@/components/BPEditor'
import { BPSelectionModal } from '@/components/BPSelectionModal'
import type { Project, BusinessPlan } from '@/types'

// TODO: replace with API call to fetch user's enrolled projects
const PROJECTS: Project[] = [
  { id: 'prj-1', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-2', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-3', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-4', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'reviewing', bpLink: '#', remainingDays: 2 },
  { id: 'prj-5', name: '虚拟现实数字孪生工厂', competition: '工业 4.0 数字化转型竞赛', deadline: '2024-05-30', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-6', name: '绿色能源监控平台', competition: '可持续发展科技创新奖', deadline: '2024-05-15', status: 'completed', bpLink: '#', remainingDays: 2 },
]

// TODO: replace with API call to fetch user's business plans
const BP_MOCKS: BusinessPlan[] = [
  { id: 'bp-1', title: '商业计划书1', lastModified: '15:21', previewText: '以本项目代表了我们下一财年的核心计划...', isLinked: true },
  { id: 'bp-2', title: '商业计划书2', lastModified: '昨日 10:30', previewText: '基于AI算法的城市交通疏导方案...', isLinked: false },
]

type SubView = 'list' | 'details'

export default function ProjectListPage() {
  const [subView, setSubView] = useState<SubView>('list')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<BusinessPlan | null>(null)
  const [isOnlineBPSelectOpen, setIsOnlineBPSelectOpen] = useState(false)

  const handleViewDetails = (project: Project) => {
    setCurrentProject(project)
    setSubView('details')
  }

  const handleEditBP = (plan: BusinessPlan) => {
    setCurrentPlan(plan)
    setIsEditorOpen(true)
  }

  return (
    <>
      {subView === 'list' && (
        <div className="space-y-8">
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">项目管理</h2>
          </div>
          <ProjectWorkspace
            projects={PROJECTS}
            onCreateNew={() => setIsProjectModalOpen(true)}
            onViewDetails={handleViewDetails}
          />
        </div>
      )}

      {subView === 'details' && currentProject && (
        <ProjectDetails
          project={currentProject}
          onBack={() => setSubView('list')}
          onEditBP={handleEditBP}
          onReupload={() => setIsOnlineBPSelectOpen(true)}
        />
      )}

      <AnimatePresence>
        {isProjectModalOpen && (
          <ProjectFormModal
            key="project-modal"
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onlinePlans={BP_MOCKS}
          />
        )}
        {isEditorOpen && (
          <BPEditor
            key="bp-editor"
            plan={currentPlan}
            onClose={() => setIsEditorOpen(false)}
          />
        )}
        <BPSelectionModal
          key="online-bp-select"
          isOpen={isOnlineBPSelectOpen}
          onClose={() => setIsOnlineBPSelectOpen(false)}
          plans={BP_MOCKS}
          onSelect={() => setIsOnlineBPSelectOpen(false)}
        />
      </AnimatePresence>
    </>
  )
}
