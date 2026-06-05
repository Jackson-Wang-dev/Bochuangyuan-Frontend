import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Settings2, Megaphone, ClipboardList, ClipboardCheck, Award, Trophy, Bell,
  CheckCircle2, ChevronRight, Play, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type StageStatus = 'done' | 'active' | 'upcoming'

interface PipelineNode {
  label: string
  sub?: string
  path?: string
  badge?: string
  badgeColor?: 'green' | 'blue' | 'amber' | 'violet' | 'slate'
}

interface PipelineStage {
  id: string
  label: string
  desc: string
  icon: React.ElementType
  accent: string
  nodes: PipelineNode[]
}

const STAGES: PipelineStage[] = [
  {
    id: 'setup',
    label: '赛事配置',
    desc: '完成赛事基础信息、报名表单、评分规则与评委名册的设置',
    icon: Settings2,
    accent: 'bg-blue-50 text-blue-600',
    nodes: [
      { label: '基本信息设置',   sub: '赛事名称、时间区间与简介',  path: 'basic-info' },
      { label: '赛事项目管理',   sub: '查看与管理参赛项目',         path: 'projects' },
      { label: '报名表单配置',   sub: '自定义报名字段与验证规则',   badge: '已配置', badgeColor: 'green' },
      { label: '评分规则设置',   sub: '评分维度、权重与评分标准',   badge: '已配置', badgeColor: 'green' },
      { label: '评委名册管理',   sub: '邀请评委、设置评审权限',     path: 'judges' },
    ],
  },
  {
    id: 'recruit',
    label: '发布招募',
    desc: '发布赛事，管理参赛报名与资质审核流程',
    icon: Megaphone,
    accent: 'bg-emerald-50 text-emerald-600',
    nodes: [
      { label: '发布赛事',       sub: '面向创业者公开招募',                                  badge: '已发布', badgeColor: 'green' },
      { label: '报名管理',       sub: '查看全部报名，锁定资料',        path: 'registrations', badge: '23 条', badgeColor: 'blue' },
      { label: '资质审核',       sub: '手动审核报名材料与主体资质',    path: 'qualification', badge: '8 待审', badgeColor: 'amber' },
      { label: '绿色通道审核',   sub: '优质项目申请快速晋级通道',      path: 'green-channel', badge: '3 申请', badgeColor: 'violet' },
    ],
  },
  {
    id: 'prelim',
    label: '初审',
    desc: '分配初审评委任务，实时监控评审进度，汇总阶段成绩',
    icon: ClipboardList,
    accent: 'bg-violet-50 text-violet-600',
    nodes: [
      { label: '分配评委任务',   sub: '设置评委与项目对应关系',   path: 'prelim' },
      { label: '监控评审进度',   sub: '查看评分提交情况',          path: 'prelim' },
      { label: '初审成绩',       sub: '计算均分，确认晋级名单',    path: 'prelim' },
    ],
  },
  {
    id: 'semifinal',
    label: '复审',
    desc: '复审阶段评委任务分配与成绩统计',
    icon: ClipboardCheck,
    accent: 'bg-orange-50 text-orange-600',
    nodes: [
      { label: '分配评委任务',   sub: '复审评委与项目分配',        path: 'semifinal' },
      { label: '监控评审进度',   sub: '复审进度跟踪',               path: 'semifinal' },
      { label: '复审成绩',       sub: '计算均分，确认决赛名单',     path: 'semifinal' },
    ],
  },
  {
    id: 'final',
    label: '终审 / 路演',
    desc: '决赛路演安排、终审评分管理与最终排名',
    icon: Award,
    accent: 'bg-rose-50 text-rose-600',
    nodes: [
      { label: '决赛任务分配',   sub: '路演场次与评委安排',         path: 'final' },
      { label: '终审进度监控',   sub: '路演评审实时跟踪',            path: 'final' },
      { label: '终审成绩',       sub: '最终排名与获奖候选名单',      path: 'final' },
    ],
  },
  {
    id: 'awards',
    label: '奖项与结算',
    desc: '分配奖项等级，发布获奖名单，管理奖金发放',
    icon: Trophy,
    accent: 'bg-amber-50 text-amber-600',
    nodes: [
      { label: '获奖与奖项',     sub: '设置奖项级别，分配获奖项目', path: 'awards' },
      { label: '结算管理',       sub: '奖金发放状态与资质审核',       path: 'settlement' },
    ],
  },
  {
    id: 'ops',
    label: '运营复盘',
    desc: '赛事通知推送、精彩相册归档与赛程节点管理',
    icon: Bell,
    accent: 'bg-teal-50 text-teal-600',
    nodes: [
      { label: '通知管理',       sub: '公告发布与消息推送',           path: 'notifications' },
      { label: '赛事相册',       sub: '上传与管理赛事精彩图片',        path: 'album' },
      { label: '赛程管理',       sub: '赛事时间节点与日程安排',        path: 'schedule' },
    ],
  },
]

