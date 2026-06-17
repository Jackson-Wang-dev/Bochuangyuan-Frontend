import type { ReviewSectionDef } from './types'

/**
 * Canonical layout of project fields into review volumes.
 *
 * blind  — visible to all reviewers; reveals the project's technical content
 *          but hides applicant identity and organisation info.
 * open   — unlocked after the blind stage; reveals full identity information.
 *
 * Rules encoded here:
 * - Cover & project content → blind (no identity signals)
 * - Investment & milestones → blind
 * - Academic / IP achievements → blind (institution names are masked by backend)
 * - Applicant personal info & history → open
 * - Organisation info → open
 */
export const REVIEW_SECTIONS: ReviewSectionDef[] = [
  // ── Blind volume ───────────────────────────────────────────────────────────

  {
    id: 'cover',
    title: '封面信息',
    volume: 'blind',
    fieldKeys: ['declarationName', 'projectName', 'coreTech', 'projectBrief'],
    collectionKeys: [],
  },
  {
    id: 'project-info',
    title: '项目内容',
    volume: 'blind',
    fieldKeys: [
      'projectBackground',
      'projectContent',
      'workBasis',
      'expectedContribution',
      'economicEfficiency',
    ],
    collectionKeys: [],
  },
  {
    id: 'investment',
    title: '投资计划',
    volume: 'blind',
    fieldKeys: [
      'totalInvestmentForecast',
      'alreadyInvestedByOrg',
      'govSupportReceived',
      'plannedInvestmentByOrg',
    ],
    collectionKeys: ['projectStages'],
  },
  {
    id: 'achievements',
    title: '成果业绩',
    volume: 'blind',
    fieldKeys: [],
    collectionKeys: [
      'majorProjects',
      'papers',
      'patents',
      'softwareCopyrights',
      'products',
      'awards',
      'books',
      'conferenceReports',
      'academicPositions',
    ],
  },

  // ── Open volume ────────────────────────────────────────────────────────────

  {
    id: 'applicant',
    title: '申报人信息',
    volume: 'open',
    fieldKeys: [
      'aName', 'aNameEn', 'aGender', 'aBirthDate', 'aNationality',
      'aIsEthnicChinese', 'aBirthPlace', 'aIdType', 'aEmail',
      'aHighestDegree', 'aHighestDegreeInstitution', 'aHighestDegreeMajor',
      'aIntendedPosition', 'aLastOrgBeforeComeToNingbo',
      'aLastOrgBeforeReturnFromAbroad', 'aHonorsCertificates',
    ],
    collectionKeys: ['educations', 'works'],
  },
  {
    id: 'personal-statement',
    title: '个人陈述',
    volume: 'open',
    fieldKeys: [
      'personalBrief',
      'achievementsSummary',
      'hasEntrepreneurExperience',
      'legalIssuesHasIssue',
      'legalIssuesDescription',
    ],
    collectionKeys: ['foundedCompanies'],
  },
  {
    id: 'organization',
    title: '用人单位',
    volume: 'open',
    fieldKeys: [
      'oName', 'oOrgType', 'oEstablishedDate', 'oRegisteredCapital',
      'oTotalEmployees', 'oAddress', 'oContactPerson', 'oOrgBrief',
      'oRdExpenditure', 'oRdRevenueRatio', 'oRdPersonnelCount',
      'oOrgInventionPatentCount', 'oTotalRevenue', 'oLastYearProfit',
      'oTotalFunding', 'oFundingRound',
    ],
    collectionKeys: ['honors'],
  },
]

export const BLIND_SECTIONS = REVIEW_SECTIONS.filter((s) => s.volume === 'blind')
export const OPEN_SECTIONS = REVIEW_SECTIONS.filter((s) => s.volume === 'open')

/** O(1) lookup by section id */
export const REVIEW_SECTION_MAP: ReadonlyMap<string, ReviewSectionDef> = new Map(
  REVIEW_SECTIONS.map((s) => [s.id, s]),
)
