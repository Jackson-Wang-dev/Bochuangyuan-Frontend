import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { competitionApi } from '@bochuangyuan/api'
import type { Competition, SignUpType } from '@bochuangyuan/types'

export default function EditCompetitionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [comp, setComp] = useState<Competition | null>(null)
  const [form, setForm] = useState({
    name: '',
    summary: '',
    location: '',
    signUpStart: '',
    signUpEnd: '',
    matchStart: '',
    matchEnd: '',
    signUpType: 'Both' as SignUpType,
    greenChannelEnabled: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    competitionApi.get(id).then((c) => {
      setComp(c)
      setForm({
        name: c.name,
        summary: c.summary ?? '',
        location: c.location ?? '',
        signUpStart: c.signUpStart,
        signUpEnd: c.signUpEnd,
        matchStart: c.matchStart ?? '',
        matchEnd: c.matchEnd ?? '',
        signUpType: c.signUpType,
        greenChannelEnabled: c.greenChannelEnabled ?? false,
      })
    }).catch(() => {})
  }, [id])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await competitionApi.update(id, {
        ...form,
        matchStart: form.matchStart || undefined,
        matchEnd: form.matchEnd || undefined,
      })
      navigate(`/competitions/${id}`)
    } finally {
      setSaving(false)
    }
  }

  if (!comp) {
    return <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-slate-800">编辑赛事</h1>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-600">赛事名称</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-600">赛事简介</label>
          <textarea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-600">举办地点</label>
          <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['报名开始', 'signUpStart'], ['报名截止', 'signUpEnd'],
            ['比赛开始', 'matchStart'], ['比赛结束', 'matchEnd'],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">{label}</label>
              <input type="date" value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key as string]: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">参赛类型</label>
          <div className="flex gap-2">
            {(['Individual', 'Team', 'Both'] as SignUpType[]).map((type) => (
              <button key={type} onClick={() => setForm((f) => ({ ...f, signUpType: type }))}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  form.signUpType === type ? 'bg-brand-blue text-white border-brand-blue' : 'border-slate-200 text-slate-500 hover:border-brand-blue/50'
                }`}>
                {type === 'Individual' ? '仅个人' : type === 'Team' ? '仅团队' : '个人/团队均可'}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.greenChannelEnabled}
            onChange={(e) => setForm((f) => ({ ...f, greenChannelEnabled: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 accent-brand-blue" />
          <span className="text-sm font-semibold text-slate-600">开启绿色通道</span>
        </label>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? '保存中…' : '保存更改'}
        </button>
      </div>
    </div>
  )
}
