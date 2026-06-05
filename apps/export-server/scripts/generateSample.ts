import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { generateApplicationDocx } from '../src/wordGenerator.js'
import type { ExportProject } from '../src/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const sample: ExportProject = {
  id: 'nvmed-001',
  declarationName: 'NovaMed AI 辅助诊断',
  projectName: '基于大模型的医学影像 AI 辅助诊断系统',
  coreTech: '大语言模型、医学影像深度学习（US12345678）',

  applicant: {
    name: '陈博士',
    nameEn: 'Chen Bo',
    nameNative: '',
    gender: '男',
    birthDate: '1990-01-01',
    birthPlace: '浙江省杭州市',
    nationality: '中国',
    isEthnicChinese: false,
    idType: '居民身份证',
    idNumber: '330100199001011234',
    idExpiry: '2040-01-01',
    phone: '13800138001',
    email: 'chen@novamed.ai',
    highestDegree: '博士',
    highestDegreeInstitution: '清华大学',
    highestDegreeMajor: '生物医学工程',
    isFullTimeOnBoarded: true,
    intendedPosition: 'CEO/首席执行官',
    plannedArrivalDate: '2022-06-01',
    laborContractStart: '2022-06-01',
    laborContractEnd: '2025-05-31',
    comeToNingboDate: '2022-06',
    lastOrgBeforeComeToNingbo: '清华大学医学院（博士后）',
    returnFromAbroadDate: '',
    lastOrgBeforeReturnFromAbroad: '',
    honorsCertificates: '2021年度教育部科技进步一等奖（参与）；国家奖学金。',
    legalIssues: { hasIssue: false, description: '' },
    personalBrief: '陈博士，清华大学生物医学工程博士，专注医学影像 AI 方向，2022年来宁创业，担任 NovaMed 医疗科技 CEO。',
    achievementsSummary: '博士期间以第一作者发表 Nature Medicine 论文，影响因子 82.9；主持国家自然科学基金面上项目；拥有 3 项发明专利。',
    hasEntrepreneurExperience: true,

    educations: [
      {
        country: '中国', isFullTime: true,
        startDate: '2008-09', endDate: '2012-06',
        institution: '清华大学', major: '生物医学工程',
        educationLevel: '本科', degreeLevel: '本科',
        isHighestDegree: false,
      },
      {
        country: '中国', isFullTime: true,
        startDate: '2012-09', endDate: '2018-06',
        institution: '清华大学', major: '生物医学工程',
        educationLevel: '博士研究生', degreeLevel: '博士',
        isHighestDegree: true,
      },
    ],

    works: [
      {
        country: '中国',
        startDate: '2018-07', endDate: '2022-05',
        organization: '宁波市第一医院',
        position: '影像科主任',
        workNature: '全职',
        isLastBeforeComeToNingbo: true,
        isLastBeforeReturnFromAbroad: false,
      },
    ],

    majorProjects: [
      {
        projectName: '基于深度学习的胸部CT智能诊断系统',
        startDate: '2020-01', endDate: '2022-12',
        source: '国家级',
        undertakingUnit: '宁波市第一医院',
        totalFunding: 200,
        personalRole: '项目负责人',
      },
    ],

    papers: [
      {
        title: 'LLM-Enhanced Chest CT Interpretation',
        authors: 'Chen X, Wang Y, Li Z',
        journal: 'Nature Medicine',
        personalRank: 1, totalAuthors: 3,
        publishDate: '2025-03',
        impactFactor: 82.9,
        isCorrespondingAuthor: true,
      },
      {
        title: '大模型辅助病理诊断的临床研究',
        authors: '陈某某, 王某, 李某',
        journal: '中华医学杂志',
        personalRank: 1, totalAuthors: 3,
        publishDate: '2024-11',
        impactFactor: null,
        isCorrespondingAuthor: true,
      },
    ],

    patents: [
      {
        patentType: '发明专利',
        name: '基于大语言模型的医学影像解读方法',
        authorizedCountry: '美国',
        patentNumber: 'US12345678',
        personalRank: 1, totalInventors: 3,
        authorizedDate: '2024-08',
        status: '已授权',
        isVerified: true,
      },
      {
        patentType: '发明专利',
        name: '多模态医学影像融合诊断装置',
        authorizedCountry: '中国',
        patentNumber: 'ZL202310012345.6',
        personalRank: 1, totalInventors: 4,
        authorizedDate: '2025-02',
        status: '已授权',
        isVerified: true,
      },
      {
        patentType: '发明专利',
        name: '病理切片自动标注系统',
        authorizedCountry: '中国',
        patentNumber: 'ZL202410056789.0',
        personalRank: 1, totalInventors: 2,
        authorizedDate: '2025-07',
        status: '已授权',
        isVerified: false,
      },
    ],

    softwareCopyrights: [
      {
        softwareName: 'NovaMed 医学影像 AI 分析软件 V1.0',
        authorizedCountry: '中国',
        registrationNumber: '2024SR0123456',
        copyrightHolder: 'NovaMed 医疗科技有限公司',
        approvalDate: '2024-06-15',
      },
    ],

    products: [
      {
        productName: 'NovaMed 胸部 CT 辅助诊断模块',
        relyingUnit: 'NovaMed 医疗科技有限公司',
        launchDate: '2025-01',
        impactAndContribution: '已在3家三甲医院落地，月均处理影像1.2万例，误诊率降低43%，本人负责算法研发与临床验证。',
      },
    ],

    awards: [
      {
        awardDate: '2025-02',
        awardName: '第三届全国医疗 AI 创新大赛一等奖',
        awardingBody: '中国医学装备协会',
        personalRank: 1,
      },
    ],

    books: [],

    conferenceReports: [
      {
        title: 'Foundation Model for Radiology: Challenges and Opportunities',
        year: 2024,
        personalRank: 1, totalPresenters: 1,
        conferenceName: 'MICCAI 2024',
        reportType: '特邀报告',
      },
    ],

    academicPositions: [],
    foundedCompanies: [],
  },

  teamMembers: [
    {
      memberType: '核心成员',
      name: '王工',
      idType: '居民身份证',
      idNumber: '330100199205156789',
      phone: '13800138002',
      birthDate: '1992-05-15',
      age: 33,
      nationality: '中国',
      division: '后端架构与 MLOps',
      background: '浙大计算机硕士，5年 MLOps 经验',
    },
    {
      memberType: '核心成员',
      name: '刘医生',
      idType: '居民身份证',
      idNumber: '330100198803201234',
      phone: '13800138003',
      birthDate: '1988-03-20',
      age: 37,
      nationality: '中国',
      division: '临床验证与医学顾问',
      background: '主任医师，影像科从业15年',
    },
  ],

  projectBrief: '本项目基于大语言模型与医学影像深度学习，开发端到端 AI 辅助诊断系统，覆盖 CT、X 光、病理切片等主要影像类型，辅助影像科医生提升诊断效率与准确率，预期将误诊率降低 40% 以上。',

  projectBackground: '随着我国医疗数字化转型加速，医学影像数量每年以35%以上的速度增长，而专业影像科医生数量严重不足，全国缺口预计超过20万人。AI 辅助诊断是弥合供需缺口、提升基层医疗水平的关键技术路径。',

  projectContent: '本项目以大语言模型为核心，融合医学影像深度学习技术，开发端到端的 AI 辅助诊断系统。系统包含影像预处理模块、多模态特征提取模块、LLM 推理与报告生成模块，以及临床闭环反馈模块，支持 CT、X 光、病理切片等多种影像类型的自动化解读与结构化报告输出。',

  projectStages: [
    {
      stageLabel: '第一阶段',
      startDate: '2024-09', endDate: '2025-06',
      plannedInvestment: 150,
      stageGoal: '完成核心算法研发，在2家三甲医院完成小试，误诊率降低≥30%',
    },
    {
      stageLabel: '第二阶段',
      startDate: '2025-07', endDate: '2026-06',
      plannedInvestment: 300,
      stageGoal: '扩展至10家医院，完成三类医疗器械注册证申请，实现商业化收入≥500万元',
    },
  ],

  workBasis: '团队已完成3年基础研究积累，拥有3项发明专利、1项软件著作权，已在宁波市第一医院完成200例临床验证，系统精度达到副主任医师水平。',

  expectedContribution: '验收指标：产品获三类医疗器械注册证；在10家三甲医院部署；误诊率较传统方法降低≥40%；年营业收入≥500万元。',

  economicEfficiency: '预计2026年实现营收500万元，2027年实现盈亏平衡，2028年营收超3000万元，带动就业岗位≥50个，具有显著社会效益。',

  totalInvestmentForecast: 800,
  alreadyInvestedByOrg: 150,
  govSupportReceived: 100,
  plannedInvestmentByOrg: 550,

  orgInfo: {
    name: 'NovaMed 医疗科技有限公司',
    orgType: '有限责任公司',
    creditCode: '91330200MA2XXXXXX1',
    establishedDate: '2022-08',
    registeredCapital: 500,
    totalEmployees: 16,
    address: '宁波市高新区研发园 A 栋 305',
    contactPerson: '陈博士',
    contactPhone: '13800138001',
    orgBrief: 'NovaMed 医疗科技有限公司成立于2022年，专注于医学影像 AI 辅助诊断领域，已完成 A 轮融资 500 万元，获宁波市高新技术企业认定。',
    rdExpenditure: 150,
    rdRevenueRatio: 62.5,
    rdPersonnelCount: 10,
    orgInventionPatentCount: 3,
    totalRevenue: 80,
    lastYearProfit: -60,
    totalFunding: 500,
    fundingRound: 'A轮',
    honors: [
      { awardDate: '2024-12', honorName: '宁波市高新技术企业', issuingDepartment: '宁波市科学技术局' },
      { awardDate: '2025-03', honorName: '工信部"专精特新"培育企业', issuingDepartment: '工业和信息化部' },
    ],
  },

  registration: {
    competitionName: '博创园第二届海外英才创业大赛',
    applicationType: '创业组',
    professionalDomain: '信息技术 > 人工智能 > 智能医疗',
    professionalDirection: '医学影像 AI 辅助诊断',
    introductionArea: '宁波市',
    declarationName: 'NovaMed AI 辅助诊断',
    memberCount: 3,
    contactPerson: '陈博士',
    contactPhone: '13800138001',
    applicationDate: '2026-06-01',
  },
}

const buf = await generateApplicationDocx(sample)
const outPath = join(__dirname, '..', 'sample-application.docx')
writeFileSync(outPath, buf)
console.log(`✓ Written: ${outPath}`)
