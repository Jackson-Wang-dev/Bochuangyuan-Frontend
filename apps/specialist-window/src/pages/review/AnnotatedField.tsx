import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import type { Field, Annotation } from '@/types/domain'

interface Props {
  field: Field
  projectId: string
  annotations: Annotation[]
  onAnnotationCreated: () => void
}

interface TooltipState {
  annotation: Annotation
  x: number
  y: number
}

export function AnnotatedField({ field, annotations }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const fieldAnnotations = useMemo(
    () => annotations.filter((a) => a.fieldId === field.id),
    [annotations, field.id],
  )

  const displayHtml = useMemo(() => {
    let html = field.valueHtml
    for (const ann of fieldAnnotations) {
      if (!ann.quotedText) continue
      html = html.replace(
        ann.quotedText,
        () =>
          `<mark data-aid="${ann.id}" style="background:rgba(251,191,36,0.35);border-radius:2px;cursor:default;padding:0 1px;">${ann.quotedText}</mark>`,
      )
    }
    return html
  }, [field.valueHtml, fieldAnnotations])

  return (
    <div className="space-y-1.5">
      <p className="text-[12px] font-semibold text-slate-500">{field.label}</p>

      <div
        className={[
          'text-[14px] text-slate-700 leading-relaxed select-none cursor-default',
          '[&_p]:m-0',
          '[&_ul]:pl-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:leading-relaxed',
          '[&_table]:w-full [&_table]:text-[13px] [&_table]:border-collapse',
          '[&_th]:text-left [&_th]:font-semibold [&_th]:text-slate-500',
          '[&_th]:py-1.5 [&_th]:px-2 [&_th]:border-b [&_th]:border-slate-200',
          '[&_td]:py-1.5 [&_td]:px-2 [&_td]:border-b [&_td]:border-slate-100',
          '[&_b]:font-semibold',
        ].join(' ')}
        onMouseOver={(e) => {
          const mark = (e.target as Element).closest?.('[data-aid]') as HTMLElement | null
          if (!mark) return
          const ann = fieldAnnotations.find((a) => a.id === mark.dataset.aid)
          if (!ann) return
          const r = mark.getBoundingClientRect()
          setTooltip({ annotation: ann, x: r.left + r.width / 2, y: r.top })
        }}
        onMouseOut={(e) => {
          const to = e.relatedTarget as Element | null
          if (!to?.closest?.('[data-aid]')) setTooltip(null)
        }}
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />

      {tooltip &&
        createPortal(
          <div
            className="fixed z-50 max-w-[240px] bg-slate-800 text-white text-[12px] leading-snug rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{
              left: Math.max(8, Math.min(tooltip.x - 120, window.innerWidth - 248)),
              top: tooltip.y,
              transform: 'translateY(calc(-100% - 6px))',
            }}
          >
            <p className="italic text-slate-300 line-clamp-2 mb-1">
              「{tooltip.annotation.quotedText}」
            </p>
            <p>{tooltip.annotation.comment}</p>
            <p className="text-slate-400 text-[11px] mt-1">
              {new Date(tooltip.annotation.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>,
          document.body,
        )}
    </div>
  )
}
