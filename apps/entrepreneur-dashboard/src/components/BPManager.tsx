import React from 'react'
import { Plus, Upload, MoreHorizontal, FileText, Search, Clock, CheckCircle2 } from 'lucide-react'
import type { DocumentResponse } from '@bochuangyuan/api'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'motion/react'

interface Props {
  documents: DocumentResponse[]
  loading?: boolean
  uploading?: boolean
  onCreateNew: () => void
  onEdit: (doc: DocumentResponse) => void
  onPreview: (doc: DocumentResponse) => void
  onUpload: (file: File) => void
}

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} 小时前`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays} 天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function fileIconColor(mimeType: string): string {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bg-emerald-50 text-emerald-600'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'bg-orange-50 text-orange-600'
  if (mimeType.includes('pdf')) return 'bg-rose-50 text-rose-600'
  return 'bg-blue-50 text-brand-blue'
}

export const BPManager: React.FC<Props> = ({
  documents,
  loading,
  uploading,
  onCreateNew,
  onEdit,
  onPreview,
  onUpload,
}) => {
  const [search, setSearch] = React.useState('')
  const [showCopySuccess, setShowCopySuccess] = React.useState(false)

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowCopySuccess(true)
    setTimeout(() => setShowCopySuccess(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[1000] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            链接已复制
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索商业计划书"
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all focus:border-brand-blue/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateNew}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-blue/90 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            新建BP
          </button>
          <label
            className={cn(
              'flex items-center gap-2 px-4 py-2 bg-white border border-brand-blue text-brand-blue rounded-lg text-sm font-bold hover:bg-brand-blue/5 transition-all cursor-pointer active:scale-95',
              uploading && 'opacity-60 cursor-not-allowed pointer-events-none',
            )}
          >
            <Upload className="w-4 h-4" />
            {uploading ? '上传中...' : '导入'}
            <input
              type="file"
              className="hidden"
              accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* BP Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl shadow-sm h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-all group overflow-visible relative"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', fileIconColor(doc.mime_type))}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                    {doc.name}
                  </h3>
                </div>
                <div className="relative group/menu">
                  <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 py-1 overflow-hidden">
                    <button
                      onClick={handleCopyLink}
                      className="w-full text-left px-4 py-2 text-[11px] font-bold text-brand-blue hover:bg-brand-blue/5 transition-colors"
                    >
                      复制链接
                    </button>
                    <div className="h-[1px] bg-slate-50 my-1" />
                    <button
                      onClick={() => {
                        import('@bochuangyuan/api').then(({ documentsApi }) => {
                          documentsApi.download(doc.id).then((url) => {
                            const a = document.createElement('a')
                            a.href = url
                            a.download = doc.name
                            a.click()
                          })
                        })
                      }}
                      className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      下载
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-4">
                <div
                  className="aspect-[1.4/1] bg-slate-50/50 rounded-xl border border-slate-100 relative overflow-hidden flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => onPreview(doc)}
                >
                  <div className="w-full space-y-1.5 opacity-10 px-6">
                    <div className="h-1 bg-slate-400 rounded w-1/4" />
                    <div className="h-1 bg-slate-400 rounded w-full" />
                    <div className="h-1 bg-slate-400 rounded w-full" />
                    <div className="h-1 bg-slate-400 rounded w-3/4" />
                  </div>
                  <span className="absolute px-5 py-2 bg-white shadow-lg shadow-blue-500/5 rounded-full text-[11px] font-bold text-brand-blue hover:scale-105 transition-all z-10">
                    预览内容
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Clock className="w-3 h-3" />
                    <span>修改于 {formatUpdatedAt(doc.updated_at)}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono">v{doc.version}</span>
                </div>

                <button
                  onClick={() => onEdit(doc)}
                  className="w-full py-2 bg-brand-blue text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                >
                  编辑
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-bold">
                {search ? '未找到匹配的商业计划书' : '暂无商业计划书'}
              </p>
              {!search && (
                <button onClick={onCreateNew} className="mt-4 text-brand-blue text-sm font-bold hover:underline">
                  点击上传创建
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
