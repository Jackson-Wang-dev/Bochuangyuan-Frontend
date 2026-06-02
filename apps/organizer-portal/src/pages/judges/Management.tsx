import { useEffect, useState } from 'react'
import { judgeApi } from '@bochuangyuan/api'
import type { Judge, JudgeRole } from '@bochuangyuan/types'
import { Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react'

const ROLE_LABEL: Record<JudgeRole, string> = {
  Prelim: '初审',
  Semifinal: '复审',
  Final: '终审',
}

interface JudgeFormData {
  name: string
  org: string
  contact: string
  expertise: string
  role: JudgeRole | ''
}

const EMPTY_FORM: JudgeFormData = { name: '', org: '', contact: '', expertise: '', role: '' }

export default function JudgesManagementPage() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Judge | null>(null)
  const [form, setForm] = useState<JudgeFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    judgeApi.list().then((page) => {
      setJudges(page.list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (j: Judge) => {
    setEditing(j)
    setForm({
      name: j.name,
      org: j.org ?? '',
      contact: j.contact ?? '',
      expertise: j.expertise?.join(', ') ?? '',
      role: j.role ?? '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    const dto = {
      name: form.name,
      org: form.org || undefined,
      contact: form.contact || undefined,
      expertise: form.expertise ? form.expertise.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      role: (form.role as JudgeRole) || undefined,
    }
    try {
      if (editing) {
        const updated = await judgeApi.update(editing.judgeId, dto)
        setJudges((prev) => prev.map((j) => (j.judgeId === editing.judgeId ? updated : j)))
      } else {
        const created = await judgeApi.create(dto)
        setJudges((prev) => [created, ...prev])
      }
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (j: Judge) => {
    if (!confirm(`确认删除评委 ${j.name}？`)) return
    await judgeApi.remove(j.judgeId)
    setJudges((prev) => prev.filter((x) => x.judgeId !== j.judgeId))
  }

  const filtered = judges.filter((j) => !keyword || j.name.includes(keyword) || j.org?.includes(keyword))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">评委名册</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> 添加评委
        </button>
      </div>

      {/* Search */}
      <div className="relative w-60">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索姓名或机构"
          className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                {['姓名', '机构', '领域', '角色', '联系方式', '操作'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-12">暂无评委</td></tr>
              ) : (
                filtered.map((j) => (
                  <tr key={j.judgeId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700">{j.name}</td>
                    <td className="px-4 py-3 text-slate-500">{j.org ?? '--'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {j.expertise?.map((e) => (
                          <span key={e} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{e}</span>
                        )) ?? '--'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {j.role ? (
                        <span className="px-2.5 py-0.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full">
                          {ROLE_LABEL[j.role]}
                        </span>
                      ) : '--'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{j.contact ?? '--'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(j)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(j)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-in form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-800">{editing ? '编辑评委' : '添加评委'}</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {[
              { label: '姓名 *', key: 'name', placeholder: '请输入姓名' },
              { label: '机构', key: 'org', placeholder: '学校 / 企业' },
              { label: '联系方式', key: 'contact', placeholder: '邮箱 / 手机' },
              { label: '专业领域', key: 'expertise', placeholder: '多个领域用英文逗号分隔' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">{label}</label>
                <input value={form[key as keyof JudgeFormData] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">角色</label>
              <div className="flex gap-2 flex-wrap">
                {(['', 'Prelim', 'Semifinal', 'Final'] as const).map((r) => (
                  <button key={r} onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      form.role === r ? 'bg-brand-blue text-white border-brand-blue' : 'border-slate-200 text-slate-500 hover:border-brand-blue/50'
                    }`}>
                    {r === '' ? '不指定' : ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                取消
              </button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="flex items-center gap-2 px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50">
                <Check className="w-3.5 h-3.5" /> {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
