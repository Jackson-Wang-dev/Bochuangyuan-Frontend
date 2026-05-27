import { useEffect, useRef } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Copy, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import type { FormField, ReviewPhaseConfig, ReviewDimension } from '@bochuangyuan/types'
import type { FieldType, BuilderMode } from './types'
import { FieldPreview } from './FieldPreview'
import { useFormBuilderStore } from './useFormBuilderStore'
import { cn } from '../../lib/cn'

interface Props {
  mode: BuilderMode
  readOnly?: boolean
}

// ─── Form Mode Canvas ─────────────────────────────────────────────────────────

function SortableFieldItem({
  field,
  selected,
  readOnly,
}: {
  field: FormField
  selected: boolean
  readOnly?: boolean
}) {
  const { selectField, removeField, duplicateField, reorderFields, fields } =
    useFormBuilderStore()
  const idx = fields.findIndex((f) => f.id === field.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    disabled: readOnly,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const actions = !readOnly ? (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => { e.stopPropagation(); reorderFields(idx, Math.max(0, idx - 1)) }}
        disabled={idx === 0}
        className="p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-0 transition-colors"
        title="上移"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); reorderFields(idx, Math.min(fields.length - 1, idx + 1)) }}
        disabled={idx === fields.length - 1}
        className="p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-0 transition-colors"
        title="下移"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); duplicateField(field.id) }}
        className="p-1 rounded-lg text-slate-300 hover:text-[#0045c4] hover:bg-[#0045c4]/8 transition-colors"
        title="复制"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); removeField(field.id) }}
        className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="删除"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : undefined

  return (
    <div ref={setNodeRef} style={style} className="group relative flex items-start gap-2">
      {/* drag handle */}
      {!readOnly && (
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      {readOnly && <div className="w-6 flex-shrink-0" />}

      <div className="flex-1 min-w-0">
        <FieldPreview
          field={field}
          selected={selected}
          onClick={() => selectField(field.id)}
          readOnly={readOnly}
          actions={actions}
        />
      </div>
    </div>
  )
}

function FormCanvas({ readOnly }: { readOnly?: boolean }) {
  const { fields, selectedFieldId, selectField, addField, reorderFields } =
    useFormBuilderStore()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedFieldId && !readOnly) {
        useFormBuilderStore.getState().removeField(selectedFieldId)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedFieldId, readOnly])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = fields.findIndex((f) => f.id === active.id)
      const newIdx = fields.findIndex((f) => f.id === over.id)
      reorderFields(oldIdx, newIdx)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('fieldType') as FieldType
    if (type) addField(type)
  }

  if (fields.length === 0) {
    return (
      <div
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => selectField(null)}
        className="h-full min-h-[400px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 text-sm"
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <p className="font-semibold">拖拽字段到此处，或点击左侧类型添加</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={(e) => { if (e.target === containerRef.current) selectField(null) }}
      className="space-y-3 pl-6"
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              selected={field.id === selectedFieldId}
              readOnly={readOnly}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

// ─── Review Mode Canvas ───────────────────────────────────────────────────────

function ReviewCanvas({ readOnly }: { readOnly?: boolean }) {
  const { phases, addDimension, updateDimension, removeDimension, reorderDimensions } =
    useFormBuilderStore()

  return (
    <div className="space-y-4">
      {phases.map((phase) => (
        <PhaseBlock
          key={phase.phase}
          phase={phase}
          readOnly={readOnly}
          onAddDimension={() => addDimension(phase.phase)}
          onUpdateDimension={(dimId, patch) => updateDimension(phase.phase, dimId, patch)}
          onRemoveDimension={(dimId) => removeDimension(phase.phase, dimId)}
          onReorder={(from, to) => reorderDimensions(phase.phase, from, to)}
        />
      ))}
    </div>
  )
}

function PhaseBlock({
  phase,
  readOnly,
  onAddDimension,
  onUpdateDimension,
  onRemoveDimension,
  onReorder,
}: {
  phase: ReviewPhaseConfig
  readOnly?: boolean
  onAddDimension: () => void
  onUpdateDimension: (dimId: string, patch: Partial<ReviewDimension>) => void
  onRemoveDimension: (dimId: string) => void
  onReorder: (from: number, to: number) => void
}) {
  const totalWeight = phase.dimensions.reduce((s, d) => s + d.weight, 0)
  const weightOk = totalWeight === 100 || phase.dimensions.length === 0

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = phase.dimensions.findIndex((d) => d.id === active.id)
      const newIdx = phase.dimensions.findIndex((d) => d.id === over.id)
      onReorder(oldIdx, newIdx)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{phase.label}</span>
          {!phase.enabled && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">已禁用</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-bold',
              weightOk ? 'text-green-500' : 'text-red-500',
            )}
          >
            权重合计 {totalWeight}%{!weightOk && ' ≠ 100'}
          </span>
          {!readOnly && (
            <button
              onClick={onAddDimension}
              className="flex items-center gap-1 text-xs font-semibold text-[#0045c4] hover:text-[#0045c4]/70 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              添加维度
            </button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {phase.dimensions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">暂无评分维度</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={phase.dimensions.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            {phase.dimensions.map((dim) => (
              <SortableDimRow
                key={dim.id}
                dim={dim}
                readOnly={readOnly}
                onUpdate={(patch) => onUpdateDimension(dim.id, patch)}
                onRemove={() => onRemoveDimension(dim.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

function SortableDimRow({
  dim,
  readOnly,
  onUpdate,
  onRemove,
}: {
  dim: ReviewDimension
  readOnly?: boolean
  onUpdate: (patch: Partial<ReviewDimension>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dim.id,
    disabled: readOnly,
  })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      {!readOnly && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 flex-shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <input
        disabled={readOnly}
        value={dim.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        placeholder="维度名称"
      />

      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs text-slate-400">权重</span>
        <input
          disabled={readOnly}
          type="number"
          min={0}
          max={100}
          value={dim.weight}
          onChange={(e) => onUpdate({ weight: Math.min(100, Math.max(0, Number(e.target.value))) })}
          className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        />
        <span className="text-xs text-slate-400">%</span>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs text-slate-400">满分</span>
        <input
          disabled={readOnly}
          type="number"
          min={1}
          value={dim.maxScore}
          onChange={(e) => onUpdate({ maxScore: Math.max(1, Number(e.target.value)) })}
          className="w-14 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        />
      </div>

      {!readOnly && (
        <button
          onClick={onRemove}
          className="p-1 rounded text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function CanvasArea({ mode, readOnly }: Props) {
  return mode === 'form' ? (
    <FormCanvas readOnly={readOnly} />
  ) : (
    <ReviewCanvas readOnly={readOnly} />
  )
}
