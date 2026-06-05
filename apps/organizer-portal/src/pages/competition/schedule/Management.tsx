import { useState } from 'react'
import { Calendar, Clock, MapPin, Plus, Edit2, Trash2, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type EventType = 'registration' | 'review' | 'ceremony' | 'training' | 'other'
type EventStatus = 'upcoming' | 'ongoing' | 'done'

interface ScheduleEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: EventType
  status: EventStatus
  description?: string
}

const TYPE_CFG: Record<EventType, { label: string; color: string; dot: string }> = {
  registration: { label: '报名',   color: 'bg-blue-50 text-blue-600 border-blue-100',     dot: 'bg-blue-500' },
  review:       { label: '评审',   color: 'bg-violet-50 text-violet-600 border-violet-100', dot: 'bg-violet-500' },
  ceremony:     { label: '典礼',   color: 'bg-amber-50 text-amber-700 border-amber-100',   dot: 'bg-amber-500' },
  training:     { label: '培训',   color: 'bg-teal-50 text-teal-600 border-teal-100',      dot: 'bg-teal-500' },
  other:        { label: '其他',   color: 'bg-slate-100 text-slate-500 border-slate-200',  dot: 'bg-slate-400' },
}

const STATUS_CFG: Record<EventStatus, { label: string; color: string }> = {
  upcoming: { label: '即将开始', color: 'text-brand' },
  ongoing:  { label: '进行中',   color: 'text-emerald-600' },
  done:     { label: '已完成',   color: 'text-faint' },
}

const MOCK_EVENTS: ScheduleEvent[] = [
  { id: 'ev-01', title: '赛事正式启动，报名通道开启',          date: '2024-04-01', time: '09:00', location: '线上',           type: 'registration', status: 'done',     description: '发布赛事公告，开放线上报名系统' },
  { id: 'ev-02', title: '创业项目培训工作坊（第一期）',        date: '2024-05-15', time: '14:00', location: '博创园 A201',     type: 'training',     status: 'done',     description: 'BP 撰写技巧与商业模式梳理培训' },
  { id: 'ev-03', title: '报名截止，材料提交截止',              date: '2024-07-01', time: '23:59', location: '线上',           type: 'registration', status: 'done',     description: '关闭报名通道，开始资质审核' },
  { id: 'ev-04', title: '资质审核结果公示',                    date: '2024-07-10', time: '10:00', location: '线上',           type: 'review',       status: 'done',     description: '公布通过资质审核的项目名单' },
  { id: 'ev-05', title: '初审评审阶段',                        date: '2024-07-15', time: '09:00', location: '专家评审系统',   type: 'review',       status: 'done',     description: '在线评审，专家对报名项目进行初步评分' },
  { id: 'ev-06', title: '初审结果公告，复审项目通知',          date: '2024-07-25', time: '10:00', location: '线上',           type: 'review',       status: 'done',     description: '公布初审通过名单，通知参赛团队' },
  { id: 'ev-07', title: '复审评审阶段',                        date: '2024-08-10', time: '09:00', location: '专家评审系统',   type: 'review',       status: 'done',     description: '复审在线评审，评委完成复赛评分' },
  { id: 'ev-08', title: '决赛名单公布，路演通知',              date: '2024-09-01', time: '10:00', location: '线上',           type: 'review',       status: 'done' },
  { id: 'ev-09', title: '决赛路演预备会（选手准备）',          date: '2024-09-18', time: '14:00', location: '博创园 B101',     type: 'training',     status: 'upcoming', description: '决赛选手彩排与设备调试' },
  { id: 'ev-10', title: '决赛路演现场评审',                    date: '2024-09-20', time: '09:00', location: '博创园大会堂',   type: 'review',       status: 'upcoming', description: '各参赛团队现场路演，评委打分' },
  { id: 'ev-11', title: '颁奖典礼暨赛事总结大会',              date: '2024-10-01', time: '14:00', location: '博创园大会堂',   type: 'ceremony',     status: 'upcoming', description: '颁发获奖证书，发放奖金，媒体采访' },
]

interface EditModalProps {
  event?: ScheduleEvent
  onClose: () => void
  onSave: (ev: Omit<ScheduleEvent, 'id'>) => void
}

