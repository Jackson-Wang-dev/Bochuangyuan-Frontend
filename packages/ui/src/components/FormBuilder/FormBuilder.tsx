import { useEffect, useState } from 'react'
import { Eye, Save, Loader2 } from 'lucide-react'
import type { FormBuilderProps } from './types'
import { useFormBuilderStore } from './useFormBuilderStore'
import { FieldPalette } from './FieldPalette'
import { CanvasArea } from './CanvasArea'
import { FieldEditor } from './FieldEditor'
import { FormPreviewModal } from './FormPreviewModal'
import { cn } from '../../lib/cn'

export function FormBuilder({
  mode,
  initialSchema,
  onChange,
  onSave,
  readOnly = false,
}: FormBuilderProps) {
  const { loadSchema, exportSchema, isDirty, resetDirty } = useFormBuilderStore()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialSchema) {
      loadSchema(initialSchema, mode)
    } else {
      // set mode so the store knows what to export
      useFormBuilderStore.setState({ mode })
    }
  }, [mode, initialSchema, loadSchema])

  useEffect(() => {
    if (!onChange) return
    const unsub = useFormBuilderStore.subscribe(() => {
      onChange(exportSchema())
    })
    return unsub
  }, [onChange, exportSchema])

  const handleSave = async () => {
    if (!onSave || saving) return
    setSaving(true)
    try {
      const schema = exportSchema()
      await onSave(schema)
      resetDirty()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
              未保存
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {mode === 'review' ? '专家视角预览' : '预览'}
          </button>
          {onSave && !readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-[#0045c4] hover:bg-[#0045c4]/90 transition-colors',
                saving && 'opacity-70 cursor-not-allowed',
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              保存
            </button>
          )}
        </div>
      </div>

      {/* Three-column body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left palette */}
        <div className="w-44 flex-shrink-0 border-r border-slate-200 overflow-y-auto p-3 bg-slate-50">
          <FieldPalette mode={mode} readOnly={readOnly} />
        </div>

        {/* Center canvas */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc]">
          <CanvasArea mode={mode} readOnly={readOnly} />
        </div>

        {/* Right editor */}
        <div className="w-72 flex-shrink-0 border-l border-slate-200 overflow-y-auto p-4 bg-white">
          <FieldEditor mode={mode} readOnly={readOnly} />
        </div>
      </div>

      <FormPreviewModal
        mode={mode}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}
