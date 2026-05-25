import { useMaterialStore } from '@/store/materialStore'

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'honor', label: '荣誉证书' },
  { key: 'ip', label: '知识产权' },
  { key: 'certificate', label: '资质证明' },
  { key: 'other', label: '其他' },
] as const

export default function MaterialLibraryPage() {
  const files = useMaterialStore((s) => s.files)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">材料库</h2>
          <p className="text-sm text-slate-400 mt-0.5">统一管理证书、知识产权等文件，一键调用</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          上传文件
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            {cat.label}
          </button>
        ))}
      </div>
      {files.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 border-dashed p-16 flex flex-col items-center justify-center text-slate-400">
          <p className="text-4xl mb-4">📁</p>
          <p className="font-semibold">材料库为空</p>
          <p className="text-sm mt-1">上传您的证书、专利等材料，参赛时一键调用</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.fileId} className="bg-white rounded-xl border border-slate-100 p-4">
              <p className="font-medium text-slate-700 text-sm truncate">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">{file.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
