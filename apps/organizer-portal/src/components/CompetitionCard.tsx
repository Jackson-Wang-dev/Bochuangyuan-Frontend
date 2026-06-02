import { Users, Calendar, ChevronRight } from 'lucide-react'
import type { Competition, CompetitionStatus } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<CompetitionStatus, string> = {
  Draft:        '草稿',
  Unpublished:  '未发布',
  Registering:  '报名中',
  Ongoing:      '进行中',
  Ended:        '已结束',
}

const STATUS_COLOR: Record<CompetitionStatus, string> = {
  Draft:       'bg-slate-bg text-slate',
  Unpublished: 'bg-amber-bg text-amber',
  Registering: 'bg-green-bg text-green',
  Ongoing:     'bg-brand-50 text-brand-d',
  Ended:       'bg-slate-bg text-faint',
}

const AVATAR_COLORS = ['#2B50E2', '#0E9F6E', '#9333EA', '#DD6B20', '#0891B2']

interface CompetitionCardProps {
  competition: Competition
  onClick: () => void
  index?: number
}

export function CompetitionCard({ competition, onClick, index = 0 }: CompetitionCardProps) {
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const letter = competition.name.charAt(0)

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-4 px-4 py-3 border-b border-line last:border-none hover:bg-[#FAFBFE] transition-colors"
    >
      {/* Avatar */}
      <div
        className="w-[38px] h-[38px] rounded-[9px] grid place-items-center font-bold text-[15px] text-white flex-none"
        style={{ background: competition.coverImage ? undefined : avatarColor }}
      >
        {competition.coverImage ? (
          <img src={competition.coverImage.key} alt="" className="w-full h-full object-cover rounded-[9px]" />
        ) : (
          letter
        )}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-ink truncate">{competition.name}</span>
          <span className={cn('inline-flex text-[12px] font-semibold px-[9px] py-[3px] rounded-[6px]', STATUS_COLOR[competition.status])}>
            {STATUS_LABEL[competition.status]}
          </span>
        </div>
        <div className="flex items-center gap-3.5 mt-[3px] text-[12px] text-faint">
          {competition.signUpEnd && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              报名截止 <span className="font-mono">{competition.signUpEnd}</span>
            </span>
          )}
          {competition.signupCountIndiv != null && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {competition.signupCountIndiv} 人报名
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-faint flex-none" />
    </button>
  )
}
