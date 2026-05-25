import { ScoreMatrix } from '@/components/ScoreMatrix'
import type { EnrollmentRecord } from '@bochuangyuan/types'

const MOCK_ENROLLMENTS: EnrollmentRecord[] = [
  {
    enrollId: 'enr-2', competitionId: 'comp-1', projectId: 'proj-2',
    projectName: '碳中和智能监测系统', versionId: 'ver-2', entrepreneurId: 'usr-2',
    entrepreneurName: '李明', status: 'scored',
    scores: [
      { expertId: 'e-1', expertName: '张志远', dimensions: [], finalScore: 87.5, submittedAt: '2024-06-10' },
      { expertId: 'e-2', expertName: '李梅',   dimensions: [], finalScore: 82.0, submittedAt: '2024-06-11' },
    ],
    finalScore: 84.75, enrolledAt: '2024-05-11T10:00:00Z',
  },
  {
    enrollId: 'enr-4', competitionId: 'comp-1', projectId: 'proj-4',
    projectName: '智慧农业物联网平台', versionId: 'ver-4', entrepreneurId: 'usr-4',
    entrepreneurName: '陈林', status: 'scored',
    scores: [
      { expertId: 'e-1', expertName: '张志远', dimensions: [], finalScore: 79.0, submittedAt: '2024-06-10' },
      { expertId: 'e-2', expertName: '李梅',   dimensions: [], finalScore: 91.5, submittedAt: '2024-06-11' },
    ],
    finalScore: 85.25, enrolledAt: '2024-05-13T10:00:00Z',
  },
]

export default function ScoreOverviewPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">评分汇总矩阵</h2>
        <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          导出 Excel
        </button>
      </div>
      <ScoreMatrix enrollments={MOCK_ENROLLMENTS} />
    </div>
  )
}
