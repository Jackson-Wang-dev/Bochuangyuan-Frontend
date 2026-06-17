/**
 * buildPrefillSchema — AI 预填 schema 构造函数。
 *
 * 字段定义的唯一真源已移至 packages/shared/src/projectForm/，通过
 * @bochuangyuan/shared 导入。本文件只负责将共享字段定义组装成
 * 后端 AI 抽取服务所需的 PrefillSchema 格式，无需改动字段时触碰本文件。
 */

import {
  COVER_FIELDS,
  APPLICANT_SCALAR_FIELDS,
  PROJECT_INFO_FIELDS,
  PERSONAL_STATEMENT_FIELDS,
  ORG_FIELDS,
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
  type ProjectField,
  type CollectionSchema,
} from '@bochuangyuan/shared'
import type { PrefillFieldDef, PrefillSchema } from '@/types/prefillTypes'

// ─── 字段类型映射 ─────────────────────────────────────────────────────────────

function projectFieldToPrefill(f: ProjectField): PrefillFieldDef {
  return {
    key: f.key,
    label: f.label,
    type: f.type as PrefillFieldDef['type'],
    ...(f.description !== undefined && { description: f.description }),
    ...(f.options !== undefined && { options: f.options }),
    ...(f.unit !== undefined && { unit: f.unit }),
    ...(f.fields !== undefined && { fields: f.fields.map(projectFieldToPrefill) }),
    ...(f.item !== undefined && { item: projectFieldToPrefill(f.item) }),
  }
}

function collectionSchemaToPrefillField(schema: CollectionSchema): PrefillFieldDef {
  const itemFields = schema.fields
    .filter((f) => !f.hidden && !f.readonly)
    .map((f): PrefillFieldDef => ({
      key: f.key,
      label: f.label,
      type: (() => {
        switch (f.type) {
          case 'boolean': return 'boolean'
          case 'number':  return f.unit ? 'number' : 'number'
          case 'select':  return 'enum'
          case 'date':
          case 'month':   return 'date'
          default:        return 'string'
        }
      })(),
      ...(f.description && { description: f.description }),
      ...(f.options && { options: f.options }),
      ...(f.unit && { unit: f.unit }),
    }))

  return {
    key: schema.collectionKey,
    label: schema.label,
    type: 'array',
    description: `提取文档中所有${schema.label}条目，每条形成一个对象`,
    fields: itemFields,
  }
}

// ─── 全量 schema 构造函数 ─────────────────────────────────────────────────────

export function buildPrefillSchema(): PrefillSchema {
  const flatFields: PrefillFieldDef[] = [
    ...COVER_FIELDS,
    ...APPLICANT_SCALAR_FIELDS,
    ...PROJECT_INFO_FIELDS,
    ...PERSONAL_STATEMENT_FIELDS,
    ...ORG_FIELDS,
  ].map(projectFieldToPrefill)

  const collectionFields: PrefillFieldDef[] = [
    {
      ...collectionSchemaToPrefillField(EDUCATION_SCHEMA),
      description: '只提取主申报人（即申报人本人，非团队成员）的教育经历，每条形成一个对象',
    },
    {
      ...collectionSchemaToPrefillField(WORK_SCHEMA),
      description: '只提取主申报人（即申报人本人，非团队成员）的工作经历，每条形成一个对象',
    },
    collectionSchemaToPrefillField(TEAM_MEMBER_SCHEMA),
    collectionSchemaToPrefillField(PROJECT_STAGE_SCHEMA),
    collectionSchemaToPrefillField(MAJOR_PROJECT_SCHEMA),
    collectionSchemaToPrefillField(PAPER_SCHEMA),
    collectionSchemaToPrefillField(PATENT_SCHEMA),
    collectionSchemaToPrefillField(SOFTWARE_COPYRIGHT_SCHEMA),
    collectionSchemaToPrefillField(PRODUCT_SCHEMA),
    collectionSchemaToPrefillField(AWARD_SCHEMA),
    collectionSchemaToPrefillField(BOOK_SCHEMA),
    collectionSchemaToPrefillField(CONFERENCE_REPORT_SCHEMA),
    collectionSchemaToPrefillField(ACADEMIC_POSITION_SCHEMA),
    collectionSchemaToPrefillField(FOUNDED_COMPANY_SCHEMA),
    collectionSchemaToPrefillField(ORG_HONOR_SCHEMA),
  ]

  return { fields: [...flatFields, ...collectionFields] }
}
