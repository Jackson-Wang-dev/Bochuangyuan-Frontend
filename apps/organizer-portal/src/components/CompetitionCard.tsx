import { Users, Calendar, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@bochuangyuan/ui'
import type { OrganizerCompetition } from '@bochuangyuan/types'

interface CompetitionCardProps {
  competition: OrganizerCompetition
  onClick: () => void
}

export function CompetitionCard({ competition, onClick }: CompetitionCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-5 w-full text-left flex items-center gap-4 hover:shadow-md hover:border-brand-blue/20 transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0 text-xl">
        🏆
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 truncate">{competition.name}</span>
          <StatusBadge status={competition.status} />
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{competition.enrollCount} 支队伍</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />报名截止 {competition.enrollDeadline}</span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </button>
  )
}