function EditModal({ event, onClose, onSave }: EditModalProps) {
  const [title, setTitle]       = useState(event?.title ?? '')
  const [date, setDate]         = useState(event?.date ?? '')
  const [time, setTime]         = useState(event?.time ?? '')
  const [location, setLocation] = useState(event?.location ?? '')
  const [type, setType]         = useState<EventType>(event?.type ?? 'other')
  const [desc, setDesc]         = useState(event?.description ?? '')
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    if (!title || !date) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    onSave({ title, date, time, location, type, status: 'upcoming', description: desc })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-panel rounded-[14px] shadow-xl border border-line w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-[15px] font-bold text-ink">{event ? '编辑节点' : '新增节点'}</h2>
          <button onClick={onClose} className="text-faint hover:text-muted"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted">节点名称</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="填写节点名称"
              className="w-full border border-line rounded-[9px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted">日期</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-line rounded-[9px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-muted">时间</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full border border-line rounded-[9px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted">地点</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="线上 / 具体地点"
              className="w-full border border-line rounded-[9px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted">类型</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_CFG) as EventType[]).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={cn('px-3 py-1.5 rounded-[7px] text-[12px] font-semibold border transition-all',
                    type === t ? TYPE_CFG[t].color : 'bg-[#F4F5F8] text-muted border-transparent')}>
                  {TYPE_CFG[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-muted">备注说明（可选）</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="简要描述此节点…" rows={2}
              className="w-full border border-line rounded-[9px] px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-brand/20" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line">
          <button onClick={onClose} className="px-4 py-2 text-[13px] text-muted bg-[#F4F5F8] rounded-[9px] hover:bg-line transition-colors">取消</button>
          <button onClick={handleSave} disabled={!title || !date || saving}
            className="px-4 py-2 bg-brand text-white text-[13px] font-semibold rounded-[9px] hover:bg-brand-d disabled:opacity-50 transition-colors">
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ScheduleManagementPage() {
  const [events, setEvents] = useState<ScheduleEvent[]>(MOCK_EVENTS)
  const [editing, setEditing] = useState<ScheduleEvent | null | 'new'>(null)

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))

  const handleSave = (data: Omit<ScheduleEvent, 'id'>) => {
    if (editing && editing !== 'new') {
      setEvents((prev) => prev.map((e) => e.id === (editing as ScheduleEvent).id ? { ...e, ...data } : e))
    } else {
      setEvents((prev) => [...prev, { ...data, id: `ev-${Date.now()}` }])
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('确认删除此节点？')) return
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const toggleStatus = (id: string) => {
    setEvents((prev) => prev.map((e) => {
      if (e.id !== id) return e
      const next: EventStatus = e.status === 'done' ? 'upcoming' : e.status === 'upcoming' ? 'ongoing' : 'done'
      return { ...e, status: next }
    }))
  }

  const doneCount = events.filter((e) => e.status === 'done').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink">赛程管理</h1>
          <p className="text-[13px] text-faint mt-1">管理赛事全部时间节点与关键里程碑</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 px-4 py-[9px] bg-brand text-white rounded-[9px] text-[13.5px] font-semibold hover:bg-brand-d transition-colors shadow-sm"
        >
          <Plus className="w-[15px] h-[15px]" />
          新增节点
        </button>
      </div>

      {/* Progress */}
      <div className="glass-card p-4 space-y-2.5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-ink">赛程进度</span>
          <span className="text-faint">{doneCount} / {events.length} 节点已完成</span>
        </div>
        <div className="h-2 bg-[#EEF0F4] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all"
            style={{ width: `${Math.round((doneCount / events.length) * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-[11.5px] text-faint">
          {(Object.keys(TYPE_CFG) as EventType[]).map((t) => {
            const count = events.filter((e) => e.type === t).length
            if (!count) return null
            return (
              <span key={t} className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full inline-block', TYPE_CFG[t].dot)} />
                {TYPE_CFG[t].label} {count}
              </span>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-line" />
        <div className="space-y-2.5">
          {sorted.map((ev) => {
            const typeCfg = TYPE_CFG[ev.type]
            const statusCfg = STATUS_CFG[ev.status]
            return (
              <div key={ev.id} className={cn('relative flex gap-4 group', ev.status === 'done' && 'opacity-70')}>
                {/* Dot */}
                <div className={cn(
                  'relative z-10 w-[14px] h-[14px] rounded-full mt-[18px] flex-none border-2 border-panel',
                  typeCfg.dot,
                  ev.status === 'done' && 'opacity-60',
                )} />

                {/* Card */}
                <div className="flex-1 glass-card p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className={cn('mt-0.5 px-1.5 py-0.5 rounded-[5px] text-[10.5px] font-bold border flex-none', typeCfg.color)}>
                        {typeCfg.label}
                      </span>
                      <span className={cn(
                        'text-[13.5px] font-semibold leading-snug',
                        ev.status === 'done' ? 'line-through text-faint' : 'text-ink',
                      )}>
                        {ev.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-none">
                      <button onClick={() => toggleStatus(ev.id)} title="切换状态"
                        className="w-7 h-7 rounded-[6px] bg-[#F4F5F8] hover:bg-line flex items-center justify-center text-muted transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditing(ev)}
                        className="w-7 h-7 rounded-[6px] bg-[#F4F5F8] hover:bg-line flex items-center justify-center text-muted transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(ev.id)}
                        className="w-7 h-7 rounded-[6px] bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[12px] text-faint flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {ev.date}
                    </span>
                    {ev.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {ev.time}
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {ev.location}
                      </span>
                    )}
                    <span className={cn('font-semibold', statusCfg.color)}>{statusCfg.label}</span>
                  </div>

                  {ev.description && (
                    <p className="text-[12px] text-muted leading-relaxed">{ev.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editing !== null && (
        <EditModal
          event={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
