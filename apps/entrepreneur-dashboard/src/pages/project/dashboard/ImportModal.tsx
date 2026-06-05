import { useRef, useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import type { Project } from '@/types/project'
import { cn } from '@/lib/utils'

// ── Field mapping: CSV header aliases → project field paths ──────────────────
//
// Key: lowercased, de-spaced CSV column header (supports Chinese and English)
// Value: { path: dot-path into Project, label: display label, type: data type }

interface FieldDef {
  path: string
  label: string
  type: 'string' | 'number'
}

const HEADER_MAP: Record<string, FieldDef> = {
  '项目名称':          { path: 'projectName',                  label: '项目正式名称',     type: 'string' },
  'projectname':       { path: 'projectName',                  label: '项目正式名称',     type: 'string' },
  '申报用名':          { path: 'declarationName',              label: '申报用名',         type: 'string' },
  'declarationname':   { path: 'declarationName',              label: '申报用名',         type: 'string' },
  '核心技术':          { path: 'coreTech',                     label: '核心技术',         type: 'string' },
  'coretech':          { path: 'coreTech',                     label: '核心技术',         type: 'string' },
  '项目简介':          { path: 'projectBrief',                 label: '项目简介',         type: 'string' },
  'projectbrief':      { path: 'projectBrief',                 label: '项目简介',         type: 'string' },
  '项目背景':          { path: 'projectBackground',            label: '项目背景意义',     type: 'string' },
  '项目内容':          { path: 'projectContent',               label: '项目实施内容',     type: 'string' },
  '预期贡献':          { path: 'expectedContribution',         label: '预期贡献及验收指标', type: 'string' },
  '单位名称':          { path: 'orgInfo.name',                 label: '单位全称',         type: 'string' },
  '单位类型':          { path: 'orgInfo.orgType',              label: '单位类型',         type: 'string' },
  '统一社会信用代码':  { path: 'orgInfo.creditCode',           label: '社会信用代码',     type: 'string' },
  'creditcode':        { path: 'orgInfo.creditCode',           label: '社会信用代码',     type: 'string' },
  '注册资本':          { path: 'orgInfo.registeredCapital',    label: '注册资本（万元）', type: 'number' },
  '员工总数':          { path: 'orgInfo.totalEmployees',       label: '员工总数',         type: 'number' },
  'totalemployees':    { path: 'orgInfo.totalEmployees',       label: '员工总数',         type: 'number' },
  '年研发投入':        { path: 'orgInfo.rdExpenditure',        label: '年研发投入（万元）', type: 'number' },
  'rdexpenditure':     { path: 'orgInfo.rdExpenditure',        label: '年研发投入（万元）', type: 'number' },
  '年营业收入':        { path: 'orgInfo.totalRevenue',         label: '年营业收入（万元）', type: 'number' },
  'totalrevenue':      { path: 'orgInfo.totalRevenue',         label: '年营业收入（万元）', type: 'number' },
  '累计融资额':        { path: 'orgInfo.totalFunding',         label: '累计融资额（万元）', type: 'number' },
  'totalfunding':      { path: 'orgInfo.totalFunding',         label: '累计融资额（万元）', type: 'number' },
  '融资轮次':          { path: 'orgInfo.fundingRound',         label: '融资轮次',         type: 'string' },
  '总投入预测':        { path: 'totalInvestmentForecast',      label: '项目总投入预测（万元）', type: 'number' },
  '联系人':            { path: 'orgInfo.contactPerson',        label: '联系人',           type: 'string' },
  '联系电话':          { path: 'orgInfo.contactPhone',         label: '联系人手机',       type: 'string' },
  '单位地址':          { path: 'orgInfo.address',              label: '单位地址',         type: 'string' },
  '研发人员数':        { path: 'orgInfo.rdPersonnelCount',     label: '研发人员数',       type: 'number' },
}

// ── CSV parser ────────────────────────────────────────────────────────────────

/**
 * Parse a two-column CSV (one field per row):
 *   字段名,值
 *   项目名称,NovaMed AI辅助诊断
 *
 * OR a header-row CSV (one data row):
 *   项目名称,核心技术,年营业收入
 *   NovaMed AI辅助诊断,大语言模型,80
 *
 * Returns a flat { normalizedHeader: rawValue } map.
 */
function parseCSV(text: string): Record<string, string> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return {}

  // Split a single CSV line respecting quoted fields
  function splitLine(line: string): string[] {
    const cols: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuote = !inQuote
      } else if (ch === ',' && !inQuote) {
        cols.push(cur.trim()); cur = ''
      } else {
        cur += ch
      }
    }
    cols.push(cur.trim())
    return cols
  }

  const firstRow = splitLine(lines[0]!)

  // Two-column format: first column = field name, second = value
  if (firstRow.length === 2 && lines.length >= 2) {
    const result: Record<string, string> = {}
    // Check if it looks like key-value pairs (first row has a recognizable key)
    const isKV = lines.every((l) => splitLine(l).length === 2)
    if (isKV) {
      for (const line of lines) {
        const [key, val] = splitLine(line)
        if (key && val !== undefined) {
          result[key.toLowerCase().replace(/\s/g, '')] = val
        }
      }
      return result
    }
  }

  // Header-row format: first row = headers, second row = values
  const headers = firstRow
  const dataRow = lines[1] ? splitLine(lines[1]) : []
  const result: Record<string, string> = {}
  headers.forEach((h, i) => {
    const val = dataRow[i]
    if (h && val !== undefined) {
      result[h.toLowerCase().replace(/\s/g, '')] = val
    }
  })
  return result
}

