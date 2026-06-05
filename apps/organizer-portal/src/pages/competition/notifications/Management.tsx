import { useState } from 'react'
import { Bell, Send, Clock, CheckCircle2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type NotifStatus = 'sent' | 'scheduled' | 'draft'
type NotifType = 'announcement' | 'reminder' | 'result' | 'system'

interface NotifItem {
  id: string
  title: string
  content: string
  type: NotifType
  status: NotifStatus
  sentAt?: string
  scheduledAt?: string
  reach: number
}

const TYPE_CFG: Record<NotifType, { label: string; color: string }> = {
  announcement: { label: '公告',   color: 'bg-blue-50 text-blue-600 border-blue-100' },
  reminder:     { label: '提醒',   color: 'bg-amber-50 text-amber-700 border-amber-100' },
  result:       { label: '成绩',   color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  system:       { label: '系统',   color: 'bg-slate-100 text-slate-500 border-slate-200' },
}
const STATUS_CFG: Record<NotifStatus, { label: string; icon: React.ElementType; color: string }> = {
  sent:      { label: '已发送', icon: CheckCircle2, color: 'text-emerald-600' },
  scheduled: { label: '定时发送', icon: Clock,       color: 'text-amber-600'  },
  draft:     { label: '草稿',   icon: Bell,         color: 'text-slate-400'  },
}

const MOCK_NOTIFS: NotifItem[] = [
  {
    id: 'n-001', title: '2024 博创杯报名正式开启', type: 'announcement', status: 'sent',
    content: '亲爱的创业者，2024 博创杯双创大赛报名通道已正式开启，欢迎踊跃参与！报名截止日期为 2024 年 7 月 1 日。',
    sentAt: '2024-04-01T09:00:00Z', reach: 3820,
  },
  {
    id: 'n-002', title: '初审结果公告', type: 'result', status: 'sent',
    content: '经过专家初审，以下项目成功晋级复赛阶段，请相关团队在规定时间内完成复赛报名。',
    sentAt: '2024-07-20T10:30:00Z', reach: 1240,
  },
  {
    id: 'n-003', title: '报名截止提醒（还剩 3 天）', type: 'reminder', status: 'sent',
    content: '距报名截止仅剩 3 天，尚未提交报名材料的团队请尽快完成报名。资质审核材料需在截止前上传。',
    sentAt: '2024-06-28T08:00:00Z', reach: 2100,
  },
  {
    id: 'n-004', title: '复审评分完成，决赛名单即将公布', type: 'result', status: 'scheduled',
    content: '复审阶段评分已全部完成，决赛入围名单将于 2024 年 9 月 5 日正式公布，敬请关注。',
    scheduledAt: '2024-09-05T09:00:00Z', reach: 0,
  },
  {
    id: 'n-005', title: '路演活动通知', type: 'announcement', status: 'draft',
    content: '决赛路演将于 2024 年 9 月 20 日在博创园大会堂举行，入围团队请提前准备 10 分钟路演 PPT。',
    reach: 0,
  },
]

interface ComposeModalProps {
  onClose: () => void
  onSend: (notif: Omit<NotifItem, 'id' | 'reach'>) => void
}

function ComposeModal({ onClose, onSend }: ComposeModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<NotifType>('announcement')
  const [sendNow, setSendNow] = useState(true)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) return
    setSending(true)
    await new Promise((r) => setTimeout(r, 600))
    onSend({ title, content, type, status: sendNow ? 'sent' : 'draft', sentAt: sendNow ? new Date().toISOString() : undefined })
    setSending(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-panel rounded-[14px] shadow-xl border border-line w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-[15px] font-bold text-ink">发布通知</h2>
          <button onClick={onClose} className="text-faint hover:text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted">通知标题</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="填写通知标题"
              className="w-full border border-line rounded-[9px] px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted">通知类型</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TYPE_CFG) as NotifType[]).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-[7px] text-[12px] font-semibold border transition-all',
                    type === t ? TYPE_CFG[t].color + ' ring-1 ring-current/30' : 'bg-[#F4F5F8] text-muted border-transparent',
                  )}>
                  {TYPE_CFG[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted">通知内容</label>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="填写通知正文…"
              rows={4}
              className="w-full border border-line rounded-[9px] px-3 py-2 text-[13px] text-ink resize-none focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSendNow(!sendNow)}
              className={cn(
                'w-9 h-5 rounded-full transition-colors relative flex-none',
                sendNow ? 'bg-brand' : 'bg-slate-200',
              )}
            >
              <span className={cn(
                'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                sendNow ? 'translate-x-4' : 'translate-x-0.5',
              )} />
            </button>
            <span className="text-[12.5px] text-muted">立即发送（关闭则保存为草稿）</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-muted bg-[#F4F5F8] rounded-[9px] hover:bg-line transition-colors">
            取消
          </button>
          <button
            onClick={handleSend}
            disabled={!title || !content || sending}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-[13px] font-semibold rounded-[9px] hover:bg-brand-d disabled:opacity-50 transition-colors"
          >
            {sending ? '发送中…' : <><Send className="w-3.5 h-3.5" />{sendNow ? '立即发布' : '保存草稿'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsManagementPage() {
  const [notifs, setNotifs] = useState<NotifItem[]>(MOCK_NOTIFS)
  const [showCompose, setShowCompose] = useState(false)
  const [filterStatus, setFilterStatus] = useState<NotifStatus | 'all'>('all')

  const handleSend = (data: Omit<NotifItem, 'id' | 'reach'>) => {
    setNotifs((prev) => [{
      ...data, id: `n-${Date.now()}`, reach: data.status === 'sent' ? Math.floor(Math.random() * 2000 + 500) : 0,
    }, ...prev])
  }

  const filtered = notifs.filter((n) => filterStatus === 'all' || n.status === filterStatus)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink">通知管理</h1>
          <p className="text-[13px] text-faint mt-1">发布赛事公告、提醒与结果通知</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="inline-flex items-center gap-2 px-4 py-[9px] bg-brand text-white rounded-[9px] text-[13.5px] font-semibold hover:bg-brand-d transition-colors shadow-sm"
        >
          <Plus className="w-[15px] h-[15px]" />
          发布通知
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { label: '已发送', count: notifs.filter((n) => n.status === 'sent').length, color: 'text-emerald-600' },
          { label: '定时待发', count: notifs.filter((n) => n.status === 'scheduled').length, color: 'text-amber-600' },
          { label: '草稿', count: notifs.filter((n) => n.status === 'draft').length, color: 'text-faint' },
        ] as const).map(({ label, count, color }) => (
          <div key={label} className="glass-card p-4 text-center space-y-1">
            <div className={cn('text-[26px] font-black tabular-nums', color)}>{count}</div>
            <div className="text-[12px] text-faint">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="inline-flex bg-[#EEF0F4] rounded-[9px] p-[3px] gap-0.5">
        {([['all', '全部'], ['sent', '已发送'], ['scheduled', '定时'], ['draft', '草稿']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val)}
            className={cn(
              'text-[13px] font-medium px-[13px] py-[6px] rounded-[7px] transition-all',
              filterStatus === val ? 'bg-panel text-ink font-semibold shadow-sm' : 'text-muted hover:text-ink',
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filtered.map((notif) => {
          const typeCfg = TYPE_CFG[notif.type]
          const statusCfg = STATUS_CFG[notif.status]
          const StatusIcon = statusCfg.icon
          return (
            <div key={notif.id} className="glass-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={cn('mt-0.5 px-1.5 py-0.5 rounded-[5px] text-[11px] font-bold border flex-none', typeCfg.color)}>
                    {typeCfg.label}
                  </span>
                  <span className="text-[14px] font-semibold text-ink leading-snug">{notif.title}</span>
                </div>
                <span className={cn('flex items-center gap-1 text-[12px] font-semibold flex-none', statusCfg.color)}>
                  <StatusIcon className="w-3.5 h-3.5" /> {statusCfg.label}
                </span>
              </div>
              <p className="text-[12.5px] text-muted leading-relaxed line-clamp-2">{notif.content}</p>
              <div className="flex items-center gap-4 text-[11.5px] text-faint">
                {notif.sentAt && <span>发送于 {new Date(notif.sentAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                {notif.scheduledAt && <span>定时 {new Date(notif.scheduledAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                {notif.reach > 0 && <span>触达 {notif.reach.toLocaleString()} 人</span>}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="glass-card py-16 text-center text-[13px] text-faint">暂无通知</div>
        )}
      </div>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} onSend={handleSend} />}
    </div>
  )
}
