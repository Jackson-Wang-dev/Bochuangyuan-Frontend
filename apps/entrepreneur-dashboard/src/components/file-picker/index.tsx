import { useMaterialStore } from '@/store/materialStore'
import type { MaterialFile } from '@bochuangyuan/types'

interface FilePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (file: MaterialFile) => void
  category?: MaterialFile['category']
}

export function FilePickerModal({ isOpen, onClose, onSelect, category }: FilePickerModalProps) {
  const files = useMaterialStore((s) => s.files)
  const filtered = category ? files.filter((f) => f.category === category) : files

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">从材料库选取</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>
        <div className="p-6 max-h-80 overflow-y-auto space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              材料库为空，请先上传文件
            </div>
          ) : (
            filtered.map((file) => (
              <button
                key={file.fileId}
                onClick={() => { onSelect(file); onClose() }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                  📄
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-700 text-sm truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{file.category}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
