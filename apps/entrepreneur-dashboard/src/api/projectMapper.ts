import type { Project, Applicant, OrgInfo, VerificationStatusValue } from '@/types/project'
import type { ApiProject, ApiProjectListItem, CreateProjectDto } from './project'

// ─── API → Project (full response) ───────────────────────────────────────────

export function apiToProject(api: ApiProject): Project {
  const a = api.applicant
  const o = api.orgInfo
  return {
    id: String(api.id),
    declarationName: api.declarationName,
    projectName: api.projectName,
    coverImage: api.coverImage,
    professionalDomain: api.professionalDomain as Project['professionalDomain'],
    coreTech: api.coreTech,
    applicant: {
      ...a,
      highestDegree: a.highestDegree as Applicant['highestDegree'],
      // fields absent in backend response — fill defaults
      nameNative: '',
      isEthnicChinese: false,
      idExpiry: '',
      honorsCertificates: '',
      legalIssues: { hasIssue: false, description: '' },
      softwareCopyrights: [],
      products: [],
      awards: [],
      books: [],
      conferenceReports: [],
      academicPositions: [],
      foundedCompanies: [],
    } as Applicant,
    teamMembers: api.teamMembers,
    projectBrief: api.projectBrief,
    projectBackground: api.projectBackground,
    projectContent: api.projectContent,
    projectStages: api.projectStages,
    workBasis: api.workBasis,
    expectedContribution: api.expectedContribution,
    economicEfficiency: api.economicEfficiency,
    totalInvestmentForecast: api.totalInvestmentForecast,
    alreadyInvestedByOrg: api.alreadyInvestedByOrg,
    govSupportReceived: api.govSupportReceived,
    plannedInvestmentByOrg: api.plannedInvestmentByOrg,
    orgInfo: {
      ...o,
      // fields absent in backend response — fill defaults
      rdExpenditure: 0,
      rdRevenueRatio: 0,
      rdPersonnelCount: 0,
      orgInventionPatentCount: 0,
      totalRevenue: 0,
      lastYearProfit: 0,
      totalFunding: 0,
      fundingRound: '',
    } as OrgInfo,
    attachments: [],
    registrations: [],
    events: [],
    snapshots: {},
    verificationStatus: {
      teamMembers:   (api.verificationStatus?.['teamMembers']   as VerificationStatusValue) ?? 'unverified',
      patents:       (api.verificationStatus?.['patents']       as VerificationStatusValue) ?? 'unverified',
      totalFunding:  (api.verificationStatus?.['totalFunding']  as VerificationStatusValue) ?? 'unverified',
      rdExpenditure: (api.verificationStatus?.['rdExpenditure'] as VerificationStatusValue) ?? 'unverified',
      totalRevenue:  (api.verificationStatus?.['totalRevenue']  as VerificationStatusValue) ?? 'unverified',
    },
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  }
}

// ─── Summary → Project (list endpoint, minimal data) ─────────────────────────

