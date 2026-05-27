import { useEffect, useRef } from 'react'
import { useParams, useBlocker } from 'react-router-dom'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { FormBuilder, useFormBuilderStore } from '@bochuangyuan/ui'
import { reviewRuleApi } from '@bochuangyuan/api'
import type { FormSchema, ReviewRuleSchema } from '@bochuangyuan/types'

const DEFAULT_RULE: ReviewRuleSchema = {
  id: nanoid(),
  name: '评审规则',
  phases: [
    {
      phase: 'preliminary',
      label: '初审',
      enabled: true,
      commentsRequired: false,
      dimensions: [
        { id: nanoid(), label: '创新性',   weight: 40, maxScore: 10, description: '项目的创新程度与原创性' },
        { id: nanoid(), label: '可行性',   weight: 35, maxScore: 10, description: '商业模式与技术路径的可行性' },
        { id: nanoid(), label: '团队能力', weight: 25, maxScore: 10, description: '核心团队的背景与执行能力' },
      ],
    },
    {
      phase: 'semifinal',
      label: '复审',
      enabled: false,
      commentsRequired: true,
      dimensions: [],
    },
    {
      phase: 'final',
      label: '终评',
      enabled: false,
      commentsRequired: true,
      dimensions: [],
    },
    {
      phase: 'roadshow',
      label: '路演',
      enabled: false,
      commentsRequired: true,
      dimensions: [],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function ReviewRulePage() {
  const { id: contestId } = useParams<{ id: string }>()
  const schemaRef = useRef<ReviewRuleSchema | null>(null)
  const isDirty = useFormBuilderStore((s) => s.isDirty)

  useBlocker(({ currentLocation, nextLocation }) => {
    if (!isDirty) return false
    if (currentLocation.pathname === nextLocation.pathname) return false
    return !window.confirm('有未保存的修改，确认离开？')
  })

  useEffect(() => {
    if (!contestId) return
    ;(async () => {
      const existing = await reviewRuleApi.getByContest(contestId)
      schemaRef.current = existing ?? { ...DEFAULT_RULE, id: nanoid(), contestId }
    })()
  }, [contestId])

  const handleSave = async (schema: FormSchema | ReviewRuleSchema) => {
    const toSave: ReviewRuleSchema = {
      ...(schema as ReviewRuleSchema),
      contestId: contestId ?? undefined,
    }
    await reviewRuleApi.save(toSave)
    toast.success('评审规则已保存')
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0">
        <h1 className="text-xl font-black text-slate-800">评审规则配置</h1>
        <p className="text-sm text-slate-400 mt-0.5">设置各评审阶段的评分维度、权重和晋级规则</p>
      </div>

      <div className="flex-1 glass-card overflow-hidden" style={{ minHeight: 0 }}>
        <FormBuilder
          mode="review"
          initialSchema={schemaRef.current ?? DEFAULT_RULE}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
