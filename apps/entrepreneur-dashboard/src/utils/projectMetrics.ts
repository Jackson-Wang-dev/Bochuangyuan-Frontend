import type { Project, GrowthRadarSnapshot, ProjectSnapshot, ProjectSnapshotData } from '@/types/project'

/**
 * 成熟度综合分（0–100）
 * 来源：现有技术成果数量 + 单位研发能力 + 经济效益
 * 只有已验证的字段才计入，未验证字段不参与计算
 * 权重为初始值，由产品方后续调整。
 */
export function computeMaturityScore(project: Project): number {
  const { applicant, orgInfo, verificationStatus: vs } = project

  const inventionPatents = applicant.patents.filter(
    (p) => p.status === '已授权' && p.patentType === '发明专利' && p.isVerified,
  ).length

  const otherPatentsAndSW =
    applicant.patents.filter(
      (p) => p.status === '已授权' && p.patentType !== '发明专利' && p.isVerified,
    ).length + applicant.softwareCopyrights.length

  const paperCount = applicant.papers.length

  const techScore = Math.min(inventionPatents * 15 + otherPatentsAndSW * 5 + paperCount * 3, 40)
  // rdExpenditure and totalRevenue require verification before counting
  const rdScore   = vs.rdExpenditure === 'verified' ? Math.min((orgInfo.rdExpenditure / 500) * 30, 30) : 0
  const ecoScore  = vs.totalRevenue  === 'verified' ? Math.min((orgInfo.totalRevenue  / 1000) * 30, 30) : 0

  return Math.round(techScore + rdScore + ecoScore)
}

/** 从 Project 派生轻量雷达维度（仅供图表渲染，不用作 diff 数据源） */
function deriveRadar(
  project: Project,
  snapshotId: string,
  timestamp: string,
): GrowthRadarSnapshot {
  const vs = project.verificationStatus
  return {
    snapshotId,
    timestamp,
    // teamSize and totalFunding only count after verification
    teamSize:     vs.teamMembers  === 'verified' ? project.teamMembers.length + 1 : 0,
    patentCount:  project.applicant.patents.filter((p) => p.status === '已授权' && p.isVerified).length,
    softwareCopyrightCount: project.applicant.softwareCopyrights.length,
    paperCount:   project.applicant.papers.length,
    totalFunding: vs.totalFunding  === 'verified' ? project.orgInfo.totalFunding  : 0,
    rdExpenditure: vs.rdExpenditure === 'verified' ? project.orgInfo.rdExpenditure : 0,
    maturityScore: computeMaturityScore(project),
  }
}

/**
 * 保存时调用：生成一份完整快照（含全量项目数据 + 预计算雷达维度）。
 * - data  用于 diff 引擎比对任意字段、以及回退时覆盖当前状态
 * - radar 用于快速渲染雷达图，无需重新遍历项目结构
 */
export function deriveProjectSnapshot(
  project: Project,
  snapshotId: string,
  timestamp: string,
): ProjectSnapshot {
  // 从 project 中剥离 events 和 snapshots，避免循环引用/快照嵌套
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { events, snapshots, ...rest } = project
  const data = rest as ProjectSnapshotData
  return {
    snapshotId,
    timestamp,
    data,
    radar: deriveRadar(project, snapshotId, timestamp),
  }
}

/**
 * 将雷达快照转为 Recharts RadarChart 所需的 data 格式
 * 五个维度标准化为 0–100 分值
 * 注：业务广度口径待产品方拍板，当前用论文+软著数量作占位算法
 */
export function radarSnapshotToChartData(snap: GrowthRadarSnapshot) {
  return [
    {
      subject: '团队规模',
      value: Math.min(Math.round((snap.teamSize / 20) * 100), 100),
      fullMark: 100,
    },
    {
      subject: '融资额',
      value: Math.min(Math.round((snap.totalFunding / 1000) * 100), 100),
      fullMark: 100,
    },
    {
      subject: '专利数',
      value: Math.min(Math.round((snap.patentCount / 10) * 100), 100),
      fullMark: 100,
    },
    {
      subject: '成熟度',
      value: snap.maturityScore,
      fullMark: 100,
    },
    {
      subject: '业务广度',
      value: Math.min(
        Math.round(((snap.paperCount + snap.softwareCopyrightCount) / 10) * 100),
        100,
      ),
      fullMark: 100,
    },
  ]
}