const BADGE_CLS: Record<string, string> = {
  green:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  blue:   'bg-blue-50 text-blue-600 border-blue-100',
  amber:  'bg-amber-50 text-amber-700 border-amber-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  slate:  'bg-slate-100 text-slate-500 border-slate-200',
}

export default function PipelinePage() {
  const { id: competitionId = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeIdx, setActiveIdx] = useState(1)

  const statusOf = (idx: number): StageStatus => {
    if (idx < activeIdx) return 'done'
    if (idx === activeIdx) return 'active'
    return 'upcoming'
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-ink">赛事流程总览</h1>
        <p className="text-[13px] text-faint mt-1">全流程节点一览，点击节点直达对应管理页面</p>
      </div>

      {/* Stage progress bar */}
      <div className="glass-card px-6 py-5">
        <div className="relative flex items-start justify-between">
          <div className="absolute left-[26px] right-[26px] top-[17px] h-px bg-line" />
          {STAGES.map((stage, idx) => {
            const status = statusOf(idx)
            const Icon = stage.icon
            return (
              <button
                key={stage.id}
                onClick={() => setActiveIdx(idx)}
                className="relative z-10 flex flex-col items-center gap-1.5 group"
              >
                <div className={cn(
                  'w-[34px] h-[34px] rounded-full flex items-center justify-center border-2 transition-all',
                  status === 'done'     && 'bg-emerald-500 border-emerald-500',
                  status === 'active'   && 'bg-brand border-brand shadow-lg shadow-brand/25 scale-110',
                  status === 'upcoming' && 'bg-panel border-line group-hover:border-brand/40',
                )}>
                  {status === 'done' ? (
                    <CheckCircle2 className="w-[17px] h-[17px] text-white" />
                  ) : status === 'active' ? (
                    <Icon className="w-[15px] h-[15px] text-white" />
                  ) : (
                    <span className="text-[11px] font-bold text-faint group-hover:text-muted">{idx + 1}</span>
                  )}
                </div>
                <span className={cn(
                  'text-[10.5px] font-medium whitespace-nowrap leading-tight',
                  status === 'active'   && 'text-brand font-bold',
                  status === 'done'     && 'text-emerald-600',
                  status === 'upcoming' && 'text-faint',
                )}>
                  {stage.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stage cards */}
      <div className="space-y-2.5">
        {STAGES.map((stage, idx) => {
          const status = statusOf(idx)
          const Icon = stage.icon

          return (
            <div
              key={stage.id}
              className={cn(
                'rounded-[10px] border transition-all overflow-hidden',
                status === 'active'   && 'border-brand/25 shadow-sm bg-panel',
                status === 'done'     && 'border-line bg-panel/80',
                status === 'upcoming' && 'border-line bg-panel/60',
              )}
            >
              {/* Stage header */}
              <div
                className={cn(
                  'flex items-center justify-between px-5 py-3.5 cursor-pointer select-none',
                  status === 'active' && 'bg-brand/[0.03]',
                )}
                onClick={() => setActiveIdx(idx)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-none', stage.accent)}>
                    <Icon className="w-[17px] h-[17px]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        'text-[13.5px] font-bold',
                        status === 'upcoming' ? 'text-muted' : 'text-ink',
                      )}>
                        <span className="text-faint text-[11px] font-normal mr-1">{String(idx + 1).padStart(2, '0')}</span>
                        {stage.label}
                      </span>
                      {status === 'active' && (
                        <span className="px-2 py-0.5 bg-brand text-white text-[10px] font-bold rounded-full">
                          当前阶段
                        </span>
                      )}
                      {status === 'done' && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                          ✓ 已完成
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-faint mt-0.5 leading-snug">{stage.desc}</p>
                  </div>
                </div>
                {status !== 'active' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveIdx(idx) }}
                    className="text-[12px] font-semibold text-muted bg-[#F4F5F8] hover:bg-line px-3 py-1.5 rounded-[7px] transition-colors whitespace-nowrap"
                  >
                    切换至此阶段
                  </button>
                )}
              </div>

              {/* Active: expanded nodes grid */}
              {status === 'active' && (
                <div className="px-5 pb-4 border-t border-line/60">
                  <div className="pt-3 grid grid-cols-2 gap-2">
                    {stage.nodes.map((node) => (
                      <button
                        key={node.label}
                        disabled={!node.path}
                        onClick={() => node.path && navigate(`/competitions/${competitionId}/${node.path}`)}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-[9px] border text-left transition-all',
                          node.path
                            ? 'border-line hover:border-brand/30 hover:bg-brand/[0.03] hover:shadow-sm cursor-pointer'
                            : 'border-line/60 bg-[#F9FAFB] cursor-default',
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {node.path ? (
                            <div className="w-6 h-6 rounded-[6px] bg-brand/10 flex items-center justify-center flex-none">
                              <Play className="w-[11px] h-[11px] text-brand fill-brand" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-[6px] bg-emerald-50 flex items-center justify-center flex-none">
                              <CheckCircle2 className="w-[13px] h-[13px] text-emerald-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-ink truncate">{node.label}</div>
                            {node.sub && <div className="text-[11px] text-faint leading-tight mt-0.5">{node.sub}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-none ml-2">
                          {node.badge && (
                            <span className={cn(
                              'px-1.5 py-0.5 rounded-[5px] text-[10.5px] font-bold border',
                              node.badgeColor ? BADGE_CLS[node.badgeColor] : BADGE_CLS.slate,
                            )}>
                              {node.badge}
                            </span>
                          )}
                          {node.path && <ChevronRight className="w-3.5 h-3.5 text-faint" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Advance button */}
                  {idx < STAGES.length - 1 && (
                    <div className="flex justify-end mt-3 pt-3 border-t border-line/60">
                      <button
                        onClick={() => setActiveIdx(idx + 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-[13px] font-semibold rounded-[9px] hover:bg-brand-d transition-colors shadow-sm"
                      >
                        推进到下一阶段
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {idx === STAGES.length - 1 && (
                    <div className="flex justify-center mt-3 pt-3 border-t border-line/60">
                      <span className="text-[12px] text-emerald-600 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        赛事已进入收尾运营阶段
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Done/upcoming: compact node chips */}
              {status !== 'active' && (
                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                  {stage.nodes.map((node) => (
                    <span
                      key={node.label}
                      className={cn(
                        'text-[11px] px-2 py-1 rounded-[6px] border font-medium',
                        status === 'done'
                          ? 'bg-emerald-50/60 text-emerald-700 border-emerald-100'
                          : 'bg-[#F4F5F8] text-faint border-transparent',
                      )}
                    >
                      {status === 'done' ? '✓ ' : ''}{node.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
