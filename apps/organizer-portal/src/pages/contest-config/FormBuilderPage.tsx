import { useEffect, useRef, useState } from 'react'
import { useParams, useBlocker } from 'react-router-dom'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { Lock } from 'lucide-react'
import { FormBuilder, useFormBuilderStore } from '@bochuangyuan/ui'
import { formBuilderApi } from '@bochuangyuan/api'
import type { FormSchema, ReviewRuleSchema, OrganizerCompetition } from '@bochuangyuan/types'

// Statuses where the form can no longer be edited
const LOCKED_STATUSES: OrganizerCompetition['status'][] = ['open', 'reviewing', 'closed', 'finished']

// TODO: replace with fetchCompetition(id) when backend is ready
const MOCK_COMPETITIONS: Pick<OrganizerCompetition, 'competitionId' | 'status' | 'name'>[] = [
  { competitionId: 'comp-1', status: 'reviewing', name: '2024 全国大学生创业大赛' },
  { competitionId: 'comp-2', status: 'open',      name: '2024 博创杯双创大赛' },
]

const DEFAULT_SCHEMA = (contestId: string): FormSchema => ({
  id: nanoid(),
  name: '报名表单',
  contestId,
  fields: [
    { id: nanoid(), type: 'text',     label: '项目名称',   required: true },
    { id: nanoid(), type: 'text',     label: '联系人',     required: true },
    { id: nanoid(), type: 'text',     label: '联系电话',   required: true, placeholder: '请输入手机号' },
    {
      id: nanoid(),
      type: 'select',
      label: '参赛组别',
      required: true,
      options: [
        { label: '初创组', value: 'startup' },
        { label: '成长组', value: 'growth' },
        { label: '成熟组', value: 'mature' },
      ],
    },
    { id: nanoid(), type: 'textarea', label: '项目简介', required: true, description: '请简要描述项目核心亮点（300字以内）' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export default function FormBuilderPage() {
  const { id: contestId } = useParams<{ id: string }>()
  const schemaRef = useRef<FormSchema | null>(null)
  const isDirty = useFormBuilderStore((s) => s.isDirty)
  const [competition, setCompetition] = useState<Pick<OrganizerCompetition, 'competitionId' | 'status' | 'name'> | null>(null)

  const readOnly = competition ? LOCKED_STATUSES.includes(competition.status) : false

  useBlocker(({ currentLocation, nextLocation }) => {
    if (!isDirty || readOnly) return false
    if (currentLocation.pathname === nextLocation.pathname) return false
    return !window.confirm('有未保存的修改，确认离开？')
  })

  useEffect(() => {
    if (!contestId) return
    // TODO: API — replace with fetchCompetition(contestId)
    const comp = MOCK_COMPETITIONS.find((c) => c.competitionId === contestId) ?? null
    setCompetition(comp)

    formBuilderApi.list().then((schemas) => {
      const existing = schemas.find((s) => s.contestId === contestId)
      schemaRef.current = existing ?? DEFAULT_SCHEMA(contestId)
    })
  }, [contestId])

  const handleSave = async (schema: FormSchema | ReviewRuleSchema) => {
    const toSave: FormSchema = {
      ...(schema as FormSchema),
      contestId: contestId ?? undefined,
    }
    await formBuilderApi.save(toSave)
    toast.success('表单已保存')
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">报名表单配置</h1>
          <p className="text-sm text-slate-400 mt-0.5">配置参赛者提交报名时需要填写的信息</p>
        </div>
        {readOnly && competition && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
            <Lock className="w-4 h-4" />
            赛事已处于「{statusLabel(competition.status)}」状态，表单不可再编辑
          </div>
        )}
      </div>

      <div className="flex-1 glass-card overflow-hidden" style={{ minHeight: 0 }}>
        <FormBuilder
          mode="form"
          initialSchema={schemaRef.current ?? DEFAULT_SCHEMA(contestId ?? '')}
          onSave={readOnly ? undefined : handleSave}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

function statusLabel(status: OrganizerCompetition['status']): string {
  const map: Record<OrganizerCompetition['status'], string> = {
    draft:     '草稿',
    open:      '开放报名',
    reviewing: '评审中',
    closed:    '已结束',
    finished:  '已完成',
  }
  return map[status]
}
