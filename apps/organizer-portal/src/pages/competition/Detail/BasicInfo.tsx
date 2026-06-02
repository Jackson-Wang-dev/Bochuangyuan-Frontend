import { useCompetitionStore } from '@/store/competitionStore'
import { MapPin, Calendar, Users, Tag } from 'lucide-react'
import type { SignUpType } from '@bochuangyuan/types'

const SIGNUP_TYPE_LABEL: Record<SignUpType, string> = {
  Individual: '个人参赛',
  Team: '团队参赛',
  Both: '个人 / 团队均可',
}

export default function BasicInfoTab() {
  const comp = useCompetitionStore((s) => s.currentCompetition)

  if (!comp) {
    return <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: '报名截止', value: comp.signUpEnd },
          { icon: Calendar, label: '比赛开始', value: comp.matchStart ?? '待定' },
          { icon: Users, label: '参赛类型', value: SIGNUP_TYPE_LABEL[comp.signUpType] },
          { icon: MapPin, label: '举办地点', value: comp.location ?? '待定' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-card p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
            <p className="text-sm font-bold text-slate-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {comp.summary && (
        <div className="glass-card p-5 space-y-2">
          <h3 className="text-sm font-bold text-slate-700">赛事简介</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{comp.summary}</p>
        </div>
      )}

      {/* Tracks */}
      {comp.tracks && comp.tracks.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            赛道
          </h3>
          <div className="flex flex-wrap gap-2">
            {comp.tracks.map((t) => (
              <span key={t.id} className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Green channel */}
      {comp.greenChannelEnabled && (
        <div className="glass-card p-4 flex items-center gap-2 bg-emerald-50/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-sm font-semibold text-emerald-700">本赛事已开启绿色通道</p>
        </div>
      )}
    </div>
  )
}
