import { useNavigate, useParams } from 'react-router-dom'
import { ProjectTable } from '@/components/ProjectTable'
import type { EnrollmentRecord } from '@bochuangyuan/types'

const MOCK_ENROLLMENTS: EnrollmentRecord[] = [
  {
    enrollId: 'enr-1', competitionId: 'comp-1', projectId: 'proj-1',
    projectName: 'AI 分布式算力平台', versionId: 'ver-1', entrepreneurId: 'usr-1',
    entrepreneurName: '王发', status: 'reviewing', scores: [], finalScore: undefined,
    enrolledAt: '2024-05-10T10:00:00Z',
  },
  {
    enrollId: 'enr-2', competitionId: 'comp-1', projectId: 'proj-2',
    projectName: '碳中和智能监测系统', versionId: 'ver-2', entrepreneurId: 'usr-2',
    entrepreneurName: '李明', status: 'scored', scores: [
      { expertId: 'e-1', expertName: '张志远', dimensions: [], finalScore: 87.5, submittedAt: '2024-06-10' },
      { expertId: 'e-2', expertName: '李梅',   dimensions: [], finalScore: 82.0, submittedAt: '2024-06-11' },
    ], finalScore: 84.75, enrolledAt: '2024-05-11T10:00:00Z',
  },
  {
    enrollId: 'enr-3', competitionId: 'comp-1', projectId: 'proj-3',
    projectName: '医疗影像 AI 辅助诊断', versionId: 'ver-3', entrepreneurId: 'usr-3',
    entrepreneurName: '张华', status: 'enrolled', scores: [], finalScore: undefined,
    enrolledAt: '2024-05-12T10:00:00Z',
  },
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
