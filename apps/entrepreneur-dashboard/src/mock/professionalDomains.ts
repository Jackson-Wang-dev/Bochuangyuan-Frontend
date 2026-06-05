import type { ProfessionalDomainTop } from '@/types/project'

/**
 * 专业领域三级枚举（临时 mock，真实数据由主办方端维护）
 * 共 7 大类、21 中类、44 细分领域
 */
export const PROFESSIONAL_DOMAINS: ProfessionalDomainTop[] = [
  {
    code: '1',
    label: '人工智能与大数据',
    children: [
      {
        code: '1-1',
        label: '人工智能基础技术',
        children: [
          { code: '1-1-1', label: '机器学习与深度学习' },
          { code: '1-1-2', label: '计算机视觉' },
          { code: '1-1-3', label: '自然语言处理' },
          { code: '1-1-4', label: '知识图谱与推理' },
        ],
      },
      {
        code: '1-2',
        label: '智能垂直应用',
        children: [
          { code: '1-2-1', label: '智能医疗' },
          { code: '1-2-2', label: '智能制造' },
          { code: '1-2-3', label: '智能交通' },
          { code: '1-2-4', label: '智慧教育' },
        ],
      },
      {
        code: '1-3',
        label: '大数据技术',
        children: [
          { code: '1-3-1', label: '数据采集与处理' },
          { code: '1-3-2', label: '数据分析与可视化' },
        ],
      },
    ],
  },
  {
    code: '2',
    label: '生物医药与健康',
    children: [
      {
        code: '2-1',
        label: '生物医药研发',
        children: [
          { code: '2-1-1', label: '创新药物研发' },
          { code: '2-1-2', label: '生物技术药物' },
          { code: '2-1-3', label: '中药现代化' },
        ],
      },
      {
        code: '2-2',
        label: '医疗器械',
        children: [
          { code: '2-2-1', label: '高端医疗设备' },
          { code: '2-2-2', label: '体外诊断' },
          { code: '2-2-3', label: '康复辅助器械' },
        ],
      },
    ],
  },
  {
    code: '3',
    label: '新能源与环保',
    children: [
      {
        code: '3-1',
        label: '新能源技术',
        children: [
          { code: '3-1-1', label: '光伏与太阳能' },
          { code: '3-1-2', label: '风能利用' },
          { code: '3-1-3', label: '储能技术' },
          { code: '3-1-4', label: '氢能源' },
        ],
      },
      {
        code: '3-2',
        label: '节能环保',
        children: [
          { code: '3-2-1', label: '碳捕集与利用' },
          { code: '3-2-2', label: '污水处理' },
          { code: '3-2-3', label: '固废资源化' },
        ],
      },
    ],
  },
  {
    code: '4',
    label: '高端装备与先进制造',
    children: [
      {
        code: '4-1',
        label: '智能装备',
        children: [
          { code: '4-1-1', label: '工业机器人' },
          { code: '4-1-2', label: '精密仪器' },
          { code: '4-1-3', label: '数控机床' },
        ],
      },
      {
        code: '4-2',
        label: '先进制造工艺',
        children: [
          { code: '4-2-1', label: '增材制造（3D打印）' },
          { code: '4-2-2', label: '精密加工' },
          { code: '4-2-3', label: '工业互联网' },
        ],
      },
    ],
  },
  {
    code: '5',
    label: '新材料',
    children: [
      {
        code: '5-1',
        label: '功能材料',
        children: [
          { code: '5-1-1', label: '电子信息材料' },
          { code: '5-1-2', label: '生物医用材料' },
          { code: '5-1-3', label: '高分子新材料' },
        ],
      },
      {
        code: '5-2',
        label: '结构材料',
        children: [
          { code: '5-2-1', label: '高性能金属材料' },
          { code: '5-2-2', label: '复合材料' },
          { code: '5-2-3', label: '纳米材料' },
        ],
      },
    ],
  },
  {
    code: '6',
    label: '数字经济与信息技术',
    children: [
      {
        code: '6-1',
        label: '软件与信息服务',
        children: [
          { code: '6-1-1', label: '企业管理软件' },
          { code: '6-1-2', label: '行业垂直应用' },
          { code: '6-1-3', label: '云计算与SaaS' },
        ],
      },
      {
        code: '6-2',
        label: '网络与信息安全',
        children: [
          { code: '6-2-1', label: '数据安全' },
          { code: '6-2-2', label: '工控安全' },
        ],
      },
      {
        code: '6-3',
        label: '区块链与新型互联网',
        children: [
          { code: '6-3-1', label: '供应链金融' },
          { code: '6-3-2', label: '数字确权与NFT' },
        ],
      },
    ],
  },
  {
    code: '7',
    label: '现代农业',
    children: [
      {
        code: '7-1',
        label: '智慧农业',
        children: [
          { code: '7-1-1', label: '农业物联网' },
          { code: '7-1-2', label: '精准农业技术' },
          { code: '7-1-3', label: '农业无人机应用' },
        ],
      },
      {
        code: '7-2',
        label: '农业生物技术',
        children: [
          { code: '7-2-1', label: '生物育种' },
          { code: '7-2-2', label: '农产品加工与保鲜' },
        ],
      },
    ],
  },
]

/** 通过 code 快速查找叶节点 */
export function findDomainLeaf(code: string) {
  for (const top of PROFESSIONAL_DOMAINS) {
    for (const mid of top.children) {
      for (const leaf of mid.children) {
        if (leaf.code === code) return { top, mid, leaf }
      }
    }
  }
  return null
}

/** 获取所有叶节点的扁平列表（供搜索/报名选择用） */
export function getAllDomainLeaves() {
  return PROFESSIONAL_DOMAINS.flatMap((top) =>
    top.children.flatMap((mid) =>
      mid.children.map((leaf) => ({ top, mid, leaf })),
    ),
  )
}