// ── Apply import result to project ───────────────────────────────────────────

export interface ImportMatch {
  csvKey: string
  def: FieldDef
  rawValue: string
  parsedValue: string | number
}

export function applyImportMatches(project: Project, matches: ImportMatch[]): Partial<Project> {
  // Deep-clone the parts we might touch
  const patch: Record<string, unknown> = {}
  let orgInfoPatch: Record<string, unknown> = {}

  for (const m of matches) {
    const { path, type } = m.def
    const value = type === 'number' ? (Number(m.rawValue) || 0) : m.rawValue

    if (path.startsWith('orgInfo.')) {
      const key = path.slice('orgInfo.'.length)
      orgInfoPatch[key] = value
    } else {
      patch[path] = value
    }
  }

  if (Object.keys(orgInfoPatch).length > 0) {
    patch['orgInfo'] = { ...project.orgInfo, ...orgInfoPatch }
  }

  return patch as Partial<Project>
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ImportModalProps {
  project: Project
  onClose: () => void
  onConfirm: (patch: Partial<Project>, description: string) => void
}

export default function ImportModal({ project, onClose, onConfirm }: ImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [matches, setMatches] = useState<ImportMatch[]>([])
  const [unmatched, setUnmatched] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState(false)

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('请上传 CSV 格式文件（.csv）。Excel 文件请先另存为 CSV。')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const raw = parseCSV(text)
        const matched: ImportMatch[] = []
        const noMatch: string[] = []

        for (const [key, val] of Object.entries(raw)) {
          const def = HEADER_MAP[key]
          if (def) {
            matched.push({
              csvKey: key,
              def,
              rawValue: val,
              parsedValue: def.type === 'number' ? (Number(val) || 0) : val,
            })
          } else {
            noMatch.push(key)
          }
        }

        if (matched.length === 0 && noMatch.length > 0) {
          setError('未能识别任何字段。请检查列标题是否与模板一致（示例：项目名称、核心技术、年营业收入…）')
          return
        }

        setMatches(matched)
        setUnmatched(noMatch)
        setFileName(file.name)
        setParsed(true)
      } catch {
        setError('文件解析失败，请确认是有效的 CSV 格式')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleConfirm() {
    if (matches.length === 0) return
    const patch = applyImportMatches(project, matches)
    onConfirm(patch, `从表格导入 ${matches.length} 个字段（${fileName ?? 'CSV'}）`)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="font-bold text-slate-800">导入本地表格</p>
            <p className="text-xs text-slate-400 mt-0.5">解析 CSV → 映射字段 → 预填确认</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* Drop zone */}
          {!parsed && (
            <div
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer',
                error ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-brand-blue hover:bg-brand-blue/5',
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">点击选择或拖拽 CSV 文件</p>
              <p className="text-xs text-slate-400 mt-1">支持 .csv（Excel 请先另存为 CSV）</p>
              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          )}

          {/* Format hint */}
          {!parsed && (
            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 支持的 CSV 格式（两种）
              </p>
              <p className="font-semibold">① 竖向（每行一个字段）：</p>
              <pre className="bg-white rounded-lg p-2 overflow-x-auto leading-relaxed">
{`字段名,值
项目名称,NovaMed AI辅助诊断
核心技术,大语言模型
年营业收入,80`}
              </pre>
              <p className="font-semibold mt-2">② 横向（首行标题，第二行数据）：</p>
              <pre className="bg-white rounded-lg p-2 overflow-x-auto leading-relaxed">
{`项目名称,核心技术,年营业收入
NovaMed AI辅助诊断,大语言模型,80`}
              </pre>
            </div>
          )}

          {/* Preview */}
          {parsed && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-slate-700">
                  识别到 {matches.length} 个字段
                  {unmatched.length > 0 && (
                    <span className="text-slate-400 font-normal ml-1">
                      （{unmatched.length} 个未识别）
                    </span>
                  )}
                </p>
              </div>

              {matches.length > 0 && (
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-3 py-2 text-slate-500 font-semibold w-2/5">字段</th>
                        <th className="text-left px-3 py-2 text-slate-500 font-semibold">导入值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((m) => (
                        <tr key={m.def.path} className="border-b border-slate-50 last:border-0">
                          <td className="px-3 py-2 text-slate-600 font-medium">{m.def.label}</td>
                          <td className="px-3 py-2 text-slate-800 font-semibold truncate max-w-[200px]">
                            {m.def.type === 'number'
                              ? `${m.parsedValue} ${m.def.label.includes('万') ? '万元' : ''}`
                              : String(m.parsedValue) || '—'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {unmatched.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-amber-700">未识别的列（将跳过）</p>
                  </div>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    {unmatched.join('、')}
                  </p>
                </div>
              )}

              <button
                onClick={() => { setParsed(false); setMatches([]); setUnmatched([]); setFileName(null) }}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                重新上传
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsed || matches.length === 0}
            className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            确认导入 {parsed && matches.length > 0 ? `（${matches.length} 项）` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
