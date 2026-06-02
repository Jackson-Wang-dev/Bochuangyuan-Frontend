import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Plus, X } from 'lucide-react'
import { FormBuilder, useFormBuilderStore } from '@bochuangyuan/ui'
import { competitionApi } from '@bochuangyuan/api'
import type { SignUpType, Track } from '@bochuangyuan/types'
import { nanoid } from 'nanoid'

type Step = 1 | 2 | 3 | 4
const STEPS = ['基本信息', '报名表单', '评审字段', '预览确认']

interface BasicForm {
  name: string
  summary: string
  location: string
  signUpStart: string
  signUpEnd: string
  matchStart: string
  matchEnd: string
  signUpType: SignUpType
  greenChannelEnabled: boolean
  tracks: Track[]
}

const EMPTY_BASIC: BasicForm = {
  name: '',
  summary: '',
  location: '',
  signUpStart: '',
  signUpEnd: '',
  matchStart: '',
  matchEnd: '',
  signUpType: 'Both',
  greenChannelEnabled: false,
  tracks: [],
}

export default function CreateCompetitionPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [basic, setBasic] = useState<BasicForm>(EMPTY_BASIC)
  const [trackInput, setTrackInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const formFields = useFormBuilderStore((s) => s.fields)

  const canNext1 = !!basic.name && !!basic.signUpStart && !!basic.signUpEnd

  const addTrack = () => {
    const name = trackInput.trim()
    if (!name) return
    setBasic((b) => ({ ...b, tracks: [...b.tracks, { id: nanoid(), name }] }))
    setTrackInput('')
  }

  const removeTrack = (id: string) => {
    setBasic((b) => ({ ...b, tracks: b.tracks.filter((t) => t.id !== id) }))
  }

  const handlePublish = async () => {
    setSubmitting(true)
    try {
      await competitionApi.create({
        name: basic.name,
        hostId: 'current-org-id',
        summary: basic.summary || undefined,
        location: basic.location || undefined,
        signUpStart: basic.signUpStart,
        signUpEnd: basic.signUpEnd,
        matchStart: basic.matchStart || undefined,
        matchEnd: basic.matchEnd || undefined,
        signUpType: basic.signUpType,
        greenChannelEnabled: basic.greenChannelEnabled,
        tracks: basic.tracks.length > 0 ? basic.tracks : undefined,
        status: 'Draft',
      })
      navigate('/competitions')
    } catch {
      setSubmitting(false)
    }
  }

  const isFullWidth = step === 2 || step === 3

  return (
    <div className={isFullWidth ? 'h-full flex flex-col' : 'max-w-2xl space-y-6'}>
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-slate-800">新建赛事</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0 flex-shrink-0 flex-wrap">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step
          const active = step === n
          const done = step > n
          return (
            <div key={label} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active ? 'bg-brand-blue text-white' : done ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {done ? <Check className="w-4 h-4" /> : <span>{n}</span>}
                {label}
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-slate-200 mx-1" />}
            </div>
          )
        })}
      </div>

      {/* Step 1 — 基本信息 */}
      {step === 1 && (
        <div className="glass-card p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">赛事名称 *</label>
            <input
              value={basic.name}
              onChange={(e) => setBasic((b) => ({ ...b, name: e.target.value }))}
              placeholder="请输入赛事名称"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">赛事简介</label>
            <textarea
              value={basic.summary}
              onChange={(e) => setBasic((b) => ({ ...b, summary: e.target.value }))}
              placeholder="请输入赛事简介"
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">举办地点</label>
            <input
              value={basic.location}
              onChange={(e) => setBasic((b) => ({ ...b, location: e.target.value }))}
              placeholder="线上 / 城市"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">报名开始 *</label>
              <input type="date" value={basic.signUpStart} onChange={(e) => setBasic((b) => ({ ...b, signUpStart: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">报名截止 *</label>
              <input type="date" value={basic.signUpEnd} onChange={(e) => setBasic((b) => ({ ...b, signUpEnd: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">比赛开始</label>
              <input type="date" value={basic.matchStart} onChange={(e) => setBasic((b) => ({ ...b, matchStart: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">比赛结束</label>
              <input type="date" value={basic.matchEnd} onChange={(e) => setBasic((b) => ({ ...b, matchEnd: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">参赛类型</label>
            <div className="flex gap-2">
              {(['Individual', 'Team', 'Both'] as SignUpType[]).map((type) => (
                <button key={type} onClick={() => setBasic((b) => ({ ...b, signUpType: type }))}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    basic.signUpType === type ? 'bg-brand-blue text-white border-brand-blue' : 'border-slate-200 text-slate-500 hover:border-brand-blue/50'
                  }`}>
                  {type === 'Individual' ? '仅个人' : type === 'Team' ? '仅团队' : '个人/团队均可'}
                </button>
              ))}
            </div>
          </div>

          {/* Tracks */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">赛道</label>
            <div className="flex gap-2">
              <input value={trackInput} onChange={(e) => setTrackInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTrack()}
                placeholder="输入赛道名称后回车添加"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
              <button onClick={addTrack} className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {basic.tracks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {basic.tracks.map((t) => (
                  <span key={t.id} className="flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
                    {t.name}
                    <button onClick={() => removeTrack(t.id)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Green channel */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={basic.greenChannelEnabled}
              onChange={(e) => setBasic((b) => ({ ...b, greenChannelEnabled: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-brand-blue accent-brand-blue" />
            <span className="text-sm font-semibold text-slate-600">开启绿色通道（优秀项目可直接晋级半决赛）</span>
          </label>

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} disabled={!canNext1}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-brand-blue/90 transition-colors">
              下一步 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — 报名表单（FormBuilder, 全宽） */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-slate-500">配置参赛者报名时需要填写的字段</p>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> 上一步
              </button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors">
                下一步 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 glass-card overflow-hidden min-h-0">
            <FormBuilder mode="form" />
          </div>
        </div>
      )}

      {/* Step 3 — 评审字段（FormBuilder review mode） */}
      {step === 3 && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-slate-500">配置评委打分的维度与分值</p>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> 上一步
              </button>
              <button onClick={() => setStep(4)} className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors">
                下一步 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 glass-card overflow-hidden min-h-0">
            <FormBuilder mode="review" />
          </div>
        </div>
      )}

      {/* Step 4 — 预览确认 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-700">预览确认</h2>
            <div className="space-y-2 text-sm">
              {[
                ['赛事名称', basic.name],
                ['参赛类型', basic.signUpType === 'Individual' ? '仅个人' : basic.signUpType === 'Team' ? '仅团队' : '个人/团队均可'],
                ['报名时间', `${basic.signUpStart} ～ ${basic.signUpEnd}`],
                ['比赛时间', basic.matchStart ? `${basic.matchStart} ～ ${basic.matchEnd}` : '待定'],
                ['举办地点', basic.location || '待定'],
                ['绿色通道', basic.greenChannelEnabled ? '已开启' : '未开启'],
                ['赛道数量', `${basic.tracks.length} 个`],
                ['报名表单', `${formFields.length} 个字段`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> 上一步
            </button>
            <button onClick={handlePublish} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              <Check className="w-4 h-4" /> {submitting ? '保存中…' : '保存草稿'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
