import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckSquare, Square, Upload, X, Check, ShieldCheck } from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import type { RegistrationRecord } from '@/types/project'
import { cn } from '@/lib/utils'

// ── Qualification options ──────────────────────────────────────────────────────

const QUALIFICATIONS = [
  {
    id: 'major-award',
    label: '重大赛事获奖',
    desc: '在国家级或省部级创业、科技类赛事中获得三等奖以上荣誉',
  },
  {
    id: 'core-patent',
    label: '核心知识产权',
    desc: '拥有授权发明专利 3 项以上，或具有重大行业影响力的核心知识产权',
  },
  {
    id: 'high-valuation',
    label: '高估值企业',
    desc: '经权威机构评估，企业估值达到 1 亿元人民币以上',
  },
  {
    id: 'vc-backed',
    label: '知名机构投资',
    desc: '已获得经认证的知名风险投资机构投资，融资额度达一定规模',
  },
  {
    id: 'other',
    label: '其他突出条件',
    desc: '具备专家委员会可认定的其他突出条件，请在理由中详述',
  },
]

const IC = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white resize-none'

// ── Main page ──────────────────────────────────────────────────────────────────

export default function GreenChannelPage() {
  const { regId } = useParams<{ regId: string }>()
  const navigate = useNavigate()
  const { projectsV3, updateRegistrationV3 } = useProjectDashboardStore()
  const fileRef = useRef<HTMLInputElement>(null)

  // Locate registration across all projects
  let foundProjectId = ''
  let foundReg: RegistrationRecord | undefined
  for (const p of projectsV3) {
    const r = p.registrations.find((r) => r.id === regId)
    if (r) { foundProjectId = p.id; foundReg = r; break }
  }

  const [qualifications, setQualifications] = useState<Set<string>>(
    new Set(foundReg?.greenChannelQualifications ?? []),
  )
  const [reason, setReason] = useState(foundReg?.greenChannelReason ?? '')
  const [files, setFiles] = useState<{ name: string; size: string; fileType: string }[]>(
    foundReg?.greenChannelFiles ?? [],
  )
  const [committed, setCommitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(foundReg?.greenChannelApplied ?? false)

  if (!foundReg) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
        <p className="text-sm">报名记录不存在</p>
        <button onClick={() => navigate(-1)} className="text-sm text-brand-blue hover:underline">
          返回
        </button>
      </div>
    )
  }

  function toggleQual(id: string) {
    setQualifications((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const added = Array.from(e.target.files ?? []).map((f) => ({
      name: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${(f.size / 1024).toFixed(0)} KB`,
      fileType: f.name.split('.').pop()?.toUpperCase() ?? '',
    }))
    setFiles((prev) => [...prev, ...added])
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  function canSubmit() {
    return qualifications.size > 0 && reason.trim().length >= 10 && committed
  }

  function handleSubmit() {
    if (!canSubmit()) return
    setSubmitting(true)
    setTimeout(() => {
      updateRegistrationV3(foundProjectId, foundReg!.id, {
        greenChannelApplied: true,
        greenChannelReason: reason.trim(),
        greenChannelQualifications: Array.from(qualifications),
        greenChannelFiles: files,
      })
      setSubmitting(false)
      setDone(true)
    }, 600)
  }

  if (done && !foundReg.greenChannelApplied) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex flex-col items-center py-16 gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-slate-800">申请已提交</p>
            <p className="text-sm text-slate-400 mt-1">破格通道申请已提交，等待赛事方审核</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
          >
            返回报名记录
          </button>
        </div>
      </div>
    )
  }

  const isAlreadyApplied = foundReg.greenChannelApplied

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">破格通道申请</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {foundReg.competitionName} · {foundReg.declarationName}
          </p>
        </div>
      </div>

      {/* Already-applied banner */}
      {isAlreadyApplied && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-700">破格申请已提交</p>
            <p className="text-xs text-emerald-600 mt-0.5">以下内容为已提交信息，如需修改请联系赛事方</p>
          </div>
        </div>
      )}

      {/* Qualification checkboxes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <p className="text-sm font-bold text-slate-700">符合的破格条件</p>
          <p className="text-xs text-slate-400 mt-0.5">可多选，至少选择一项</p>
        </div>
        <div className="space-y-2">
          {QUALIFICATIONS.map((q) => {
            const checked = qualifications.has(q.id)
            return (
              <button
                key={q.id}
                disabled={isAlreadyApplied}
                onClick={() => toggleQual(q.id)}
                className={cn(
                  'w-full text-left flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all',
                  checked
                    ? 'border-brand-blue bg-brand-blue/5'
                    : 'border-slate-100 hover:border-slate-200',
                  isAlreadyApplied && 'cursor-default opacity-80',
                )}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {checked
                    ? <CheckSquare className="w-4 h-4 text-brand-blue" />
                    : <Square className="w-4 h-4 text-slate-300" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{q.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{q.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Reason textarea */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div>
          <p className="text-sm font-bold text-slate-700">
            申请理由详述 <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">结合所选条件，描述具体破格依据（不少于 10 字）</p>
        </div>
        <textarea
          rows={5}
          value={reason}
          readOnly={isAlreadyApplied}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例如：本项目荣获 2024 年第三届全国医疗 AI 创新大赛一等奖，并拥有 3 项已授权发明专利，符合破格条件……"
          className={cn(IC, isAlreadyApplied && 'bg-slate-50 text-slate-500')}
        />
        <p className="text-right text-xs text-slate-400">{reason.length} 字</p>
      </div>

      {/* File upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div>
          <p className="text-sm font-bold text-slate-700">佐证材料</p>
          <p className="text-xs text-slate-400 mt-0.5">上传获奖证书、专利证书、融资协议等（支持 PDF / 图片，可多个）</p>
        </div>

        {files.length > 0 && (
          <ul className="space-y-1.5">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-slate-400 uppercase w-8 flex-shrink-0">{f.fileType}</span>
                <span className="flex-1 text-xs text-slate-600 truncate">{f.name}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{f.size}</span>
                {!isAlreadyApplied && (
                  <button
                    onClick={() => removeFile(i)}
                    className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!isAlreadyApplied && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 w-full justify-center border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-400 hover:border-brand-blue/40 hover:text-brand-blue transition-colors"
            >
              <Upload className="w-4 h-4" />
              点击上传文件
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              onChange={handleFileAdd}
            />
          </>
        )}
      </div>

      {/* Commitment checkbox */}
      {!isAlreadyApplied && (
        <button
          onClick={() => setCommitted((v) => !v)}
          className="flex items-start gap-3 w-full text-left"
        >
          <span className="mt-0.5 flex-shrink-0">
            {committed
              ? <CheckSquare className="w-4 h-4 text-brand-blue" />
              : <Square className="w-4 h-4 text-slate-300" />}
          </span>
          <p className="text-xs text-slate-500 leading-relaxed">
            本人承诺以上所填信息及上传材料真实有效，如存在虚假申报，愿承担相应法律责任及取消资格处理。
          </p>
        </button>
      )}

      {/* Submit */}
      {!isAlreadyApplied && (
        <button
          disabled={!canSubmit() || submitting}
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-40 transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          {submitting ? '提交中…' : '提交破格申请'}
        </button>
      )}
    </div>
  )
}
