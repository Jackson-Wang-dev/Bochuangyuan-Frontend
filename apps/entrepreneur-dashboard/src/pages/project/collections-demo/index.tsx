import { useState } from 'react'
import { Info } from 'lucide-react'
import RepeatableCollection from '@/components/RepeatableCollection'
import type { CollectionItem } from '@/types/project'
import {
  TEAM_MEMBER_SCHEMA,
  EDUCATION_SCHEMA,
  WORK_SCHEMA,
  MAJOR_PROJECT_SCHEMA,
  PAPER_SCHEMA,
  PATENT_SCHEMA,
  SOFTWARE_COPYRIGHT_SCHEMA,
  PRODUCT_SCHEMA,
  AWARD_SCHEMA,
  BOOK_SCHEMA,
  CONFERENCE_REPORT_SCHEMA,
  ACADEMIC_POSITION_SCHEMA,
  FOUNDED_COMPANY_SCHEMA,
  PROJECT_STAGE_SCHEMA,
  ORG_HONOR_SCHEMA,
} from '@/types/collectionSchemas'
import { MOCK_PROJECT_NOVAMED } from '@/mock/projectMock'

// Local state shape — each key holds the live items for one collection
interface CollectionState {
  teamMembers: CollectionItem[]
  educations: CollectionItem[]
  works: CollectionItem[]
  majorProjects: CollectionItem[]
  papers: CollectionItem[]
  patents: CollectionItem[]
  softwareCopyrights: CollectionItem[]
  products: CollectionItem[]
  awards: CollectionItem[]
  books: CollectionItem[]
  conferenceReports: CollectionItem[]
  academicPositions: CollectionItem[]
  foundedCompanies: CollectionItem[]
  projectStages: CollectionItem[]
  orgHonors: CollectionItem[]
}

function initState(): CollectionState {
  const a = MOCK_PROJECT_NOVAMED.applicant
  return {
    teamMembers:       MOCK_PROJECT_NOVAMED.teamMembers as CollectionItem[],
    educations:        a.educations        as CollectionItem[],
    works:             a.works             as CollectionItem[],
    majorProjects:     a.majorProjects     as CollectionItem[],
    papers:            a.papers            as CollectionItem[],
    patents:           a.patents           as CollectionItem[],
    softwareCopyrights:a.softwareCopyrights as CollectionItem[],
    products:          a.products          as CollectionItem[],
    awards:            a.awards            as CollectionItem[],
    books:             a.books             as CollectionItem[],
    conferenceReports: a.conferenceReports as CollectionItem[],
    academicPositions: a.academicPositions as CollectionItem[],
    foundedCompanies:  a.foundedCompanies  as CollectionItem[],
    projectStages:     MOCK_PROJECT_NOVAMED.projectStages as CollectionItem[],
    orgHonors:         MOCK_PROJECT_NOVAMED.orgInfo.honors as CollectionItem[],
  }
}

export default function CollectionsDemoPage() {
  const [cols, setCols] = useState<CollectionState>(initState)

  function update(key: keyof CollectionState) {
    return (items: CollectionItem[]) => setCols((s) => ({ ...s, [key]: items }))
  }

  const totalItems = Object.values(cols).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Phase 2 — 通用结构化集合组件
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          NovaMed AI 辅助诊断 · 集合数据演示
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-brand-blue/5 border border-brand-blue/15 rounded-2xl px-4 py-3.5">
        <Info className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
        <div className="text-sm text-slate-600 space-y-0.5">
          <p>
            以下全部 <strong className="text-slate-800">15 类结构化集合</strong>
            均使用同一个 <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">&lt;RepeatableCollection&gt;</code> 组件，
            零重复逻辑。
          </p>
          <p>当前共 <strong className="text-slate-800">{totalItems}</strong> 条记录。</p>
        </div>
      </div>

      {/* ── Section 1：申报人成果集合 ────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          申报人集合（教育 · 工作 · 成果业绩）
        </h2>

        {/* ★ 重点演示：团队成员 */}
        <div className="ring-2 ring-brand-blue/30 rounded-2xl">
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full">
              演示①
            </span>
            <span className="text-xs text-slate-400">支持增删改 · 必填校验 · 年龄自动计算 · 证件号需验证</span>
          </div>
          <RepeatableCollection
            schema={TEAM_MEMBER_SCHEMA}
            items={cols.teamMembers}
            onChange={update('teamMembers')}
          />
        </div>

        <RepeatableCollection
          schema={EDUCATION_SCHEMA}
          items={cols.educations}
          onChange={update('educations')}
        />

        <RepeatableCollection
          schema={WORK_SCHEMA}
          items={cols.works}
          onChange={update('works')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={MAJOR_PROJECT_SCHEMA}
          items={cols.majorProjects}
          onChange={update('majorProjects')}
          defaultExpanded={false}
        />

        {/* ★ 重点演示：代表性论文 */}
        <div className="ring-2 ring-emerald-300/60 rounded-2xl">
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              演示②
            </span>
            <span className="text-xs text-slate-400">影响因子可勾选"不适用" · 含 null 语义的 nullable 字段</span>
          </div>
          <RepeatableCollection
            schema={PAPER_SCHEMA}
            items={cols.papers}
            onChange={update('papers')}
          />
        </div>

        <RepeatableCollection
          schema={PATENT_SCHEMA}
          items={cols.patents}
          onChange={update('patents')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={SOFTWARE_COPYRIGHT_SCHEMA}
          items={cols.softwareCopyrights}
          onChange={update('softwareCopyrights')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={PRODUCT_SCHEMA}
          items={cols.products}
          onChange={update('products')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={AWARD_SCHEMA}
          items={cols.awards}
          onChange={update('awards')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={BOOK_SCHEMA}
          items={cols.books}
          onChange={update('books')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={CONFERENCE_REPORT_SCHEMA}
          items={cols.conferenceReports}
          onChange={update('conferenceReports')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={ACADEMIC_POSITION_SCHEMA}
          items={cols.academicPositions}
          onChange={update('academicPositions')}
          defaultExpanded={false}
        />

        <RepeatableCollection
          schema={FOUNDED_COMPANY_SCHEMA}
          items={cols.foundedCompanies}
          onChange={update('foundedCompanies')}
          defaultExpanded={false}
        />
      </section>

      {/* ── Section 2：项目阶段性目标 ────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          项目阶段性目标
        </h2>
        <RepeatableCollection
          schema={PROJECT_STAGE_SCHEMA}
          items={cols.projectStages}
          onChange={update('projectStages')}
        />
      </section>

      {/* ── Section 3：单位荣誉 ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          用人单位荣誉
        </h2>
        <RepeatableCollection
          schema={ORG_HONOR_SCHEMA}
          items={cols.orgHonors}
          onChange={update('orgHonors')}
        />
      </section>

      <div className="h-12" />
    </div>
  )
}
