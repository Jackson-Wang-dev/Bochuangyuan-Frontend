import { useNavigate, useParams } from 'react-router-dom'
import { ProjectTable, type ProjectRow } from '@/components/ProjectTable'

const MOCK_ENROLLMENTS: ProjectRow[] = [
  { enrollId: 'enr-1', projectName: 'AI 分布式算力平台',    entrepreneurName: '王发', status: 'reviewing', finalScore: undefined },
  { enrollId: 'enr-2', projectName: '碳中和智能监测系统',   entrepreneurName: '李明', status: 'scored',    finalScore: 84.75 },
  { enrollId: 'enr-3', projectName: '医疗影像 AI 辅助诊断', entrepreneurName: '张华', status: 'enrolled',  finalScore: undefined },
]

export default function ProjectListPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <ProjectTable
      enrollments={MOCK_ENROLLMENTS}
      onSelect={(e) => navigate(`/competitions/${id}/projects/${e.enrollId}`)}
    />
  )
}
