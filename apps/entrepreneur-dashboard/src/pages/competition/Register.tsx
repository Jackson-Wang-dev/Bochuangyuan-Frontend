import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { competitionApi, registrationApi } from '@bochuangyuan/api'
import type { Competition, RegistrationFormConfig, RegType } from '@bochuangyuan/types'
import { ArrowLeft, ArrowRight, Check, Briefcase, User } from 'lucide-react'

export default function CompetitionRegisterPage() {
  const { id: competitionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [comp, setComp] = useState<Competition | null>(null)
  const [formConfig, setFormConfig] = useState<RegistrationFormConfig | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [regType, setRegType] = useState<RegType>('Individual')
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isExistingProject, setIsExistingProject] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!competitionId) return
    Promise.all([
      competitionApi.get(competitionId),
      competitionApi.formConfig.get(competitionId).catch(() => null),
    ]).then(([c, fc]) => {
      setComp(c)
      setFormConfig(fc)
    })
  }, [competitionId])

  const handleSubmit = async () => {
    if (!competitionId) return
    setSubmitting(true)
    try {
      const reg = await registrationApi.submitPreReg({
        competitionId,
        projectId: formValues['projectId'] ?? '',
        regType,
        formValues,
        isExistingProject,
      })
      navigate(`/competition/registrations/${reg.regId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!comp) {
    return <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
  }

  const fields = formConfig?.formFields ?? []

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">报名</h1>
          <p className="text-sm text-slate-400">{comp.name}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['选择参赛方式', '填写报名信息'] as const).map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
              step === i + 1 ? 'bg-brand-blue text-white' : step > i + 1 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              {step > i + 1 ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
              {label}
            </div>
            {i < 1 && <div className="w-6 h-0.5 bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Step 1 — 参赛方式 */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Type selection */}
          {comp.signUpType !== 'Team' && (
            <button
              onClick={() => setRegType('Individual')}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                regType === 'Individual' ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className={`w-6 h-6 ${regType === 'Individual' ? 'text-brand-blue' : 'text-slate-400'}`} />
                <div>
                  <p className="font-bold text-slate-800">个人参赛</p>
                  <p className="text-sm text-slate-500">以个人名义参加</p>
                </div>
                {regType === 'Individual' && <Check className="ml-auto w-5 h-5 text-brand-blue" />}
              </div>
            </button>
          )}

          {comp.signUpType !== 'Individual' && (
            <button
              onClick={() => setRegType('Team')}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                regType === 'Team' ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className={`w-6 h-6 ${regType === 'Team' ? 'text-brand-blue' : 'text-slate-400'}`} />
                <div>
                  <p className="font-bold text-slate-800">团队参赛</p>
                  <p className="text-sm text-slate-500">以团队名义参加</p>
                </div>
                {regType === 'Team' && <Check className="ml-auto w-5 h-5 text-brand-blue" />}
              </div>
            </button>
          )}

          <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={isExistingProject} onChange={(e) => setIsExistingProject(e.target.checked)}
              className="w-4 h-4 accent-brand-blue" />
            <span className="text-sm text-slate-600">使用已有项目报名</span>
          </label>

          <div className="flex justify-end">
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors">
              下一步 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — 报名表单 */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="glass-card p-6 space-y-4">
            {fields.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无需要填写的报名字段</p>
            ) : (
              fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-600">
                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select value={formValues[field.key] ?? ''} onChange={(e) => setFormValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
                      <option value="">请选择</option>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={formValues[field.key] ?? ''} onChange={(e) => setFormValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" />
                  ) : (
                    <input type={field.type === 'number' ? 'number' : 'text'}
                      value={formValues[field.key] ?? ''} onChange={(e) => setFormValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> 上一步
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-colors">
              <Check className="w-4 h-4" /> {submitting ? '提交中…' : '提交预报名'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
