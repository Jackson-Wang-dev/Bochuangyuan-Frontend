// Mirror of apps/entrepreneur-dashboard/src/types/project.ts
// Kept in sync manually; the export server ingests the same JSON shape.

export interface Education {
  country: string
  isFullTime: boolean
  startDate: string
  endDate: string
  institution: string
  major: string
  educationLevel: string
  degreeLevel: string
  isHighestDegree: boolean
}

export interface Work {
  country: string
  startDate: string
  endDate: string | null
  organization: string
  position: string
  workNature: string
  isLastBeforeComeToNingbo: boolean
  isLastBeforeReturnFromAbroad: boolean
}

export interface MajorProject {
  projectName: string
  startDate: string
  endDate: string
  source: string
  undertakingUnit: string
  totalFunding: number
  personalRole: string
}

export interface Paper {
  title: string
  authors: string
  journal: string
  personalRank: number
  totalAuthors: number
  publishDate: string
  impactFactor: number | null
  isCorrespondingAuthor: boolean
}

export interface Patent {
  patentType: string
  name: string
  authorizedCountry: string
  patentNumber: string
  personalRank: number
  totalInventors: number
  authorizedDate: string
  status: string
  isVerified: boolean
}

export interface SoftwareCopyright {
  softwareName: string
  authorizedCountry: string
  registrationNumber: string
  copyrightHolder: string
  approvalDate: string
}

export interface Product {
  productName: string
  relyingUnit: string
  launchDate: string
  impactAndContribution: string
}

export interface Award {
  awardDate: string
  awardName: string
  awardingBody: string
  personalRank: number
}

export interface Book {
  title: string
  publishYear: number
  personalRank: number
  totalAuthors: number
  publisher: string
  publishPlace: string
}

export interface ConferenceReport {
  title: string
  year: number
  personalRank: number
  totalPresenters: number
  conferenceName: string
  reportType: string
}

export interface AcademicPosition {
  organizationOrJournal: string
  position: string
  tenureStart: string
  tenureEnd: string | null
}

export interface FoundedCompany {
  companyName: string
  personalRole: string
  personalPosition: string
  companyInfo: string
  relationToNingboCompany: string
}

export interface TeamMember {
  memberType: string
  name: string
  idType: string
  idNumber: string
  phone: string
  birthDate: string
  age: number
  nationality: string
  division: string
  background: string
}

export interface ProjectStage {
  stageLabel: string
  startDate: string
  endDate: string
  plannedInvestment: number
  stageGoal: string
}

export interface OrgHonor {
  awardDate: string
  honorName: string
  issuingDepartment: string
}

export interface OrgInfo {
  name: string
  orgType: string
  creditCode: string
  establishedDate: string
  registeredCapital: number
  totalEmployees: number
  address: string
  contactPerson: string
  contactPhone: string
  orgBrief: string
  rdExpenditure: number
  rdRevenueRatio: number
  rdPersonnelCount: number
  orgInventionPatentCount: number
  totalRevenue: number
  lastYearProfit: number
  totalFunding: number
  fundingRound: string
  honors: OrgHonor[]
}

export interface RegistrationInfo {
  competitionName: string
  applicationType: string
  professionalDomain: string   // pre-formatted label e.g. "信息技术 > 人工智能 > 智能医疗"
  professionalDirection: string
  introductionArea: string
  declarationName: string
  memberCount: number
  contactPerson: string
  contactPhone: string
  applicationDate: string
}

export interface ExportProject {
  id: string
  declarationName: string
  projectName: string
  coreTech: string
  applicant: {
    name: string
    nameEn: string
    nameNative: string
    gender: string
    birthDate: string
    birthPlace: string
    nationality: string
    isEthnicChinese: boolean
    idType: string
    idNumber: string
    idExpiry: string
    phone: string
    email: string
    highestDegree: string
    highestDegreeInstitution: string
    highestDegreeMajor: string
    isFullTimeOnBoarded: boolean
    intendedPosition: string
    plannedArrivalDate: string
    laborContractStart: string
    laborContractEnd: string
    comeToNingboDate: string
    lastOrgBeforeComeToNingbo: string
    returnFromAbroadDate: string
    lastOrgBeforeReturnFromAbroad: string
    honorsCertificates: string
    legalIssues: { hasIssue: boolean; description: string }
    personalBrief: string
    achievementsSummary: string
    hasEntrepreneurExperience: boolean
    educations: Education[]
    works: Work[]
    majorProjects: MajorProject[]
    papers: Paper[]
    patents: Patent[]
    softwareCopyrights: SoftwareCopyright[]
    products: Product[]
    awards: Award[]
    books: Book[]
    conferenceReports: ConferenceReport[]
    academicPositions: AcademicPosition[]
    foundedCompanies: FoundedCompany[]
  }
  teamMembers: TeamMember[]
  projectBrief: string
  projectBackground: string
  projectContent: string
  projectStages: ProjectStage[]
  workBasis: string
  expectedContribution: string
  economicEfficiency: string
  totalInvestmentForecast: number
  alreadyInvestedByOrg: number
  govSupportReceived: number
  plannedInvestmentByOrg: number
  orgInfo: OrgInfo
  registration: RegistrationInfo | null
}
