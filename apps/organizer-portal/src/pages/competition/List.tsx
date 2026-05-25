import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { CompetitionCard } from '@/components/CompetitionCard'
import type { OrganizerCompetition } from '@bochuangyuan/types'

const MOCK_COMPETITIONS: OrganizerCompetition[] = [
  {
    competitionId: 'comp-1',
    name: '2024 全国大学生创业大赛',
    organizerId: 'org-001',
    status: 'reviewing',
    enrollDeadline: '2024-05-31',
    reviewDeadline: '2024-06-30',
    scoreDimensions: [
      { key: 'technology', label: '技术成熟度', weight: 30 },
      { key: 'market',     label: '市场前景',   weight: 30 },
      { key: 'team',       label: '团队能力',   weight: 20 },
      { key: 'innovation', label: '创新性',     weight: 20 },
    ],
    enrollCount: 48,
    createdAt: '2024-01-15T10:00:00Z',
    description: '面向全国高校在校生及应届生的创业竞赛',
  },
  {
    competitionId: 'comp-2',
    name: '2024 博创杯双创大赛',
    organizerId: 'org-001',
    status: 'open',
    enrollDeadline: '2024-07-15',
    reviewDeadline: '2024-08-31',
    scoreDimensions: [],
    enrollCount: 12,
    createdAt: '2024-04-01T10:00:00Z',
    description: '博创园主办的年度创业大赛',
  },
]

export default function CompetitionListPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">赛事管理</h1>
        <button
          onClick={() => navigate('/competitions/create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新建赛事
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_COMPETITIONS.map((comp) => (
          <CompetitionCard
            key={comp.competitionId}
            competition={comp}
            onClick={() => navigate(`/competitions/${comp.competitionId}`)}
          />
        ))}
      </div>
    </div>
  )
}
