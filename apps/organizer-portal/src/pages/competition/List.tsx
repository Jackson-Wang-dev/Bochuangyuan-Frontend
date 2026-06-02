import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { CompetitionCard } from '@/components/CompetitionCard'
import { useCompetitionStore } from '@/store/competitionStore'
import { competitionApi } from '@bochuangyuan/api'
import type { Competition, CompetitionStatus } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

const MOCK_COMPETITIONS: Competition[] = [
  {
    competitionId: 'comp-1', name: '2024 全国大学生创业大赛', hostId: 'org-1',
    summary: '面向全国在校大学生的综合性创业赛事，设多个赛道，奖金池 500 万元。',
    signUpStart: '2024-03-01', signUpEnd: '2024-06-01',
    matchStart: '2024-06-15', matchEnd: '2024-09-30',
    status: 'Registering', signUpType: 'Both', greenChannelEnabled: true,
  },
  {
    competitionId: 'comp-2', name: '2024 博创杯双创大赛', hostId: 'org-1',
    summary: '博创园年度品牌赛事，重点支持硬科技、新能源、医疗健康三大赛道。',
    signUpStart: '2024-04-01', signUpEnd: '2024-07-01',
    matchStart: '2024-07-20', matchEnd: '2024-10-31',
    status: 'Ongoing', signUpType: 'Team',
  },
  {
    competitionId: 'comp-3', name: '创新创业挑战赛（测试）', hostId: 'org-1',
    summary: '用于功能演示的草稿赛事。',
    signUpStart: '2024-01-01', signUpEnd: '2024-02-01',
    status: 'Draft', signUpType: 'Individual',
  },
]

const STATUS_FILTERS: { label: string; value: CompetitionStatus | 'all' }[] = [
  { label: '全部',   value: 'all' },
  { label: '草稿',   value: 'Draft' },
  { label: '报名中', value: 'Registering' },
  { label: '进行中', value: 'Ongoing' },
  { label: '已结束', value: 'Ended' },
]

export default function CompetitionListPage() {
  const navigate = useNavigate()
  const { competitions, setCompetitions } = useCompetitionStore()
  const [activeStatus, setActiveStatus] = useState<CompetitionStatus | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    competitionApi.list().then((page) => {
      setCompetitions(page?.list ?? [])
      setLoading(false)
    }).catch(() => {
      setCompetitions(MOCK_COMPETITIONS)
      setLoading(false)
    })
  }, [setCompetitions])

  const filtered = competitions.filter((c) => {
    const matchStatus = activeStatus === 'all' || c.status === activeStatus
    const matchKeyword = !keyword || c.name.includes(keyword)
    return matchStatus && matchKeyword
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink">赛事列表</h1>
          <p className="text-[13px] text-faint mt-1">管理所有赛事及其生命周期</p>
        </div>
        <button
          onClick={() => navigate('/competitions/new')}
          className="inline-flex items-center gap-2 px-4 py-[9px] bg-brand text-white rounded-[9px] text-[13.5px] font-semibold hover:bg-brand-d transition-colors shadow-sm"
        >
          <Plus className="w-[15px] h-[15px]" />
          新建赛事
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex bg-[#EEF0F4] rounded-[9px] p-[3px] gap-0.5">
          {STATUS_FILTERS.map(({ label, value }) => {
            const active = activeStatus === value
            const count = value === 'all'
              ? competitions.length
              : competitions.filter((c) => c.status === value).length
            return (
              <button
                key={value}
                onClick={() => setActiveStatus(value)}
                className={cn(
                  'flex items-center gap-1.5 text-[13px] font-medium px-[13px] py-[6px] rounded-[7px] transition-all',
                  active ? 'bg-panel text-ink font-semibold shadow-sm' : 'text-muted hover:text-ink',
                )}
              >
                {label}
                <span className={cn(
                  'text-[11px] font-semibold rounded-full px-1.5 min-w-[18px] text-center',
                  active ? 'bg-brand text-white' : 'bg-[#DDE0E6] text-slate',
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 bg-[#F4F5F8] border border-line rounded-lg px-3 py-[7px] w-52 ml-auto">
          <Search className="w-[15px] h-[15px] text-faint flex-none" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索赛事名称"
            className="bg-transparent border-none outline-none text-[13px] text-ink placeholder:text-faint w-full"
          />
        </div>
      </div>

      {/* Table card */}
      {loading ? (
        <div className="glass-card py-16 text-center text-[13px] text-faint">加载中…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card py-16 text-center text-[13px] text-faint">暂无赛事</div>
      ) : (
        <div className="glass-card overflow-hidden">
          {filtered.map((comp, idx) => (
            <CompetitionCard
              key={comp.competitionId}
              competition={comp}
              onClick={() => navigate(`/competitions/${comp.competitionId}`)}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  )
}
