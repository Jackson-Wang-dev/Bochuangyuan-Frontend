import type { ApiProject } from '@/api/project'

function val(v: string | null | undefined, fallback = '未填写') {
  return v?.trim() || fallback
}

function money(v: number | null | undefined) {
  return v ? `${v} 万元` : '未填写'
}

export function projectToText(p: ApiProject): string {
  const a = p.applicant
  const o = p.orgInfo

  const domain = (() => {
    const d = p.professionalDomain as Record<string, { label?: string } | undefined>
    return [d?.top?.label, d?.leaf?.label].filter(Boolean).join(' › ') || '未填写'
  })()

  const educations = a.educations?.length
    ? a.educations.map(e =>
        `  - ${val(e.institution)} ${val(e.major)} ${val(e.educationLevel)}/${val(e.degreeLevel)} (${val(e.startDate)}—${val(e.endDate)})`
      ).join('\n')
    : '  无'

  const works = a.works?.length
    ? a.works.map(w =>
        `  - ${val(w.organization)} · ${val(w.position)} · ${val(w.workNature)} (${val(w.startDate)}—${w.endDate ?? '至今'})`
      ).join('\n')
    : '  无'

  const patents = a.patents?.length
    ? a.patents.map(pt =>
        `  - 《${val(pt.name)}》${val(pt.patentType)} [${val(pt.status)}] 授权日：${val(pt.authorizedDate)}`
      ).join('\n')
    : '  无'

  const papers = a.papers?.length
    ? a.papers.map(pp =>
        `  - 《${val(pp.title)}》${val(pp.journal)} ${pp.publishDate ?? ''} (第${pp.personalRank ?? '-'}作者/${pp.totalAuthors ?? '-'}人)`
      ).join('\n')
    : '  无'

  const majorProjects = a.majorProjects?.length
    ? a.majorProjects.map(mp =>
        `  - 《${val(mp.projectName)}》${val(mp.source)} ${val(mp.undertakingUnit)} ${money(mp.totalFunding)} 本人角色：${val(mp.personalRole)}`
      ).join('\n')
    : '  无'

  const team = p.teamMembers?.length
    ? p.teamMembers.map(m =>
        `  - ${val(m.name)} / ${val(m.memberType)} / 分工：${val(m.division)} / 背景：${val(m.background)}`
      ).join('\n')
    : '  无额外团队成员'

  const stages = p.projectStages?.length
    ? p.projectStages.map((s, i) =>
        `  阶段${i + 1}（${val(s.stageLabel)}）${val(s.startDate)}—${val(s.endDate)}\n  目标：${val(s.stageGoal)}\n  预计投入：${money(s.plannedInvestment)}`
      ).join('\n\n')
    : '  未填写'

  const orgHonors = o.honors?.length
    ? o.honors.map(h => `  - ${val(h.honorName)} ${val(h.issuingDepartment)} ${val(h.awardDate)}`).join('\n')
    : '  无'

  return `# 商业计划书

## 一、项目基本信息
- 申报用名：${val(p.declarationName)}
- 项目名称：${val(p.projectName)}
- 专业领域：${domain}
- 核心技术：${val(p.coreTech)}
- 项目简介：${val(p.projectBrief)}

## 二、申请人（带头人）信息
- 姓名：${val(a.name)}（英文：${val(a.nameEn, '-')}）
- 性别：${val(a.gender, '-')}  出生日期：${val(a.birthDate, '-')}  国籍：${val(a.nationality, '-')}
- 最高学历：${val(a.highestDegree, '-')}  毕业院校：${val(a.highestDegreeInstitution, '-')}  专业：${val(a.highestDegreeMajor, '-')}
- 预定职位：${val(a.intendedPosition, '-')}  计划到岗：${val(a.plannedArrivalDate, '-')}
- 曾有创业经历：${a.hasEntrepreneurExperience ? '是' : '否'}
- 个人简介：${val(a.personalBrief)}
- 主要成就摘要：${val(a.achievementsSummary)}

### 教育经历
${educations}

### 工作经历
${works}

### 代表性专利
${patents}

### 代表性论文
${papers}

### 主持/参与重大项目
${majorProjects}

## 三、核心团队（共 ${(p.teamMembers?.length ?? 0) + 1} 人，含申请人）
- 申请人：${val(a.name)}（主创/带头人）
${team}

## 四、项目内容
### 项目背景
${val(p.projectBackground)}

### 项目内容
${val(p.projectContent)}

### 工作基础
${val(p.workBasis)}

## 五、实施计划
${stages}

## 六、预期效益
### 预期贡献
${val(p.expectedContribution)}

### 经济效益分析
${val(p.economicEfficiency)}

## 七、财务概况
- 总投资预算：${money(p.totalInvestmentForecast)}
- 企业已投入：${money(p.alreadyInvestedByOrg)}
- 已获政府支持：${money(p.govSupportReceived)}
- 企业计划自筹：${money(p.plannedInvestmentByOrg)}

## 八、依托机构
- 机构名称：${val(o.name)}
- 机构类型：${val(o.orgType, '-')}
- 统一信用代码：${val(o.creditCode, '-')}
- 成立日期：${val(o.establishedDate, '-')}
- 注册资本：${money(o.registeredCapital)}
- 员工总数：${o.totalEmployees ?? 0} 人
- 联系人：${val(o.contactPerson, '-')}  联系电话：${val(o.contactPhone, '-')}
- 机构简介：${val(o.orgBrief)}
- 机构荣誉：
${orgHonors}
`
}