export function summaryToProject(item: ApiProjectListItem): Project {
  const now = item.createdAt
  return {
    id: String(item.id),
    declarationName: item.declarationName,
    projectName: item.projectName,
    coverImage: null,
    professionalDomain: {},
    coreTech: '',
    applicant: {
      name: item.applicantName ?? '', nameEn: '', nameNative: '',
      gender: '男', birthDate: '', birthPlace: '',
      nationality: '', isEthnicChinese: false,
      idType: '居民身份证', idNumber: '', idExpiry: '',
      phone: item.applicantPhone ?? '', email: '',
      highestDegree: '博士',
      highestDegreeInstitution: '', highestDegreeMajor: '',
      isFullTimeOnBoarded: false, intendedPosition: '',
      plannedArrivalDate: '', laborContractStart: '', laborContractEnd: '',
      comeToNingboDate: '', lastOrgBeforeComeToNingbo: '',
      returnFromAbroadDate: '', lastOrgBeforeReturnFromAbroad: '',
      honorsCertificates: '',
      legalIssues: { hasIssue: false, description: '' },
      personalBrief: '', achievementsSummary: '',
      hasEntrepreneurExperience: false,
      educations: [], works: [], majorProjects: [], papers: [], patents: [],
      softwareCopyrights: [], products: [], awards: [], books: [],
      conferenceReports: [], academicPositions: [], foundedCompanies: [],
    },
    teamMembers: [],
    projectBrief: item.projectBrief,
    projectBackground: '', projectContent: '',
    projectStages: [], workBasis: '',
    expectedContribution: '', economicEfficiency: '',
    totalInvestmentForecast: 0, alreadyInvestedByOrg: 0,
    govSupportReceived: 0, plannedInvestmentByOrg: 0,
    orgInfo: {
      name: '', orgType: '', creditCode: '', establishedDate: '',
      registeredCapital: 0, totalEmployees: 0, address: '',
      contactPerson: '', contactPhone: '', orgBrief: '',
      rdExpenditure: 0, rdRevenueRatio: 0, rdPersonnelCount: 0,
      orgInventionPatentCount: 0, totalRevenue: 0, lastYearProfit: 0,
      totalFunding: 0, fundingRound: '', honors: [],
    },
    attachments: [], registrations: [], events: [], snapshots: {},
    verificationStatus: {
      teamMembers: 'unverified', patents: 'unverified',
      totalFunding: 'unverified', rdExpenditure: 'unverified', totalRevenue: 'unverified',
    },
    createdAt: now,
    updatedAt: item.updatedAt,
  }
}

// ─── Project → CreateProjectDto ───────────────────────────────────────────────

export function projectToCreateDto(project: Project): CreateProjectDto {
  const a = project.applicant
  const o = project.orgInfo
  return {
    declarationName: project.declarationName,
    projectName: project.projectName,
    coverImage: project.coverImage ?? undefined,
    professionalDomain: project.professionalDomain as Record<string, unknown>,
    coreTech: project.coreTech,
    projectBrief: project.projectBrief,
    applicant: {
      name: a.name, nameEn: a.nameEn,
      gender: a.gender, birthDate: a.birthDate, birthPlace: a.birthPlace,
      nationality: a.nationality,
      idType: a.idType, idNumber: a.idNumber,
      phone: a.phone, email: a.email,
      highestDegree: a.highestDegree,
      highestDegreeInstitution: a.highestDegreeInstitution,
      highestDegreeMajor: a.highestDegreeMajor,
      isFullTimeOnBoarded: a.isFullTimeOnBoarded,
      intendedPosition: a.intendedPosition,
      plannedArrivalDate: a.plannedArrivalDate,
      laborContractStart: a.laborContractStart,
      laborContractEnd: a.laborContractEnd,
      comeToNingboDate: a.comeToNingboDate,
      lastOrgBeforeComeToNingbo: a.lastOrgBeforeComeToNingbo,
      returnFromAbroadDate: a.returnFromAbroadDate,
      lastOrgBeforeReturnFromAbroad: a.lastOrgBeforeReturnFromAbroad,
      personalBrief: a.personalBrief,
      achievementsSummary: a.achievementsSummary,
      hasEntrepreneurExperience: a.hasEntrepreneurExperience,
      educations: a.educations,
      works: a.works,
      majorProjects: a.majorProjects,
      papers: a.papers,
      patents: a.patents,
    },
    teamMembers: project.teamMembers,
    projectBackground: project.projectBackground,
    projectContent: project.projectContent,
    projectStages: project.projectStages,
    workBasis: project.workBasis,
    expectedContribution: project.expectedContribution,
    economicEfficiency: project.economicEfficiency,
    totalInvestmentForecast: project.totalInvestmentForecast,
    alreadyInvestedByOrg: project.alreadyInvestedByOrg,
    govSupportReceived: project.govSupportReceived,
    plannedInvestmentByOrg: project.plannedInvestmentByOrg,
    orgInfo: {
      name: o.name, orgType: o.orgType, creditCode: o.creditCode,
      establishedDate: o.establishedDate,
      registeredCapital: o.registeredCapital,
      totalEmployees: o.totalEmployees,
      address: o.address,
      contactPerson: o.contactPerson, contactPhone: o.contactPhone,
      orgBrief: o.orgBrief,
      honors: o.honors,
    },
    status: '草稿',
    commitmentChecked: false,
  }
}
