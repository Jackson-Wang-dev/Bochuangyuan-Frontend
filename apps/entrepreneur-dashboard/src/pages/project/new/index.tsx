import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Upload, FileText, Check, X, Plus } from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import { PDF_EXTRACTION_PRESET, type ProjectV2, type MaturityLevel } from '@/mock/projectMock'
import { cn } from '@/lib/utils'

type EntryMode = 'choose' | 'pdf-uploading' | 'form'

const MATURITY_OPTIONS: MaturityLevel[] = ['概念', '原型', '小试', '中试', '量产']

const TRACKS = ['医疗健康', '新能源', '智慧城市', '人工智能', '智慧物流', '先进制造', '农业科技', '其他']

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-2 border-b border-slate-100 mb-4">
      <h3 className="text-sm font-bold text-slate-700">{children}</h3>
    </div>
  )
}

function Field({ label, required, hint, children }: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

const INPUT_CLS = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white'
const TEXTAREA_CLS = `${INPUT_CLS} resize-none`

interface FormState {
  displayName: string
  officialName: string
  track: string
  coreTech: string
  relatedEnterprise: string
  teamLead: string
  teamSize: string
  fundingAmount: string
  patentCount: string
  maturityLevel: MaturityLevel
  businessScopeInput: string
  businessScope: string[]
  briefIntro: string
  leaderInfo: string
  teamMembersDesc: string
  honors: string
  papers: string
  personalStatement: string
}

const EMPTY_FORM: FormState = {
  displayName: '', officialName: '', track: '', coreTech: '',
  relatedEnterprise: '', teamLead: '',
  teamSize: '', fundingAmount: '', patentCount: '',
  maturityLevel: '概念',
  businessScopeInput: '', businessScope: [],
  briefIntro: '', leaderInfo: '', teamMembersDesc: '',
  honors: '', papers: '', personalStatement: '',
}

function formFromPreset(preset: Partial<ProjectV2>): FormState {
  return {
    displayName: preset.displayName ?? '',
    officialName: preset.officialName ?? '',
    track: preset.track ?? '',
    coreTech: preset.coreTech ?? '',
    relatedEnterprise: preset.relatedEnterprise ?? '',
    teamLead: preset.teamLead ?? '',
    teamSize: String(preset.teamSize ?? ''),
    fundingAmount: String(preset.fundingAmount ?? ''),
    patentCount: String(preset.patentCount ?? ''),
    maturityLevel: preset.maturityLevel ?? '概念',
    businessScopeInput: '',
    businessScope: preset.businessScope ?? [],
    briefIntro: preset.briefIntro ?? '',
    leaderInfo: preset.leaderInfo ?? '',
    teamMembersDesc: preset.teamMembersDesc ?? '',
    honors: preset.honors ?? '',
    papers: preset.papers ?? '',
    personalStatement: preset.personalStatement ?? '',
  }
}

export default function ProjectNewPage() {
  const navigate = useNavigate()
  const { addProject } = useProjectDashboardStore()
  const [mode, setMode] = useState<EntryMode>('choose')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addScope() {
    const v = form.businessScopeInput.trim()
    if (!v || form.businessScope.includes(v)) return
    setForm((f) => ({ ...f, businessScope: [...f.businessScope, v], businessScopeInput: '' }))
  }

  function removeScope(s: string) {
    setForm((f) => ({ ...f, businessScope: f.businessScope.filter((x) => x !== s) }))
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.pdf')) {
      alert('仅支持 PDF 格式')
      return
    }
    setPdfName(file.name)
    setMode('pdf-uploading')
    setTimeout(() => {
      setForm(formFromPreset(PDF_EXTRACTION_PRESET))
      setMode('form')
    }, 1800)
  }

  function handleSubmit() {
    if (!form.displayName.trim()) {
      alert('请填写项目展示名')
      return
    }
    const now = new Date().toISOString()
    const id = `proj-${Date.now()}`
    const newProject: ProjectV2 = {
      id,
      displayName: form.displayName.trim(),
      officialName: form.officialName.trim(),
      track: form.track,
      coreTech: form.coreTech.trim(),
      relatedEnterprise: form.relatedEnterprise.trim(),
      teamLead: form.teamLead.trim(),
      teamSize: parseInt(form.teamSize) || 1,
      fundingAmount: parseFloat(form.fundingAmount) || 0,
      patentCount: parseInt(form.patentCount) || 0,
      maturityLevel: form.maturityLevel,
      businessScope: form.businessScope,
      briefIntro: form.briefIntro.trim(),
      leaderInfo: form.leaderInfo.trim(),
      teamMembersDesc: form.teamMembersDesc.trim(),
      honors: form.honors.trim(),
      papers: form.papers.trim(),
      personalStatement: form.personalStatement.trim(),
      pdfFiles: pdfName ? [{ name: pdfName, size: '—' }] : [],
      otherMaterials: [],
      createdAt: now,
      updatedAt: now,
      events: [
        {
          id: `ev-${Date.now()}`,
          type: '维护编辑',
          timestamp: now,
          description: '创建项目',
          snapshot: {
            teamSize: parseInt(form.teamSize) || 1,
            fundingAmount: parseFloat(form.fundingAmount) || 0,
            patentCount: parseInt(form.patentCount) || 0,
            maturityLevel: form.maturityLevel,
            businessScope: form.businessScope,
          },
        },
      ],
    }
    addProject(newProject)
    navigate(`/project/${id}`)
  }

  // ── Mode: choose entry ─────────────────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/project')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">新建项目</h1>
            <p className="text-sm text-slate-400">选择录入方式</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* PDF upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-blue/40 hover:bg-brand-blue/3 text-left transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-blue/15 transition-colors">
              <Upload className="w-6 h-6 text-brand-blue" />
            </div>
            <p className="font-bold text-slate-800 mb-1">上传 BP / 申报书</p>
            <p className="text-sm text-slate-500">上传 PDF，自动提取关键字段，核对后保存</p>
            <p className="text-xs text-slate-400 mt-2">仅支持 .pdf 格式</p>
          </button>

          {/* Manual */}
          <button
            onClick={() => setMode('form')}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-blue/40 hover:bg-brand-blue/3 text-left transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">手动填写</p>
            <p className="text-sm text-slate-500">直接填写结构化表单，按字段逐项录入</p>
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
      </div>
    )
  }

  // ── Mode: PDF extracting ───────────────────────────────────────────────────
  if (mode === 'pdf-uploading') {
    return (
      <div className="max-w-2xl flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="font-bold text-slate-800 text-lg">正在解析文档…</p>
          <p className="text-sm text-slate-400 mt-1">AI 正在从 {pdfName} 中提取结构化字段</p>
        </div>
      </div>
    )
  }

  // ── Mode: form ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/project')} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">新建项目</h1>
          {pdfName && (
            <p className="text-sm text-emerald-600 flex items-center gap-1 mt-0.5">
              <Check className="w-3.5 h-3.5" /> 已从 {pdfName} 提取字段，请核对修改
            </p>
          )}
        </div>
      </div>

      {/* Section 1: Identity */}
      <div className="glass-card p-6 space-y-4">
        <SectionTitle>基本身份信息</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="项目展示名" required hint="面向评委的简短名称">
            <input className={INPUT_CLS} value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="例：NovaMed AI 辅助诊断" />
          </Field>
          <Field label="正式申报用名" hint="与申报材料完全一致">
            <input className={INPUT_CLS} value={form.officialName} onChange={(e) => set('officialName', e.target.value)} placeholder="例：基于大模型的医学影像 AI 辅助诊断系统" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="赛道 / 领域">
            <select className={INPUT_CLS} value={form.track} onChange={(e) => set('track', e.target.value)}>
              <option value="">请选择</option>
              {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="核心技术 / 依托专利" hint="项目唯一性锚点">
            <input className={INPUT_CLS} value={form.coreTech} onChange={(e) => set('coreTech', e.target.value)} placeholder="例：GNN 专利 ZL202410001234.5" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="关联企业" hint="从企业管理同步（V1 手动填写）">
            <input className={INPUT_CLS} value={form.relatedEnterprise} onChange={(e) => set('relatedEnterprise', e.target.value)} placeholder="企业全称（可留空）" />
          </Field>
          <Field label="团队负责人" hint="从个人档案 import（V1 手动填写）">
            <input className={INPUT_CLS} value={form.teamLead} onChange={(e) => set('teamLead', e.target.value)} placeholder="负责人姓名" />
          </Field>
        </div>
      </div>

      {/* Section 2: Growth Dimensions */}
      <div className="glass-card p-6 space-y-4">
        <SectionTitle>成长维度</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <Field label="团队规模（人）">
            <input type="number" min={1} className={INPUT_CLS} value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)} placeholder="0" />
          </Field>
          <Field label="融资额（万元）">
            <input type="number" min={0} className={INPUT_CLS} value={form.fundingAmount} onChange={(e) => set('fundingAmount', e.target.value)} placeholder="0" />
          </Field>
          <Field label="专利数（项）">
            <input type="number" min={0} className={INPUT_CLS} value={form.patentCount} onChange={(e) => set('patentCount', e.target.value)} placeholder="0" />
          </Field>
        </div>
        <Field label="项目成熟度">
          <div className="flex gap-2 flex-wrap">
            {MATURITY_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm((f) => ({ ...f, maturityLevel: m }))}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-semibold border transition-all',
                  form.maturityLevel === m
                    ? 'border-brand-blue bg-brand-blue/8 text-brand-blue'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
        <Field label="业务范围（标签）">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className={cn(INPUT_CLS, 'flex-1')}
                value={form.businessScopeInput}
                onChange={(e) => setForm((f) => ({ ...f, businessScopeInput: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addScope() } }}
                placeholder="输入标签后按 Enter 或点击添加"
              />
              <button type="button" onClick={addScope} className="px-3 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-sm font-bold hover:bg-brand-blue/15 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.businessScope.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {form.businessScope.map((s) => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-brand-blue/8 text-brand-blue rounded-full text-xs font-semibold">
                    {s}
                    <button onClick={() => removeScope(s)} className="hover:text-rose-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Field>
      </div>

      {/* Section 3: Content Blocks */}
      <div className="glass-card p-6 space-y-4">
        <SectionTitle>可复用内容块</SectionTitle>
        <Field label="项目简介">
          <textarea rows={3} className={TEXTAREA_CLS} value={form.briefIntro} onChange={(e) => set('briefIntro', e.target.value)} placeholder="300 字以内，报名时预填用" />
        </Field>
        <Field label="带头人信息" hint="从个人档案 import（V1 手动填写）">
          <textarea rows={2} className={TEXTAREA_CLS} value={form.leaderInfo} onChange={(e) => set('leaderInfo', e.target.value)} placeholder="职称、教育背景、核心经历" />
        </Field>
        <Field label="团队成员">
          <textarea rows={2} className={TEXTAREA_CLS} value={form.teamMembersDesc} onChange={(e) => set('teamMembersDesc', e.target.value)} placeholder="主要成员姓名、分工、背景" />
        </Field>
        <Field label="荣誉获奖">
          <textarea rows={2} className={TEXTAREA_CLS} value={form.honors} onChange={(e) => set('honors', e.target.value)} placeholder="相关获奖记录、荣誉称号" />
        </Field>
        <Field label="代表性著作 / 论文">
          <textarea rows={2} className={TEXTAREA_CLS} value={form.papers} onChange={(e) => set('papers', e.target.value)} placeholder="已发表论文、著作、报告" />
        </Field>
        <Field label="个人陈述">
          <textarea rows={3} className={TEXTAREA_CLS} value={form.personalStatement} onChange={(e) => set('personalStatement', e.target.value)} placeholder="创业初心与愿景" />
        </Field>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-4">
        <button onClick={() => navigate('/project')} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          取消
        </button>
        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors">
          <ArrowRight className="w-4 h-4" /> 创建项目
        </button>
      </div>
    </div>
  )
}
