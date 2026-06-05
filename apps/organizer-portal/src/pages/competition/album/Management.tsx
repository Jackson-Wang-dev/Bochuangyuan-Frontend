import { useState } from 'react'
import { Image, Upload, Trash2, Tag, Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlbumCategory = 'all' | 'official' | 'participant' | 'award'

interface PhotoItem {
  id: string
  url: string
  caption: string
  category: Exclude<AlbumCategory, 'all'>
  takenAt: string
  size: string
}

const CATEGORY_CFG: Record<Exclude<AlbumCategory, 'all'>, { label: string; color: string }> = {
  official:    { label: '官方摄影', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  participant: { label: '选手上传', color: 'bg-violet-50 text-violet-600 border-violet-100' },
  award:       { label: '颁奖典礼', color: 'bg-amber-50 text-amber-700 border-amber-100' },
}

const GRADIENT_PLACEHOLDERS = [
  'from-blue-400 to-violet-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-green-500',
  'from-orange-400 to-red-500',
  'from-indigo-400 to-blue-500',
  'from-pink-400 to-rose-500',
  'from-green-400 to-emerald-500',
  'from-cyan-400 to-sky-500',
]

const MOCK_PHOTOS: PhotoItem[] = [
  { id: 'p-01', url: '', caption: '开幕式现场全景',           category: 'official',    takenAt: '2024-07-20', size: '4.2 MB' },
  { id: 'p-02', url: '', caption: '专家评委入场',             category: 'official',    takenAt: '2024-07-20', size: '3.8 MB' },
  { id: 'p-03', url: '', caption: '参赛队伍展示区',           category: 'participant', takenAt: '2024-07-20', size: '2.1 MB' },
  { id: 'p-04', url: '', caption: 'AI 算力平台项目路演',      category: 'official',    takenAt: '2024-09-20', size: '5.6 MB' },
  { id: 'p-05', url: '', caption: '评委讨论与打分环节',       category: 'official',    takenAt: '2024-09-20', size: '3.3 MB' },
  { id: 'p-06', url: '', caption: '选手现场演示产品',         category: 'participant', takenAt: '2024-09-20', size: '2.8 MB' },
  { id: 'p-07', url: '', caption: '一等奖颁奖典礼',           category: 'award',       takenAt: '2024-10-01', size: '6.1 MB' },
  { id: 'p-08', url: '', caption: '获奖团队合影留念',         category: 'award',       takenAt: '2024-10-01', size: '4.5 MB' },
  { id: 'p-09', url: '', caption: '主办方领导致辞',           category: 'official',    takenAt: '2024-10-01', size: '3.0 MB' },
  { id: 'p-10', url: '', caption: '参赛选手互动交流',         category: 'participant', takenAt: '2024-07-21', size: '1.9 MB' },
  { id: 'p-11', url: '', caption: '媒体采访环节',             category: 'official',    takenAt: '2024-10-01', size: '2.7 MB' },
  { id: 'p-12', url: '', caption: '颁奖典礼现场全体合影',     category: 'award',       takenAt: '2024-10-01', size: '7.2 MB' },
]

export default function AlbumManagementPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>(MOCK_PHOTOS)
  const [category, setCategory] = useState<AlbumCategory>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)

  const filtered = photos.filter((p) => category === 'all' || p.category === category)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDelete = () => {
    setPhotos((prev) => prev.filter((p) => !selected.has(p.id)))
    setSelected(new Set())
  }

  const handleUpload = async () => {
    setUploading(true)
    await new Promise((r) => setTimeout(r, 1200))
    const gradients = GRADIENT_PLACEHOLDERS
    const newPhoto: PhotoItem = {
      id: `p-${Date.now()}`,
      url: '',
      caption: '新上传图片',
      category: category === 'all' ? 'official' : category,
      takenAt: new Date().toISOString().slice(0, 10),
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
    }
    setPhotos((prev) => [newPhoto, ...prev])
    setUploading(false)
  }

  const totalSize = photos.reduce((s, p) => s + parseFloat(p.size), 0).toFixed(1)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-ink">赛事相册</h1>
          <p className="text-[13px] text-faint mt-1">管理赛事精彩图片，留存赛事记忆</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 border border-red-100 rounded-[9px] text-[13px] font-semibold hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除 {selected.size} 张
            </button>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-[9px] bg-brand text-white rounded-[9px] text-[13.5px] font-semibold hover:bg-brand-d disabled:opacity-70 transition-colors shadow-sm"
          >
            <Upload className="w-[15px] h-[15px]" />
            {uploading ? '上传中…' : '上传图片'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '全部图片',   count: photos.length,                                                  color: 'text-ink' },
          { label: '官方摄影',   count: photos.filter((p) => p.category === 'official').length,    color: 'text-blue-600' },
          { label: '选手上传',   count: photos.filter((p) => p.category === 'participant').length,  color: 'text-violet-600' },
          { label: '颁奖典礼',   count: photos.filter((p) => p.category === 'award').length,       color: 'text-amber-600' },
        ].map(({ label, count, color }) => (
          <div key={label} className="glass-card p-3 text-center space-y-0.5">
            <div className={cn('text-[22px] font-black tabular-nums', color)}>{count}</div>
            <div className="text-[11.5px] text-faint">{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="inline-flex bg-[#EEF0F4] rounded-[9px] p-[3px] gap-0.5">
          <button onClick={() => setCategory('all')}
            className={cn('text-[13px] font-medium px-[13px] py-[6px] rounded-[7px] transition-all', category === 'all' ? 'bg-panel text-ink font-semibold shadow-sm' : 'text-muted hover:text-ink')}>
            全部
          </button>
          {(Object.keys(CATEGORY_CFG) as Exclude<AlbumCategory, 'all'>[]).map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={cn('text-[13px] font-medium px-[13px] py-[6px] rounded-[7px] transition-all', category === cat ? 'bg-panel text-ink font-semibold shadow-sm' : 'text-muted hover:text-ink')}>
              {CATEGORY_CFG[cat].label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-[12px] text-faint">{totalSize} MB 已用</span>
        <div className="flex items-center gap-1 bg-[#EEF0F4] rounded-[8px] p-[3px]">
          <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-[6px] transition-all', view === 'grid' ? 'bg-panel shadow-sm' : 'text-faint hover:text-muted')}>
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setView('list')} className={cn('p-1.5 rounded-[6px] transition-all', view === 'list' ? 'bg-panel shadow-sm' : 'text-faint hover:text-muted')}>
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-4 gap-3">
          {filtered.map((photo, i) => {
            const grad = GRADIENT_PLACEHOLDERS[i % GRADIENT_PLACEHOLDERS.length]
            const isSel = selected.has(photo.id)
            return (
              <div
                key={photo.id}
                onClick={() => toggleSelect(photo.id)}
                className={cn(
                  'relative rounded-[10px] overflow-hidden cursor-pointer group border-2 transition-all',
                  isSel ? 'border-brand shadow-md' : 'border-transparent',
                )}
              >
                <div className={cn('h-36 bg-gradient-to-br flex items-center justify-center', grad)}>
                  <Image className="w-8 h-8 text-white/60" />
                </div>
                {isSel && (
                  <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-bold">✓</div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[11px] text-white font-medium truncate">{photo.caption}</p>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={cn('px-1.5 py-0.5 rounded-[4px] text-[9.5px] font-bold border', CATEGORY_CFG[photo.category].color)}>
                    {CATEGORY_CFG[photo.category].label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-line">
                <th className="text-left px-4 py-3 text-[12px] font-semibold text-faint w-10">
                  <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((p) => p.id)) : new Set())} />
                </th>
                <th className="text-left px-4 py-3 text-[12px] font-semibold text-faint">图片</th>
                <th className="text-left px-4 py-3 text-[12px] font-semibold text-faint">描述</th>
                <th className="text-left px-4 py-3 text-[12px] font-semibold text-faint">分类</th>
                <th className="text-left px-4 py-3 text-[12px] font-semibold text-faint">拍摄日期</th>
                <th className="text-left px-4 py-3 text-[12px] font-semibold text-faint">大小</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F8]">
              {filtered.map((photo, i) => {
                const grad = GRADIENT_PLACEHOLDERS[i % GRADIENT_PLACEHOLDERS.length]
                return (
                  <tr key={photo.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(photo.id)} onChange={() => toggleSelect(photo.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn('w-14 h-10 rounded-[7px] bg-gradient-to-br flex items-center justify-center', grad)}>
                        <Image className="w-4 h-4 text-white/60" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink text-[13px]">{photo.caption}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-1.5 py-0.5 rounded-[5px] text-[10.5px] font-bold border', CATEGORY_CFG[photo.category].color)}>
                        {CATEGORY_CFG[photo.category].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-faint">{photo.takenAt}</td>
                    <td className="px-4 py-3 text-[12.5px] text-faint">{photo.size}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
