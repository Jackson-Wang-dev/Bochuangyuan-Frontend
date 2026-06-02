import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { competitionApi } from '@bochuangyuan/api'
import type { Competition, CompetitionStatus } from '@bochuangyuan/types'
import { useCompetitionStore } from '@/store/competitionStore'
import { Search, MapPin, Calendar, ChevronRight, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Partial<Record<CompetitionStatus, string>> = {
  Registering: '报名中',
  Ongoing: '进行中',
  Ended: '已结束',
  Unpublished: '未开放',
}

const STATUS_COLOR: Partial<Record<CompetitionStatus, string>> = {
  Registering: 'bg-emerald-50 text-emerald-600',
  Ongoing: 'bg-blue-50 text-blue-600',
  Ended: 'bg-slate-100 text-slate-400',
  Unpublished: 'bg-amber-50 text-amber-500',
}

export default function CompetitionBrowsePage() {
  const navigate = useNavigate()
  const { competitions, setCompetitions } = useCompetitionStore()
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    competitionApi.list({ status: 'Registering' }).then((page) => {
      setCompetitions(page.list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [setCompetitions])

  const filtered = competitions.filter(
    (c) => !keyword || c.name.includes(keyword) || c.summary?.includes(keyword),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">赛事广场</h1>
          <p className="text-sm text-slate-400 mt-0.5">发现适合您的创业大赛</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索赛事"
            className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 w-60" />
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
          <Trophy className="w-10 h-10" />
          <p className="text-sm">暂无赛事</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comp) => (
            <CompetitionCard key={comp.competitionId} comp={comp} onRegister={() => navigate(`/competition/${comp.competitionId}/register`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function CompetitionCard({ comp, onRegister }: { comp: Competition; onRegister: () => void }) {
  const statusLabel = STATUS_LABEL[comp.status]
  const statusColor = STATUS_COLOR[comp.status] ?? 'bg-slate-100 text-slate-500'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:border-brand-blue/20 hover:shadow-md transition-all">
      {/* Cover */}
      <div className="w-16 h-16 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0 text-2xl">
        {comp.coverImage ? (
          <img src={comp.coverImage.key} alt="" className="w-full h-full object-cover rounded-xl" />
        ) : '🏆'}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-bold text-slate-800 text-base">{comp.name}</h2>
          {statusLabel && (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', statusColor)}>
              {statusLabel}
            </span>
          )}
        </div>

        {comp.summary && <p className="text-sm text-slate-500 line-clamp-2">{comp.summary}</p>}

        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            报名截止 {comp.signUpEnd}
          </span>
          {comp.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {comp.location}
            </span>
          )}
          {comp.tracks && comp.tracks.length > 0 && (
            <span>{comp.tracks.map((t) => t.name).join(' · ')}</span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        {comp.status === 'Registering' ? (
          <button
            onClick={onRegister}
            className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue/90 transition-colors"
          >
            立即报名
          </button>
        ) : (
          <button className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
            查看详情 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
