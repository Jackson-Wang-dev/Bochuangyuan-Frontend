import type {
  Expert,
  ReviewGroup,
  Competition,
  RubricDimension,
  ReviewProject,
  ProjectPayload,
  RiskReport,
  AIObjectiveScore,
  AIChallenge,
  Annotation,
  ScoreSubmission,
  ReScoringRequest,
  Assignment,
  AnnotationViewer,
  ReviewStageType,
  ID,
} from '@/types/domain'
import type {
  ReviewService,
  CreateAnnotationInput,
  UpdateAnnotationInput,
  ScoreInput,
  CreateReScoringRequestInput,
} from './ReviewService'

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const EXPERTS: Expert[] = [
  { id: 'exp-leader', name: '张明', role: 'leader', groupId: 'grp-1' },
  { id: 'exp-a', name: '李华', role: 'reviewer', groupId: 'grp-1' },
  { id: 'exp-b', name: '王芳', role: 'reviewer', groupId: 'grp-1' },
]

const GROUPS: ReviewGroup[] = [
  {
    id: 'grp-1',
    competitionId: 'comp-bcup',
    name: '第一评审组',
    leaderId: 'exp-leader',
    memberIds: ['exp-a', 'exp-b'],
  },
]

const COMPETITIONS: Competition[] = [
  {
    id: 'comp-bcup',
    name: '博创杯双创大赛 2024',
    rubric: [
      { id: 'dim-bcup-1', name: '创新性', description: '项目技术路线和商业模式的原创程度与颠覆性', maxScore: 100, weight: 0.35 },
      { id: 'dim-bcup-2', name: '技术成熟度', description: '核心技术验证深度、专利布局与产品化进程', maxScore: 100, weight: 0.25 },
      { id: 'dim-bcup-3', name: '市场前景', description: '目标市场规模、竞争格局与增长潜力', maxScore: 100, weight: 0.20 },
      { id: 'dim-bcup-4', name: '团队能力', description: '核心团队背景、执行力与组织完整度', maxScore: 100, weight: 0.20 },
    ],
  },
  {
    id: 'comp-nat',
    name: '全国大学生创业大赛 2024',
    rubric: [
      { id: 'dim-nat-1', name: '项目创新性', description: '技术或模式创新的深度和广度', maxScore: 100, weight: 0.30 },
      { id: 'dim-nat-2', name: '商业模式', description: '盈利路径清晰度与可持续性', maxScore: 100, weight: 0.25 },
      { id: 'dim-nat-3', name: '技术壁垒', description: '核心技术的保护程度和复制难度', maxScore: 100, weight: 0.25 },
      { id: 'dim-nat-4', name: '社会价值', description: '解决社会问题的深度与覆盖广度', maxScore: 100, weight: 0.20 },
    ],
  },
  {
    id: 'comp-carbon',
    name: '绿色双碳创新创业大赛',
    rubric: [
      { id: 'dim-carb-1', name: '绿色创新', description: '碳减排路径的技术原创性和生态友好度', maxScore: 100, weight: 0.40 },
      { id: 'dim-carb-2', name: '技术可行性', description: '核心技术的工程化能力与风险把控', maxScore: 100, weight: 0.30 },
      { id: 'dim-carb-3', name: '市场潜力', description: '碳中和政策背景下的市场规模与商业化速度', maxScore: 100, weight: 0.30 },
    ],
  },
]

// Field IDs match the stable field keys defined in packages/shared/src/projectForm/scalarFields.ts.
// Section IDs match REVIEW_SECTIONS in packages/shared/src/projectForm/reviewSections.ts.
// This alignment lets AIChallenge and Annotation anchors resolve to real form fields.

const PROJECTS: ReviewProject[] = [
  {
    id: 'proj-1',
    competitionId: 'comp-bcup',
    title: 'AI 分布式算力平台',
    blindVolume: {
      id: 'vol-1-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>AI 分布式算力平台</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>区块链共识机制 + 深度强化学习（DRL）算力调度</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>基于区块链+AI调度的分布式算力平台，将全球闲置 GPU 算力汇聚成统一资源池，为中小企业和科研机构提供低成本、高弹性的算力服务，按需付费降低门槛 60% 以上。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>中小企业和科研机构面临算力成本高、采购周期长、资源闲置严重等问题。全球 GPU 闲置率约 60%，存在巨大供需错配。本平台通过共享经济模式实现算力资源的高效配置。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<p>三层架构：① 资源层（GPU 节点注册与心跳）、② 调度层（DRL 引擎 + 区块链验证）、③ 应用层（API 网关 + 任务队列）。调度层通过强化学习实现纳秒级任务路由，链上合约保障可信结算。</p>', type: 'text' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>已申请发明专利 3 项，核心调度算法具备独特性。MVP 已上线，接入 GPU 节点 1200+ 个，完成 Beta 测试；CTO 具备 10 年分布式系统工程经验，主导过字节跳动算力调度系统 v3 重构。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 年末：节点规模达 5000+，月均任务量超 50 万次，SLA 99.9%；专利授权 ≥2 项；完成首批 10 家企业私有化部署。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>国内中小算力市场规模约 800 亿元（IDC 2024），预计 2026 年突破 1500 亿，CAGR 约 22%。2025 年营收目标 2000 万元，2027 年净利率 20%+。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-1-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>张伟</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>博士</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>清华大学</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>计算机科学与技术</p>', type: 'text' },
            { id: 'aIntendedPosition', label: '拟任职务', valueHtml: '<p>CEO / 联合创始人</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>清华大学计算机系博士，发表顶会论文 8 篇，曾任百度 AI 实验室研究员；连续创业者，具有工程化落地经验。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波算链科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oFundingRound', label: '融资阶段', valueHtml: '<p>Pre-A 轮</p>', type: 'text' },
            { id: 'oTotalFunding', label: '累计融资额（万元）', valueHtml: '<p>2500（天使轮 500 + Pre-A 轮 2000）</p>', type: 'number' },
            { id: 'oTotalRevenue', label: '总营收（万元）', valueHtml: '<p>185（2024 年累计）</p>', type: 'number' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>专注分布式 AI 算力共享平台，2023 年成立，月均增速 35%，毛利率约 68%。核心团队来自清华、字节跳动、百度。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>张伟</td><td>CEO / 联创</td><td>清华大学 博士（CS）</td><td>百度 AI 实验室研究员；发表顶会论文 8 篇</td></tr><tr><td>李强</td><td>CTO / 联创</td><td>MIT 博士（分布式系统）</td><td>前字节跳动基础架构部负责人，主导算力调度系统 v3 重构</td></tr><tr><td>刘思远</td><td>COO</td><td>北京大学 硕士（金融）</td><td>前阿里云产品总监；主导 5 个 SaaS 产品 0-1 落地</td></tr><tr><td>陈丽</td><td>CFO</td><td>中央财经大学 学士</td><td>CPA；前红杉资本分析师，熟悉 VC/PE 融资流程</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2015–2020　清华大学　计算机科学与技术　博士</li><li>2011–2015　北京大学　计算机科学　学士</li></ul><p><b>工作经历</b></p><ul><li>2020–2023　百度 AI 实验室　高级研究员（主攻分布式推理加速）</li><li>2023–至今　宁波算链科技有限公司　CEO / 联合创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>发明专利（申请中）</b>：一种基于深度强化学习的 GPU 算力调度方法（申请号 202410xxxxxx.X）</li><li><b>发明专利（申请中）</b>：基于区块链的分布式算力可信结算系统（申请号 202410xxxxxx.7）</li><li><b>发明专利（申请中）</b>：算力节点信誉评估与动态黑名单机制</li><li><b>软件著作权</b>：算力共享调度平台 V1.0（2024SR0xxxxxx）</li><li><b>学术论文</b>：DRL-based Heterogeneous GPU Scheduling for Shared Computing Platforms，ICML 2024 Workshop（已录用）</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>商业计划书 v2.1（PDF，45 页）</li><li>技术方案白皮书（PDF，28 页）</li><li>专利申请受理通知书 × 3（PDF）</li><li>软件著作权登记证书（PDF）</li><li>MVP 压测报告（在线 1200 节点，PDF）</li><li>公司营业执照（PDF）</li><li>团队成员学历证书（PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
  {
    id: 'proj-2',
    competitionId: 'comp-carbon',
    title: '碳中和智能监测系统',
    blindVolume: {
      id: 'vol-2-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>碳中和智能监测系统</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>IoT 多模态传感 + LSTM/GNN 碳排放异常检测与溯源</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>利用自研低功耗传感模组与边缘 AI，构建覆盖工业园区的碳排放实时监测平台，精度较人工抄表提升 40%，合规报告生成从 5 天压缩至 2 小时。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>工业园区碳排放数据采集依赖人工抄表，误差率高达 15%，无法支持实时预警与溯源，严重制约碳中和政策落地。双碳目标下，合规成本急剧上升。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<ul><li>自研 NDIR+电化学双冗余传感模组（LoRa/NB-IoT 双模）</li><li>边缘层：ESP32 预处理 + 本地异常缓存</li><li>云端：Flink 流处理 + ClickHouse 时序存储</li><li>AI 层：Isolation Forest + LSTM 融合异常检测 + GNN 溯源</li><li>CCER 标准合规报告自动生成</li></ul>', type: 'list' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>核心传感器团队具备 8 年物联网硬件经验；F1 分数 0.91（工业园区测试集）；极端天气工况专项调优后精度保持 0.87+；已完成 3 家园区 POC。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 年底：接入园区企业 500+，监测传感节点 5000+，CCER 报告自动化率 100%；申请发明专利 2 项；通过等保二级认证。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>碳排放管理 SaaS 市场 2025 年预计达 150 亿元。2025 年营收目标 800 万元，2026 年实现盈亏平衡，毛利率目标 65%+。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-2-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>陈晓燕</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>博士</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>同济大学</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>环境科学与工程</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>同济大学环境科学与工程博士，国家碳排放核算标准参编人，曾主持省级碳监测项目，在碳排放管理领域从业 10 年。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波绿感科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>已与 3 家工业园区管委会签署战略合作协议，覆盖企业 80+ 家；2 家头部化工企业完成 POC。纳入市级绿色创新试点，获市科委专项资金 100 万元，省级双碳专项申请中。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>陈晓燕</td><td>CEO / 联创</td><td>同济大学 博士（环境科学）</td><td>国家 CCER 碳核算标准参编人；省级碳监测项目主持人</td></tr><tr><td>刘威</td><td>CTO</td><td>浙江大学 硕士（电子信息）</td><td>前华为物联网事业部高级工程师；主导 LoRa 大规模组网方案</td></tr><tr><td>沈志远</td><td>首席科学家</td><td>中科院大气所 博士</td><td>大气环境监测算法专家；合作发表 SCI 论文 3 篇</td></tr><tr><td>张玲</td><td>CMO</td><td>复旦大学 MBA</td><td>前碳资产管理公司总监；工业园区政府关系资源</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2014–2018　同济大学　环境科学与工程　博士</li><li>2010–2014　武汉大学　环境科学　学士</li></ul><p><b>工作经历</b></p><ul><li>2018–2021　生态环境部华东督察局　技术参谋（负责 CCER 核算标准参编）</li><li>2021–至今　宁波绿感科技有限公司　CEO / 联合创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>发明专利（申请中）</b>：基于多模态传感融合的碳排放在线监测方法</li><li><b>发明专利（申请中）</b>：CCER 标准碳排放报告自动生成系统</li><li><b>实用新型专利（已授权）</b>：低功耗 NDIR+电化学双冗余传感模组（ZU2023xxxxxx）</li><li><b>实用新型专利（已授权）</b>：边缘层碳排放数据本地缓存与断点续传装置</li><li><b>软件著作权</b>：碳排放智能监测云平台 V2.0（2024SR0xxxxxx）</li><li><b>参编国标</b>：GB/T xxxxx—2023《工业源碳排放在线连续监测技术规范》（第 3 参编单位）</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>产品演示视频（MP4，8 分钟）</li><li>园区 POC 验收报告 × 3（PDF）</li><li>NDIR 传感器第三方检测报告（SGS，PDF）</li><li>实用新型专利证书 × 2（PDF）</li><li>软件著作权登记证书（PDF）</li><li>市科委专项资金拨付凭证（PDF）</li><li>战略合作协议（已脱敏，PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
  {
    id: 'proj-3',
    competitionId: 'comp-nat',
    title: '医疗影像 AI 辅助诊断',
    blindVolume: {
      id: 'vol-3-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>医疗影像 AI 辅助诊断平台</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>双模态深度学习（肺结节 + 眼底病变联合诊断）+ 在线持续学习</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>业界首个肺结节+眼底病变双模态联合诊断 AI，共享骨干网络降低推理成本 40%，临床验证敏感性 94.2%，已与 3 家三甲医院完成联合验证并进入商业化部署。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>中国肺癌发病率居恶性肿瘤首位，基层医院影像科医生严重不足，早期肺结节漏诊率超 30%；眼底病变（糖尿病性视网膜病变）致盲率高，筛查覆盖率不足 20%。AI 辅助诊断可大幅降低漏诊率并提升基层医疗服务能力。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<p>双模态共享骨干网络架构，引入医师反馈的在线学习机制；产品流程：影像上传 → AI 分析（＜3 秒）→ 结构化报告（含热力图标注）→ 医师确认签署 → 患者推送；支持 PACS/HIS 系统集成。</p>', type: 'text' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>已完成 3 家三甲医院联合临床验证：肺结节敏感性 94.2%（N=12,000），眼底 AUC 0.97（N=8,500），验证报告通过 IRB 审查；已取得欧盟 CE 认证（IIb 类）；NMPA 三类器械注册申请中。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 Q3 获 NMPA 批准；覆盖公立医院 50 家；肺结节漏诊率降低至 5% 以下；发表 SCI 论文 3 篇；软著申请 2 项。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>2024 年 H1 营收 420 万元；单医院 ARR 80~120 万元；2025 年目标营收 2000 万元，毛利率 75%+；TAM 预计 2026 年达 300 亿元。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-3-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>王磊</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>博士</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>北京协和医学院</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>临床医学（影像方向）</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>北京协和医学院临床医学博士，前三甲医院影像科主任；深度学习与医学影像交叉领域创业者，主导 3 家三甲医院临床合作。</p>', type: 'text' },
            { id: 'achievementsSummary', label: '主要成就摘要', valueHtml: '<p>主持省级重点研发项目 2 项；以第一作者发表 SCI 论文 5 篇（最高 IF 12.3）；合作医院已有 5 家完成商业部署，年复购率 100%。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波影智医疗科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oFundingRound', label: '融资阶段', valueHtml: '<p>A 轮（进行中）</p>', type: 'text' },
            { id: 'oTotalRevenue', label: '总营收（万元）', valueHtml: '<p>420（2024 年 H1）</p>', type: 'number' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>已与北京大学人民医院、上海瑞金医院、广州南方医院建立合作；另签 12 家二级医院意向协议；主营 AI 影像 SaaS 订阅服务。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>王磊</td><td>CEO / 联创</td><td>北京协和医学院 博士（临床影像）</td><td>前三甲医院影像科主任；主导 3 家三甲联合临床验证</td></tr><tr><td>林晓明</td><td>CTO</td><td>中科院计算所 博士</td><td>计算机视觉专家；ImageNet 竞赛 Top-3；发表 CVPR/MICCAI 论文 6 篇</td></tr><tr><td>赵明华</td><td>CMO / 医学总监</td><td>上海交通大学 博士</td><td>前上海瑞金医院院长助理；医疗器械注册与临床推广资源丰富</td></tr><tr><td>吴雪</td><td>COO</td><td>清华大学 MBA</td><td>前联影医疗产品运营总监；熟悉公立医院 PACS 集成流程</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2012–2018　北京协和医学院　临床医学（影像方向）　博士</li><li>2006–2012　北京医科大学　临床医学　学士 + 硕士</li></ul><p><b>工作经历</b></p><ul><li>2018–2022　北京大学人民医院　影像科主任（副主任医师）</li><li>2022–至今　宁波影智医疗科技有限公司　CEO / 联合创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>SCI 论文（第一/通讯作者）</b>：Multi-Modal Dual-Task AI for Pulmonary Nodule and Retinal Disease，Radiology 2023（IF 12.3）</li><li><b>SCI 论文</b>：Continual Learning for Medical Image AI in Clinical Deployment，MICCAI 2023（Oral）</li><li><b>SCI 论文</b>：另 3 篇（IF 4.5–8.7），合计 h-index 11</li><li><b>医疗器械注册</b>：欧盟 CE IIb 类认证（证书号 CE202411xxxx，有效期至 2029）</li><li><b>软件著作权</b>：医疗影像 AI 辅助诊断系统 V3.0（2024SR0xxxxxx）</li><li><b>省级重点研发项目</b>：主持浙江省重点研发计划"基层医院 AI 影像诊断能力提升"（立项 2024，经费 200 万元）</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>临床验证报告（3 家三甲医院联合，通过 IRB 审查，PDF）</li><li>技术白皮书（PDF，52 页）</li><li>CE IIb 类认证证书（PDF）</li><li>NMPA 三类器械注册申请受理通知书（PDF）</li><li>SCI 论文代表作 × 2（PDF）</li><li>省级重点研发项目立项批文（PDF）</li><li>公司营业执照及股权架构（PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
  {
    id: 'proj-4',
    competitionId: 'comp-bcup',
    title: '智慧农业无人机系统',
    blindVolume: {
      id: 'vol-4-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>智慧农业多光谱无人机系统</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>多光谱成像（5 波段）+ AI 病虫害识别（准确率 92%）+ 精准变量喷洒</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>搭载多光谱相机的农业无人机 + AI 病害识别 + SaaS 作业平台，实现"飞行采集→自动识别→精准喷洒"一体化，已覆盖 5 省 320 家合作社，累计作业超 32 万亩。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>病虫害每年造成农业损失超 2000 亿元，传统人工巡查效率低、反应滞后；农药滥用导致环境污染与食品安全风险。无人机+AI 是提升农业生产效率、降低农药使用的关键路径。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<p>多光谱相机：5 波段，分辨率 1cm/pixel；AI 模型：覆盖 50 种常见病害，准确率 92%；单次续航 45 分钟，覆盖约 200 亩；SaaS 平台：作业调度、数据存档、报告生成。</p>', type: 'text' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>核心技术已量产；已完成湖南、湖北、安徽 3 个县级试点（获客成本 1800 元，LTV/CAC≈12）；全国服务网点 23 个，飞手认证人员 85 名。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 年：覆盖省份 10+，合作社 1000+，累计作业面积 100 万亩，平台日活任务 500+；申请发明专利 2 项。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>2024 年营收 680 万元（同比增 210%），毛利率 42%；2025 年目标营收 2000 万元，2026 年盈亏平衡；农业无人机市场 TAM 约 500 亿元。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-4-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>黄建国</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>硕士</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>华中农业大学</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>植物保护（植保专业）</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>华中农业大学植保专业硕士，曾任省农业厅信息化处处长；深耕农业数字化 15 年，熟悉政府资源与渠道网络。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波慧农科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oFundingRound', label: '融资阶段', valueHtml: '<p>A 轮（启动中，目标 5000 万元）</p>', type: 'text' },
            { id: 'oTotalRevenue', label: '总营收（万元）', valueHtml: '<p>680（2024 年）</p>', type: 'number' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>已覆盖 5 省（湘、鄂、皖、粤、豫），签约合作社 320 家，全国服务网点 23 个，飞手 85 名，累计作业 32 万亩。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>黄建国</td><td>CEO / 联创</td><td>华中农业大学 硕士（植保）</td><td>前省农业厅信息化处处长；深耕农业数字化 15 年</td></tr><tr><td>田辉</td><td>CTO</td><td>北京航空航天大学 博士</td><td>无人机飞控系统专家；前大疆农业技术总监</td></tr><tr><td>周刚</td><td>COO / 渠道总监</td><td>华南农业大学 学士</td><td>农资连锁渠道 12 年经验；主导 5 省网点快速铺设</td></tr><tr><td>李建</td><td>CFO</td><td>中山大学 硕士（会计）</td><td>前农业银行信贷经理；熟悉农业供应链金融</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2003–2006　华中农业大学　植物保护　硕士</li><li>1999–2003　湖南农业大学　植物保护　学士</li></ul><p><b>工作经历</b></p><ul><li>2006–2021　湖南省农业农村厅信息化处　处长（负责全省农业数字化顶层规划）</li><li>2021–至今　宁波慧农科技有限公司　CEO / 联合创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>发明专利（申请中）</b>：基于多光谱图像的农作物病虫害智能识别方法（申请号 202410xxxxxx）</li><li><b>发明专利（申请中）</b>：无人机精准变量施药路径规划算法</li><li><b>实用新型专利（已授权）</b>：五波段多光谱相机快速标定装置（ZU2023xxxxxx）× 3</li><li><b>软件著作权</b>：慧农 SaaS 作业平台 V2.0（2024SR0xxxxxx）</li><li><b>行业标准参编</b>：农业农村部《无人机植保作业规范》（T/CAMA xxxx-2023，第 2 参编单位）</li><li><b>省级科技奖项</b>：湖南省农业科技进步奖二等奖（2023 年度）</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>产品介绍与演示视频（MP4，6 分钟）</li><li>多光谱相机第三方检测报告（PDF）</li><li>3 个县级 POC 验收报告（PDF）</li><li>实用新型专利证书 × 3（PDF）</li><li>软件著作权登记证书（PDF）</li><li>飞手资质证书样本（CAAC 无人机操控员，PDF）</li><li>公司营业执照及 A 轮融资意向协议（已脱敏，PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
  // ─── proj-5 ───────────────────────────────────────────────────────────────
  {
    id: 'proj-5',
    competitionId: 'comp-carbon',
    title: '动力电池全生命周期管理平台',
    blindVolume: {
      id: 'vol-5-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>动力电池全生命周期管理平台</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>电化学阻抗谱（EIS）快速健康评估 + 选择性湿法提锂（纯度 99.5%+）</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>构建面向退役动力电池的梯次评估—再制造—高值回收一体化平台，覆盖电池包拆解到锂、钴、镍精细化学品回收全链路，材料综合回收率超 95%，吨回收成本较行业均值低 28%。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>2024 年我国退役动力电池规模超 60 万吨，预计 2030 年突破 200 万吨。现有回收体系分散、锂回收率普遍低于 70%，"白色污染"与战略金属流失并存。梯次利用+高值回收是实现退役电池价值最大化的必由路径。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<ul><li>EIS 快速检测模组：4 分钟完成单体电芯健康分级，精度误差 ≤2%</li><li>AI 分选算法：依据 SOH 自动匹配梯次应用场景（储能、低速车、备电）</li><li>湿法提锂工艺：碳酸锂产品纯度 99.5%，钴回收率 ≥92%</li><li>全链路数字台账：从电池码到金属产出，区块链存证，满足碳足迹追溯要求</li></ul>', type: 'list' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>已完成 2000 吨/年中试线建设，锂回收率达 96.3%（优于行业均值 70%）；与 3 家主机厂签署退役电池定向回收协议，锁定年供应量 1.5 万吨；持有发明专利 2 项（EIS 检测方法、锂选择性浸出工艺），实用新型 4 项。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 年底：年处理退役电池 5 万吨，锂回收率 ≥96%，碳酸锂产量 3000 吨；完成锂精矿销售合同 ≥3 份；发明专利授权 ≥2 项；建立可追溯数字台账覆盖 100% 处理批次。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>退役动力电池回收市场 2025 年预计达 600 亿元，CAGR 约 35%。2025 年营收目标 1.2 亿元（梯次利用 40% + 回收材料销售 60%），毛利率目标 38%；2026 年盈亏平衡。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-5-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>刘建军</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>硕士</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>同济大学</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>材料科学与工程</p>', type: 'text' },
            { id: 'aIntendedPosition', label: '拟任职务', valueHtml: '<p>CEO / 联合创始人</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>同济大学材料科学与工程硕士，曾任比亚迪电池研究院高级工程师；深耕锂电池材料 10 年，主导完成 4 条量产线工艺调试，熟悉主机厂采购决策链路。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波绿储能源科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oFundingRound', label: '融资阶段', valueHtml: '<p>A 轮（融资进行中，目标 8000 万元）</p>', type: 'text' },
            { id: 'oTotalRevenue', label: '总营收（万元）', valueHtml: '<p>1350（2024 年）</p>', type: 'number' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>2022 年成立，现有员工 68 人，其中研发人员 22 人；年处理能力 2 万吨，持有危废回收处理资质；与宁德时代、国轩高科达成战略合作，列入市级绿色制造试点企业。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>刘建军</td><td>CEO / 联创</td><td>同济大学 硕士（材料科学）</td><td>前比亚迪电池研究院高级工程师；主导 4 条量产线工艺调试</td></tr><tr><td>吴晓东</td><td>CTO</td><td>北京大学 博士（物理化学）</td><td>电化学阻抗谱领域专家；发表 Nature Energy 子刊论文 2 篇</td></tr><tr><td>王海</td><td>运营总监</td><td>上海交通大学 硕士（工业工程）</td><td>前格林美运营总监；构建长三角退役电池定点回收体系</td></tr><tr><td>付霞</td><td>财务总监</td><td>厦门大学 学士（财务管理）</td><td>注册会计师；前中金公司产业研究员，熟悉 ESG 融资</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2010–2013　同济大学　材料科学与工程　硕士（锂电池正极材料方向）</li><li>2006–2010　武汉理工大学　材料科学与工程　学士</li></ul><p><b>工作经历</b></p><ul><li>2013–2022　比亚迪股份有限公司电池研究院　高级工程师（主导电芯产线工艺优化，累计降本 18%）</li><li>2022–至今　宁波绿储能源科技有限公司　CEO / 联合创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>发明专利（已授权）</b>：一种退役动力电池 EIS 快速健康分级方法（ZL2023xxxxxx.5）</li><li><b>发明专利（已授权）</b>：磷酸铁锂选择性湿法提锂工艺（ZL2023xxxxxx.2）</li><li><b>实用新型专利（已授权）</b>：电池包智能拆解生产线 × 4（ZU2022~2023xxxxxx）</li><li><b>企业标准</b>：Q/LBNS 001-2024《退役动力电池梯次利用评估技术规范》</li><li><b>中试报告</b>：2000 吨/年中试线验证报告（第三方：SGS，锂回收率 96.3%）</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>中试验证报告（SGS 出具，PDF）</li><li>工艺流程图（含 EIS 检测→梯次分选→提锂全链路，PDF）</li><li>发明专利证书 × 2（PDF）</li><li>危废经营许可证（宁波市生态环境局，PDF）</li><li>宁德时代战略合作协议（已脱敏，PDF）</li><li>2024 年审计报告（PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
  // ─── proj-6 ───────────────────────────────────────────────────────────────
  {
    id: 'proj-6',
    competitionId: 'comp-nat',
    title: '量子密钥分发即服务平台',
    blindVolume: {
      id: 'vol-6-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>量子密钥分发即服务（QKDaaS）平台</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>BB84+诱骗态量子密钥分发（QKD）+ 自研量子随机数发生器（QRNG）芯片（14nm，10Gbps）</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>将量子密钥分发能力封装为云服务 API，企业无需购置专用硬件即可接入量子安全通信网络；自研 QRNG 芯片将设备成本降低至行业均值 1/5，通信距离覆盖城域网（≤80km）。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>RSA/ECC 等传统公钥体系面临量子计算破解威胁，量子安全通信已被列入国家"十四五"密码强国战略。现有 QKD 设备动辄数十万元，仅央企/金融机构可承受，"即服务"模式是普及量子安全通信的关键路径。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<ul><li>自研 QRNG 芯片（14nm）：随机数生成速率 10Gbps，体积减小 80%，通过 NIST SP 800-22 全套测试</li><li>QKD 节点设备：支持 BB84+诱骗态协议，密钥率 ≥1Mbps（10km），城域覆盖 80km</li><li>QKDaaS 平台：标准 REST API，企业 10 分钟接入；密钥管理、审计日志全可视</li><li>后量子混合加密中间件：量子密钥 + PQC 算法双轨保障</li></ul>', type: 'list' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>QRNG 芯片已完成流片并通过 NIST 随机性测试；与中国电信宁波分公司完成城域量子网络试点（5 节点，38km），稳定运行 6 个月零中断；CTO 来自中科大量子信息实验室，发表顶刊论文 12 篇。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 年：商用 QKD 节点 20 个，企业接入客户 50 家；QRNG 芯片产能 5000 颗/月；完成等保三级量子密钥扩展认证；发明专利申请 3 项；发表 SCI 论文 2 篇。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>全球量子密码市场 2030 年预计达 118 亿美元（CAGR 38%），国内政策驱动增速更高。2025 年目标营收 1500 万元（订阅+硬件），毛利率 60%+；QRNG 芯片单独销售 ASP 约 2000 元，毛利率 70%。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-6-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>陈志远</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>博士</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>中国科学技术大学</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>量子信息科学</p>', type: 'text' },
            { id: 'aIntendedPosition', label: '拟任职务', valueHtml: '<p>CEO / 创始人</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>中科大量子信息科学博士，师从郭光灿院士团队；发表 Physical Review Letters、Nature Communications 论文各 1 篇；前华为海思量子计算预研负责人，具备从实验室到工程化的完整经验。</p>', type: 'text' },
            { id: 'achievementsSummary', label: '主要成就摘要', valueHtml: '<p>主持国家自然科学基金青年项目 1 项；以第一作者发表 SCI 论文 8 篇，最高 IF 14.5；主导 QRNG 芯片流片成功率 100%；城域网试点零中断运行 183 天。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波量芯科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oFundingRound', label: '融资阶段', valueHtml: '<p>天使轮（已到位 1200 万元）</p>', type: 'text' },
            { id: 'oTotalRevenue', label: '总营收（万元）', valueHtml: '<p>240（2024 年，含政府采购合同）</p>', type: 'number' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>2023 年成立，核心团队 15 人，其中博士 6 人；获宁波市科技创新重大项目立项，列入浙江省数字安全重点培育企业；与中国电信、工商银行宁波分行签署保密通信试点合同。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>陈志远</td><td>CEO / 创始人</td><td>中国科学技术大学 博士（量子信息）</td><td>师从郭光灿院士团队；发表 PRL、Nature Communications 各 1 篇</td></tr><tr><td>魏振华</td><td>CTO</td><td>清华大学 博士（量子光学）</td><td>前华为海思量子计算预研负责人；QRNG 芯片流片主设计师</td></tr><tr><td>林素素</td><td>产品总监</td><td>北京邮电大学 硕士（通信工程）</td><td>前腾讯安全云产品经理；负责 QKDaaS API 标准设计</td></tr><tr><td>赵凯</td><td>首席科学家（兼）</td><td>中科大 博士</td><td>国家量子通信实验室研究员；产学研合作顾问</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2016–2022　中国科学技术大学　量子信息科学　博士</li><li>2012–2016　中国科学技术大学　物理学（量子方向）　学士</li></ul><p><b>工作经历</b></p><ul><li>2022–2023　华为 2012 实验室　量子计算预研工程师（主导 QRNG 芯片预研立项）</li><li>2023–至今　宁波量芯科技有限公司　CEO / 创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>SCI 论文</b>：High-Speed QRNG Based on 14nm CMOS Integration，Physical Review Letters 2023（IF 8.8，第一作者）</li><li><b>SCI 论文</b>：Decoy-State QKD over Metropolitan Fiber Network，Nature Communications 2024（IF 16.6，通讯作者）</li><li><b>SCI 论文</b>：另 6 篇，合计 h-index 9，总引用 310+</li><li><b>发明专利（申请中）</b>：14nm CMOS 集成量子随机数发生器芯片架构 × 3</li><li><b>国家自然科学基金</b>：青年项目"CMOS 集成高速 QRNG 关键技术研究"（立项 2023，经费 30 万元）</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>QRNG 芯片 NIST SP 800-22 测试报告（PDF）</li><li>城域量子网络试点验收报告（中国电信宁波分公司，PDF）</li><li>发明专利申请受理通知书 × 3（PDF）</li><li>SCI 论文代表作 × 2（PDF）</li><li>国家自然科学基金立项通知（PDF）</li><li>天使轮融资协议（已脱敏，PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
  // ─── proj-7 ───────────────────────────────────────────────────────────────
  {
    id: 'proj-7',
    competitionId: 'comp-bcup',
    title: '智慧居家养老健康监护系统',
    blindVolume: {
      id: 'vol-7-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>AI 智慧居家养老健康监护系统</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>60GHz 毫米波雷达无接触生命体征监测 + 多模态跌倒检测（F1=0.96，误报 ＜0.3 次/天）</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>无需穿戴、无摄像头侵扰，通过毫米波雷达+边缘 AI 实时监测老人心率、呼吸、跌倒与异常行为；家属 App 实时推送，120 秒内触达紧急联系人，已在 3 个社区养老中心完成 POC。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>我国 60 岁以上人口已超 2.8 亿，独居老人约 2600 万。老年跌倒是 65 岁以上死亡的首要意外原因，70% 发生在家中且无人在场。传统智能手环依赖穿戴依从性差；摄像头引发隐私顾虑。毫米波雷达提供无接触、高隐私的解决方案。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<ul><li>毫米波雷达传感器（60GHz FMCW）：单设备覆盖 30㎡，可穿墙检测</li><li>边缘 AI 推理：心率精度 ±2bpm，呼吸率精度 ±1 次/分，跌倒识别 F1=0.96</li><li>异常行为检测：长时间静止、夜间如厕异常、离床超时自动告警</li><li>家属 App + 社区大屏：实时数据、历史趋势、紧急呼叫一键联动</li><li>硬件即插即用（220V 供电），2 分钟自动完成房间标定</li></ul>', type: 'list' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>硬件成本 780 元/套（行业最低水平），BOM 已完成量产评审；宁波市鄞州区 3 家养老服务中心 POC（156 名老人），跌倒识别准确率 96.2%，误报 0.25 次/天/设备；列入民政部适老化改造试点名单。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 年：覆盖城市 10 个，社区养老机构签约 500 家，在用设备 1.5 万套；跌倒救援平均响应时间 ＜4 分钟；申请发明专利 2 项；通过二类医疗器械注册备案。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>国内居家养老监护市场规模 2025 年预计达 180 亿元，CAGR 约 28%。商业模式：硬件（980 元/套）+ SaaS 订阅（198 元/月）；2025 年营收目标 3000 万元，2026 年实现盈亏平衡，订阅收入占比 55%+。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-7-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>赵雅芳</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>博士</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>浙江大学</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>生物医学工程</p>', type: 'text' },
            { id: 'aIntendedPosition', label: '拟任职务', valueHtml: '<p>CEO / 联合创始人</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>浙江大学生物医学工程博士，专注毫米波雷达人体感知方向，主持浙江省自然科学基金项目 1 项；前旷视科技计算机视觉研究员，熟悉 AIoT 产品从算法到量产的完整链路。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波康护智联科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oFundingRound', label: '融资阶段', valueHtml: '<p>Pre-A 轮（已到位 1500 万元）</p>', type: 'text' },
            { id: 'oTotalRevenue', label: '总营收（万元）', valueHtml: '<p>320（2024 年，含政府采购）</p>', type: 'number' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>2022 年成立，研发人员 18 人；入列宁波市"科技型中小企业"，获市民政局智慧养老适配认证；与鄞州区、镇海区民政局签署合作协议，列入省级居家养老数字化服务试点。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>赵雅芳</td><td>CEO / 联创</td><td>浙江大学 博士（生物医学工程）</td><td>毫米波雷达人体感知方向；前旷视科技 CV 研究员</td></tr><tr><td>沈鹏</td><td>CTO</td><td>电子科技大学 硕士（微波技术）</td><td>毫米波射频工程师；前海思半导体 60GHz 雷达芯片驱动负责人</td></tr><tr><td>陈美玲</td><td>产品总监</td><td>浙江大学 硕士（社会学）</td><td>养老服务领域 8 年；前民政局智慧养老试点项目管理员</td></tr><tr><td>郑博</td><td>硬件总监</td><td>哈尔滨工业大学 硕士（电子）</td><td>IoT 硬件量产经验；主导 BOM 量产评审，硬件成本降至 780 元</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2016–2021　浙江大学　生物医学工程　博士（毫米波雷达生命体征检测）</li><li>2012–2016　浙江大学　电气工程　学士</li></ul><p><b>工作经历</b></p><ul><li>2021–2022　旷视科技　计算机视觉研究员（从事行人重识别与姿态估计）</li><li>2022–至今　宁波康护智联科技有限公司　CEO / 联合创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>发明专利（申请中）</b>：基于毫米波雷达的无接触跌倒检测方法（申请号 202410xxxxxx）</li><li><b>发明专利（申请中）</b>：多模态生命体征融合异常行为识别系统</li><li><b>实用新型专利（已授权）</b>：60GHz 毫米波养老监护终端（ZU2023xxxxxx）</li><li><b>软件著作权</b>：康护云平台 V1.5（家属 App + 管理后台，2023SR0xxxxxx）</li><li><b>浙江省自然科学基金</b>：青年项目"毫米波雷达老年人行为异常精准感知"（立项 2023，经费 8 万元）</li><li><b>二类医疗器械备案</b>：跌倒检测辅助系统（宁波市药监局备案中）</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>POC 验证报告（3 家社区养老中心，156 名老人，PDF）</li><li>毫米波雷达硬件第三方检测报告（PDF）</li><li>民政局智慧养老适配认证证书（PDF）</li><li>发明专利申请受理通知书 × 2（PDF）</li><li>浙江省自然科学基金立项通知（PDF）</li><li>Pre-A 轮投资协议（已脱敏，PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
  // ─── proj-8 ───────────────────────────────────────────────────────────────
  {
    id: 'proj-8',
    competitionId: 'comp-bcup',
    title: '跨境电商 AI 选品与供应链平台',
    blindVolume: {
      id: 'vol-8-b',
      type: 'blind',
      sections: [
        {
          id: 'cover',
          title: '封面信息',
          fields: [
            { id: 'declarationName', label: '申报用名', valueHtml: '<p>跨境电商 AI 智能选品与供应链优化平台</p>', type: 'text' },
            { id: 'coreTech', label: '核心技术', valueHtml: '<p>多维选品评分模型（30 维指标）+ LLM 合规审查引擎（60 国法规）+ 供应商智能匹配（响应 ＜30 秒）</p>', type: 'text' },
            { id: 'projectBrief', label: '项目简介', valueHtml: '<p>一站式跨境电商 AI 赋能 SaaS：选品命中率 78%（行业均值 45%），LLM 合规审查覆盖 60 国海关法规，现有付费商家 1200+，月均 GMV 增速 35%，已自举盈利。</p>', type: 'text' },
          ],
        },
        {
          id: 'project-info',
          title: '项目内容',
          fields: [
            { id: 'projectBackground', label: '项目背景意义', valueHtml: '<p>我国跨境电商出口 2023 年突破 1.83 万亿元，但中小卖家痛点突出：选品失误导致滞销库存占压资金；合规风险（CE/FCC/亚马逊政策）导致封号；供应商信息不透明造成质量波动。AI 工具可将选品成功率从 45% 提升至 75%+，帮助卖家降低 30% 试错成本。</p>', type: 'text' },
            { id: 'projectContent', label: '项目实施内容', valueHtml: '<ul><li>选品 AI：实时抓取 Amazon/Shopee/TikTok Shop 数据，评估 30 维指标，输出选品报告+竞争热力图</li><li>LLM 合规审查：覆盖 60 国 1400 条法规，产品描述自动检测侵权/违禁风险，准确率 91.3%</li><li>供应商匹配：1688/海外工厂双库，按 MOQ/质检报告/交货期智能排序，报价响应 30 秒</li><li>物流路径优化：基于历史时效与价格推荐最优组合，降本 12%~18%</li></ul>', type: 'list' },
            { id: 'workBasis', label: '工作基础和条件', valueHtml: '<p>平台稳定运营 18 个月，付费商家 1200+；2024 年选品命中率（上线 3 个月内月销超 1 万美元）78%；GMV 月均增速 35%，NPS 分 68；合作供应商库 5.6 万家，日均选品请求 8000+ 次。</p>', type: 'text' },
            { id: 'expectedContribution', label: '预期贡献及验收指标', valueHtml: '<p>2025 年：付费商家 5000+，带动 GMV 累计超 30 亿元；合规覆盖国家 80+；完成东南亚市场本地化版本；申请算法专利 2 项；获评"宁波市数字贸易重点服务平台"。</p>', type: 'text' },
            { id: 'economicEfficiency', label: '预期经济效益指标', valueHtml: '<p>全球跨境电商 SaaS 市场 2025 年预计达 65 亿美元。商业模式：订阅制（698~4980 元/月）+ 成交佣金（0.3%）；2025 年 ARR 目标 2400 万元，毛利率 72%；LTV/CAC=8.5。</p>', type: 'text' },
          ],
        },
      ],
    },
    openVolume: {
      id: 'vol-8-o',
      type: 'open',
      sections: [
        {
          id: 'applicant',
          title: '申报人信息',
          fields: [
            { id: 'aName', label: '姓名', valueHtml: '<p>孙浩然</p>', type: 'text' },
            { id: 'aHighestDegree', label: '最高学历', valueHtml: '<p>本科</p>', type: 'text' },
            { id: 'aHighestDegreeInstitution', label: '最高学历院校', valueHtml: '<p>浙江工商大学</p>', type: 'text' },
            { id: 'aHighestDegreeMajor', label: '最高学历专业', valueHtml: '<p>国际贸易</p>', type: 'text' },
            { id: 'aIntendedPosition', label: '拟任职务', valueHtml: '<p>CEO / 创始人</p>', type: 'text' },
            { id: 'personalBrief', label: '个人简介', valueHtml: '<p>浙江工商大学国际贸易本科，连续创业者；第一次创业（2019~2021）在亚马逊积累年营收 3000 万元的卖家经验，深刻理解选品与供应链痛点；第二次创业转向 SaaS 工具，无融资自举至盈利。</p>', type: 'text' },
            { id: 'achievementsSummary', label: '主要成就摘要', valueHtml: '<p>平台自举增长至 1200 付费客户，连续 6 个月 MRR 增速 ≥20%；选品命中率 78% 居行业前 5%；获宁波商务局"跨境电商创新服务商"认定；2024 年净利润 186 万元。</p>', type: 'text' },
          ],
        },
        {
          id: 'organization',
          title: '用人单位',
          fields: [
            { id: 'oName', label: '单位名称', valueHtml: '<p>宁波畅海跨境科技有限公司</p>', type: 'text' },
            { id: 'oOrgType', label: '单位类型', valueHtml: '<p>企业</p>', type: 'text' },
            { id: 'oFundingRound', label: '融资阶段', valueHtml: '<p>未融资（自举盈利，本次首次融资）</p>', type: 'text' },
            { id: 'oTotalRevenue', label: '总营收（万元）', valueHtml: '<p>860（2024 年）</p>', type: 'number' },
            { id: 'oLastYearProfit', label: '上年度利润（万元）', valueHtml: '<p>186（2024 年净利润）</p>', type: 'number' },
            { id: 'oOrgBrief', label: '单位简介', valueHtml: '<p>2022 年成立，现有团队 22 人，技术 12 人；宁波市跨境电商重点服务平台，列入市级数字贸易专项扶持计划；合作供应商库 5.6 万家，服务覆盖亚马逊、Shopee、TikTok Shop 三大平台。</p>', type: 'text' },
          ],
        },
        {
          id: 'team',
          title: '核心团队',
          fields: [
            { id: 'teamMembers', label: '成员列表', type: 'table', valueHtml: '<table><thead><tr><th>姓名</th><th>职务</th><th>学历院校</th><th>核心背景</th></tr></thead><tbody><tr><td>孙浩然</td><td>CEO / 创始人</td><td>浙江工商大学 学士（国际贸易）</td><td>亚马逊连续创业者；年营收 3000 万元卖家经验；第一视角选品痛点洞察</td></tr><tr><td>许明远</td><td>CTO</td><td>浙江大学 硕士（计算机）</td><td>前阿里妈妈推荐算法工程师；主导选品 AI 模型迭代，命中率从 45% 提至 78%</td></tr><tr><td>林佳怡</td><td>产品总监</td><td>中国人民大学 硕士（电子商务）</td><td>前 Shopee 大卖家运营；跨境合规与 LLM 审查引擎产品负责人</td></tr><tr><td>王冬梅</td><td>增长总监</td><td>厦门大学 学士（市场营销）</td><td>私域社群运营专家；NPS 68 分增长体系搭建者；主导 MRR 连续 6 个月 20%+ 增速</td></tr></tbody></table>' },
          ],
        },
        {
          id: 'experience',
          title: '申请人经历',
          fields: [
            { id: 'applicantExperience', label: '教育与工作经历', type: 'text', valueHtml: '<p><b>教育经历</b></p><ul><li>2015–2019　浙江工商大学　国际贸易学　学士</li></ul><p><b>工作经历</b></p><ul><li>2019–2021　自营亚马逊店铺（个人创业）　年营收峰值 3200 万元，品类：家居/户外；积累一手选品失误数据 3000+ SKU</li><li>2022–至今　宁波畅海跨境科技有限公司　CEO / 创始人</li></ul>' },
          ],
        },
        {
          id: 'achievements',
          title: '主要成果',
          fields: [
            { id: 'patentsAndPapers', label: '专利、论文及著作权', type: 'list', valueHtml: '<ul><li><b>发明专利（申请中）</b>：基于多维指标融合的跨境电商选品评分算法（申请号 202410xxxxxx）</li><li><b>发明专利（申请中）</b>：LLM 驱动的多语言合规审查引擎</li><li><b>软件著作权</b>：畅海 AI 选品 SaaS 平台 V3.0（2024SR0xxxxxx）</li><li><b>软件著作权</b>：LLM 合规审查引擎 V2.0（2023SR0xxxxxx）</li><li><b>行业认定</b>：宁波商务局"跨境电商创新服务商"（2024 年度）</li><li><b>商业成就</b>：2024 年净利润 186 万元（无外部融资，自举盈利）；MRR 连续 6 个月增速 ≥20%</li></ul>' },
          ],
        },
        {
          id: 'files',
          title: '项目文件',
          fields: [
            { id: 'projectFilesList', label: '提交材料', type: 'list', valueHtml: '<ul><li>产品演示录屏（选品流程 + LLM 合规审查，MP4）</li><li>2024 年度审计报告（含净利润 186 万元，PDF）</li><li>平台数据报告（1200 付费客户、GMV、MRR，脱敏处理，PDF）</li><li>发明专利申请受理通知书 × 2（PDF）</li><li>软件著作权登记证书 × 2（PDF）</li><li>宁波商务局创新服务商认定证书（PDF）</li><li>公司营业执照（PDF）</li></ul>' },
          ],
        },
      ],
    },
  },
]

const ASSIGNMENTS: Assignment[] = [
  { expertId: 'exp-a', projectId: 'proj-1', stage: 'blind', status: 'pending' },
  { expertId: 'exp-a', projectId: 'proj-2', stage: 'blind', status: 'done' },
  { expertId: 'exp-a', projectId: 'proj-3', stage: 'open', status: 'pending' },
  { expertId: 'exp-a', projectId: 'proj-5', stage: 'blind', status: 'pending' },
  { expertId: 'exp-a', projectId: 'proj-6', stage: 'open', status: 'pending' },
  { expertId: 'exp-a', projectId: 'proj-7', stage: 'blind', status: 'pending' },
  { expertId: 'exp-a', projectId: 'proj-8', stage: 'blind', status: 'done' },
  { expertId: 'exp-b', projectId: 'proj-1', stage: 'blind', status: 'done' },
  { expertId: 'exp-b', projectId: 'proj-3', stage: 'open', status: 'done' },
  { expertId: 'exp-b', projectId: 'proj-4', stage: 'blind', status: 'pending' },
  { expertId: 'exp-b', projectId: 'proj-5', stage: 'blind', status: 'done' },
  { expertId: 'exp-b', projectId: 'proj-7', stage: 'blind', status: 'pending' },
  { expertId: 'exp-leader', projectId: 'proj-2', stage: 'open', status: 'pending' },
  { expertId: 'exp-leader', projectId: 'proj-4', stage: 'open', status: 'done' },
  { expertId: 'exp-leader', projectId: 'proj-6', stage: 'open', status: 'pending' },
  { expertId: 'exp-leader', projectId: 'proj-8', stage: 'open', status: 'pending' },
]

const RISK_REPORTS: RiskReport[] = [
  {
    id: 'risk-1', projectId: 'proj-1',
    generatedAt: '2024-09-01T08:00:00Z',
    summary: '项目整体风险可控，核心风险集中在监管合规与区块链结算法律灰区。',
    items: [
      { category: '监管合规', finding: '区块链结算涉及虚拟资产监管，国内法律灰区尚未厘清', level: 'high', detail: '建议在合同层面绕开代币结算，改用法币清算通道。' },
      { category: '技术安全', finding: '分布式节点存在单点恶意行为风险，需完善节点信誉机制', level: 'medium' },
      { category: '市场竞争', finding: '阿里云、腾讯云均有闲置算力租赁产品，头部压制风险较高', level: 'medium' },
      { category: '知识产权', finding: '3 项专利已申请但尚未授权，存在被抢注风险', level: 'low' },
    ],
  },
  {
    id: 'risk-2', projectId: 'proj-2',
    generatedAt: '2024-09-05T09:30:00Z',
    summary: '技术路线成熟，主要风险在于政策依赖度高和硬件供应链集中。',
    items: [
      { category: '政策依赖', finding: '碳排放监管政策若放缓，核心需求可能延后', level: 'medium', detail: '建议拓展欧洲等已立法市场，降低单一政策依赖。' },
      { category: '供应链', finding: 'NDIR 气体传感元件主要依赖进口，受贸易政策影响', level: 'medium' },
      { category: '数据安全', finding: '工业排放数据属敏感企业数据，需通过等保二级认证', level: 'low' },
    ],
  },
  {
    id: 'risk-3', projectId: 'proj-3',
    generatedAt: '2024-09-10T10:00:00Z',
    summary: '监管审批是最大风险；技术与临床数据表现优异，团队背景强。',
    items: [
      { category: '监管审批', finding: 'NMPA 三类医疗器械审批周期不确定，历史案例 2~5 年不等', level: 'high', detail: '建议同步推进 SaaS "辅助决策"定位，规避器械审批等待期影响商业化。' },
      { category: '数据合规', finding: '患者影像数据的跨机构共享需符合《个人信息保护法》要求', level: 'medium' },
      { category: '临床推广', finding: '公立医院采购流程长，回款周期 6~18 个月，现金流压力较大', level: 'medium' },
      { category: '技术风险', finding: '模型在罕见病种和特殊影像设备型号上的泛化能力待验证', level: 'low' },
    ],
  },
  {
    id: 'risk-4', projectId: 'proj-4',
    generatedAt: '2024-09-15T11:00:00Z',
    summary: '硬件竞争激烈，需加速软件平台护城河建设；现金流健康。',
    items: [
      { category: '竞争格局', finding: '大疆农业资金充足、渠道广，价格战风险较高', level: 'high', detail: '建议聚焦 AI 数据分析差异化，避免在硬件层面与大疆正面竞争。' },
      { category: '气候风险', finding: '无人机作业受天气影响大，雨季收入波动明显', level: 'medium' },
      { category: '飞手资质', finding: '民用无人机飞手需 CAAC 认证，大规模招募存在瓶颈', level: 'low' },
    ],
  },
  {
    id: 'risk-5', projectId: 'proj-5',
    generatedAt: '2024-09-18T08:00:00Z',
    summary: '行业整合加剧是最大外部压力，技术壁垒与政策配套是核心支撑。',
    items: [
      { category: '市场竞争', finding: '赣锋锂业、格林美等巨头正快速布局退役电池回收，资本与渠道优势显著', level: 'high', detail: '建议聚焦长三角区域主机厂定点合作，以地域护城河应对全国性竞争。' },
      { category: '锂价波动', finding: '碳酸锂价格 2022~2024 年振幅超 85%，若再度下行将压缩回收利润率', level: 'medium', detail: '建议在合同中嵌入价格联动条款，或对冲锂价下行风险。' },
      { category: '政策合规', finding: '危废处理资质涉及环保部门动态年检，资质维持成本较高', level: 'medium' },
      { category: '技术壁垒', finding: '湿法提锂工艺核心助剂配方若泄露将降低竞争壁垒', level: 'low' },
    ],
  },
  {
    id: 'risk-6', projectId: 'proj-6',
    generatedAt: '2024-09-20T09:00:00Z',
    summary: '技术领先优势明显，最大风险来自市场教育成本高和政策标准滞后。',
    items: [
      { category: '市场教育', finding: '量子通信认知度低，企业客户采购决策周期长达 6~18 个月', level: 'high', detail: '建议优先切入金融和政务两个合规驱动强的行业，以标杆案例加速市场教育。' },
      { category: '标准缺失', finding: '国内 QKD 互联互通标准尚未完善，不同厂商设备兼容性存在风险', level: 'medium' },
      { category: '硬件供应链', finding: 'QRNG 芯片依赖国内少数封装厂，良率波动可能影响交付节奏', level: 'medium' },
      { category: '人才竞争', finding: '量子信息方向顶尖人才稀缺，大厂和科研机构抢人激烈', level: 'low' },
    ],
  },
  {
    id: 'risk-7', projectId: 'proj-7',
    generatedAt: '2024-09-22T10:00:00Z',
    summary: '市场需求确定性强，主要风险在于医疗器械注册节奏和渠道拓展效率。',
    items: [
      { category: '监管审批', finding: '跌倒检测功能可能被认定为二类医疗器械，注册周期 1~2 年', level: 'high', detail: '建议双轨策略：以"安全监护"（非医疗）定位先上市销售，并行推进医疗器械注册。' },
      { category: '渠道依赖', finding: '养老机构采购受政府预算和招投标周期约束，销售周期偏长', level: 'medium' },
      { category: '数据隐私', finding: '居家老人行为数据属于敏感个人信息，数据合规要求高', level: 'medium' },
      { category: '硬件竞争', finding: '海康威视、小米等有类似居家安防产品，价格战风险存在', level: 'low' },
    ],
  },
  {
    id: 'risk-8', projectId: 'proj-8',
    generatedAt: '2024-09-25T11:00:00Z',
    summary: '产品已验证 PMF，核心风险在于平台政策依赖和爬虫数据合规压力。',
    items: [
      { category: '平台政策依赖', finding: 'Amazon/TikTok Shop 平台规则频繁变动，选品模型需持续迭代', level: 'high', detail: '建议构建多平台数据源并建立政策追踪自动更新机制，避免单一平台依赖。' },
      { category: '数据合规', finding: '爬取平台公开数据存在服务协议争议，部分数据源可能被限制', level: 'medium' },
      { category: '竞争格局', finding: '生意参谋、Jungle Scout 等老牌工具有品牌先发优势', level: 'medium' },
      { category: '客户流失', finding: '跨境卖家经营波动大，平台自然流失率约 20%~25%/年', level: 'low' },
    ],
  },
]

const AI_OBJECTIVE_SCORES: AIObjectiveScore[] = [
  // proj-1 (comp-bcup)
  { projectId: 'proj-1', dimensionId: 'dim-bcup-1', score: 87, rationale: '基于区块链+DRL 的分布式算力调度属于前沿交叉创新，技术路线原创性高，但商业模式相对已有先例。' },
  { projectId: 'proj-1', dimensionId: 'dim-bcup-2', score: 82, rationale: 'MVP 已上线且有真实算力节点接入，核心算法经过压力测试；生产规模化部署经验尚不充分。' },
  { projectId: 'proj-1', dimensionId: 'dim-bcup-3', score: 78, rationale: '市场规模估算与 IDC 报告吻合，但未量化中小企业付费意愿与转化漏斗，市场可信度中等偏上。' },
  { projectId: 'proj-1', dimensionId: 'dim-bcup-4', score: 75, rationale: '核心岗位背景扎实，但商务/销售团队缺位，产品到商业化路径的执行团队尚不完整。' },
  // proj-2 (comp-carbon)
  { projectId: 'proj-2', dimensionId: 'dim-carb-1', score: 80, rationale: 'IoT+AI 组合路径具有一定创新性，NDIR 双冗余传感器方案有技术亮点；整体创新层级属于应用创新而非突破性创新。' },
  { projectId: 'proj-2', dimensionId: 'dim-carb-2', score: 85, rationale: '传感器方案成熟，边缘-云端-AI 三级架构设计合理，极端天气工况已有专项验证，技术可行性较强。' },
  { projectId: 'proj-2', dimensionId: 'dim-carb-3', score: 76, rationale: '碳中和政策明确驱动需求，但客户集中度较高（3家园区），商业化广度有待验证。' },
  // proj-3 (comp-nat)
  { projectId: 'proj-3', dimensionId: 'dim-nat-1', score: 92, rationale: '双模态联合诊断 + 持续在线学习机制属于业界领先创新，顶刊发表及 ImageNet 竞赛背书技术深度。' },
  { projectId: 'proj-3', dimensionId: 'dim-nat-2', score: 83, rationale: '三条商业化路径清晰，医院 SaaS 已产生收入；但 B 端医院采购周期长，回款风险需关注。' },
  { projectId: 'proj-3', dimensionId: 'dim-nat-3', score: 89, rationale: '双模态共享骨干网络 + 在线学习是核心壁垒，CE 认证已取得，技术复制难度较高。' },
  { projectId: 'proj-3', dimensionId: 'dim-nat-4', score: 90, rationale: '直接降低基层漏诊率、服务资源匮乏地区，社会价值显著，符合国家分级诊疗战略。' },
  // proj-4 (comp-bcup)
  { projectId: 'proj-4', dimensionId: 'dim-bcup-1', score: 70, rationale: '多光谱 AI 病害识别应用场景明确，但技术组合已有头部企业布局，原创性一般。' },
  { projectId: 'proj-4', dimensionId: 'dim-bcup-2', score: 75, rationale: '核心技术已量产，准确率 92% 具有竞争力；规模化服务网络建设能力验证良好。' },
  { projectId: 'proj-4', dimensionId: 'dim-bcup-3', score: 82, rationale: '农业数字化市场空间广阔，政策扶持力度大；LTV/CAC=12 表明商业模型健康。' },
  { projectId: 'proj-4', dimensionId: 'dim-bcup-4', score: 80, rationale: '团队成员兼具政府资源与技术背景，地面服务网络已建立；缺乏顶级融资背书。' },
  // proj-5 (comp-carbon)
  { projectId: 'proj-5', dimensionId: 'dim-carb-1', score: 82, rationale: 'EIS 健康评估+选择性湿法提锂组合具有较强技术原创性；梯次利用+高值回收一体化商业设计属于模式创新。' },
  { projectId: 'proj-5', dimensionId: 'dim-carb-2', score: 88, rationale: '中试线已建成并验证，锂回收率 96.3% 显著优于行业均值；工艺稳定性和产能爬坡方案详实可信。' },
  { projectId: 'proj-5', dimensionId: 'dim-carb-3', score: 79, rationale: '退役电池增量确定，政策推动力强；但受碳酸锂价格波动影响，营收预测存在较大区间风险。' },
  // proj-6 (comp-nat)
  { projectId: 'proj-6', dimensionId: 'dim-nat-1', score: 94, rationale: 'QRNG 芯片化+QKDaaS 模式是业界领先创新，顶刊发表和城域网试点双重背书技术深度，创新层级极高。' },
  { projectId: 'proj-6', dimensionId: 'dim-nat-2', score: 70, rationale: '订阅模型清晰，但量子安全市场处于早期教育阶段，商业化路径依赖政策/行业标准驱动，不确定性较高。' },
  { projectId: 'proj-6', dimensionId: 'dim-nat-3', score: 91, rationale: 'QRNG 芯片自研形成显著成本壁垒，核心团队来自顶尖量子信息实验室，技术复制难度极高。' },
  { projectId: 'proj-6', dimensionId: 'dim-nat-4', score: 88, rationale: '保障数字基础设施安全具有重要战略价值，与国家密码强国战略高度契合，社会价值显著。' },
  // proj-7 (comp-bcup)
  { projectId: 'proj-7', dimensionId: 'dim-bcup-1', score: 79, rationale: '毫米波雷达居家跌倒检测已有多家布局，"无接触+隐私保护"差异化组合清晰但非首创；模式创新大于技术创新。' },
  { projectId: 'proj-7', dimensionId: 'dim-bcup-2', score: 84, rationale: '硬件已完成量产评审，POC 数据扎实（F1=0.96，误报率低），设备成本 780 元具有强竞争力。' },
  { projectId: 'proj-7', dimensionId: 'dim-bcup-3', score: 86, rationale: '银发经济政策驱动明确，独居老人基数庞大；硬件+SaaS 双收入模式提供稳定现金流，市场前景乐观。' },
  { projectId: 'proj-7', dimensionId: 'dim-bcup-4', score: 81, rationale: '团队兼具传感器算法与产品化经验，民政局渠道关系是重要资产；商务和销售团队仍需加强。' },
  // proj-8 (comp-bcup)
  { projectId: 'proj-8', dimensionId: 'dim-bcup-1', score: 72, rationale: '多维选品评分+LLM 合规组合有一定创新，但跨境电商 SaaS 赛道竞争者众，整体原创性一般。' },
  { projectId: 'proj-8', dimensionId: 'dim-bcup-2', score: 89, rationale: '已达到 PMF：命中率 78%、付费客户 1200+、自举盈利，技术商业化成熟度在同赛道中最为突出。' },
  { projectId: 'proj-8', dimensionId: 'dim-bcup-3', score: 85, rationale: '跨境电商工具市场规模大且增速稳定，LTV/CAC=8.5 验证商业健康度，增长潜力充足。' },
  { projectId: 'proj-8', dimensionId: 'dim-bcup-4', score: 90, rationale: '创始人有亲身卖家经验，深度理解用户痛点；无融资自举至盈利已充分证明团队执行力。' },
]

// All fieldIds reference real ProjectField keys from packages/shared/src/projectForm/scalarFields.ts,
// matching the Field.id values used in PROJECTS above.
const AI_CHALLENGES: AIChallenge[] = [
  // proj-1 — fieldIds: coreTech, workBasis, economicEfficiency
  { id: 'aic-1-1', projectId: 'proj-1', fieldId: 'coreTech',
    text: '您提到"区块链共识+DRL 调度"，请提供与中心化调度方案的对比测试数据（延迟、吞吐量、成本）。', kind: 'question' },
  { id: 'aic-1-2', projectId: 'proj-1', fieldId: 'workBasis',
    text: '3 项专利均处于申请阶段，实际保护范围尚不确定；竞争对手是否可通过绕开专利实现类似功能？', kind: 'challenge' },
  { id: 'aic-1-3', projectId: 'proj-1', fieldId: 'economicEfficiency',
    text: 'IDC 报告引用的"800 亿元市场规模"是云计算整体数字，与本项目的实际可触达市场（SAM）差距较大，请提供更精确的 SAM 测算。', kind: 'challenge' },
  // proj-2 — fieldIds: projectContent, projectBrief
  { id: 'aic-2-1', projectId: 'proj-2', fieldId: 'projectContent',
    text: 'LSTM 模型在极端天气下精度降至 0.87，是否设有降级策略？当 AI 置信度低时系统如何处理报警？', kind: 'question' },
  { id: 'aic-2-2', projectId: 'proj-2', fieldId: 'projectBrief',
    text: '已有多家企业提供类似 IoT 碳监测产品，"差异化优势"描述中缺少具体竞品对比数据，建议补充竞争矩阵。', kind: 'challenge' },
  // proj-3 — fieldIds: workBasis, expectedContribution
  { id: 'aic-3-1', projectId: 'proj-3', fieldId: 'workBasis',
    text: '肺结节样本量 12,000 中正负样本比例如何？若正样本（阳性）比例过低，敏感性指标的统计可靠性需进一步说明。', kind: 'challenge' },
  { id: 'aic-3-2', projectId: 'proj-3', fieldId: 'expectedContribution',
    text: 'NMPA 第三类器械审批历史周期为 2~5 年，在获批前商业化收入是否存在合规风险？请说明过渡期的法律定性。', kind: 'question' },
  // proj-4 — fieldIds: projectContent, workBasis
  { id: 'aic-4-1', projectId: 'proj-4', fieldId: 'projectContent',
    text: '大疆农业 T50 同样搭载多光谱相机，准确率声称与本项目接近。请提供与大疆同类产品的独立第三方对比测试报告。', kind: 'challenge' },
  { id: 'aic-4-2', projectId: 'proj-4', fieldId: 'workBasis',
    text: '三个县级试点的样本数量是否足以验证"下沉市场推广策略"的可复制性？不同地域农业环境差异对推广成本的影响如何量化？', kind: 'question' },
  // proj-5 — fieldIds: workBasis, economicEfficiency
  { id: 'aic-5-1', projectId: 'proj-5', fieldId: 'workBasis',
    text: '中试线年处理量 2 万吨，但 2025 年目标 5 万吨意味着扩产 2.5 倍。资金来源和工期计划是否已落地？请提供扩产时间表与资本开支测算。', kind: 'question' },
  { id: 'aic-5-2', projectId: 'proj-5', fieldId: 'economicEfficiency',
    text: '碳酸锂 2022~2024 年价格振幅超 85%，营收预测未包含价格下行情景。建议补充碳酸锂价格较当前下降 50% 时的盈亏平衡分析。', kind: 'challenge' },
  // proj-6 — fieldIds: projectContent, economicEfficiency
  { id: 'aic-6-1', projectId: 'proj-6', fieldId: 'projectContent',
    text: 'QKD 密钥率 1Mbps@10km 对金融高频交易场景是否足够？高频交易对密钥更新频率有何具体需求，是否已与金融机构验证过？', kind: 'question' },
  { id: 'aic-6-2', projectId: 'proj-6', fieldId: 'economicEfficiency',
    text: '天使轮到位 1200 万，而商用节点部署成本较高；请说明在下一轮融资前现金流能否覆盖 18 个月以上运营，并提供 18 个月烧钱模型。', kind: 'challenge' },
  // proj-7 — fieldIds: coreTech, expectedContribution
  { id: 'aic-7-1', projectId: 'proj-7', fieldId: 'coreTech',
    text: '毫米波雷达可穿墙检测，多房间场景下不同房间老人生命体征是否可能混淆？请提供多目标、多房间同时识别的准确率验证数据。', kind: 'question' },
  { id: 'aic-7-2', projectId: 'proj-7', fieldId: 'expectedContribution',
    text: '预计 2025 年签约 500 家养老机构，但政府采购受预算周期约束，单年新增签约量是否现实？请提供渠道落地路径和已确认意向机构数量。', kind: 'challenge' },
  // proj-8 — fieldIds: coreTech, workBasis
  { id: 'aic-8-1', projectId: 'proj-8', fieldId: 'coreTech',
    text: 'LLM 合规审查"覆盖 60 国法规"的实时更新机制是什么？法规变更通常无结构化接口，LLM 如何保证时效性与准确性？', kind: 'question' },
  { id: 'aic-8-2', projectId: 'proj-8', fieldId: 'workBasis',
    text: '选品命中率 78% 定义为"上线 3 个月内月销超 1 万美元"，但未说明样本量与品类分布。若集中在少数强势品类，该指标的代表性需进一步说明。', kind: 'challenge' },
]

// Seed annotations — mix of authors across the same group.
// fieldIds are real ProjectField keys so they resolve to displayed form fields.
const SEED_ANNOTATIONS: Annotation[] = [
  {
    id: 'ann-1', projectId: 'proj-1', fieldId: 'coreTech',
    startOffset: 0, endOffset: 19, quotedText: '区块链共识机制 + 深度强化学习',
    comment: '两项技术结合的工程复杂度非常高，建议追问团队是否有具体实现细节而非仅停留于概念层面。',
    authorId: 'exp-a', createdAt: '2024-09-20T14:23:00Z',
  },
  {
    id: 'ann-2', projectId: 'proj-1', fieldId: 'workBasis',
    startOffset: 11, endOffset: 26, quotedText: '12 个月以上的数据积累',
    comment: '这个论断缺乏依据。竞争对手若有更大规模的数据集，可能反而更快追上。建议提供数据壁垒的量化说明。',
    authorId: 'exp-b', createdAt: '2024-09-20T16:05:00Z',
  },
  {
    id: 'ann-3', projectId: 'proj-2', fieldId: 'projectContent',
    startOffset: 0, endOffset: 14, quotedText: 'NDIR+电化学双冗余传感模组',
    comment: '双传感器冗余是亮点，建议在评分时重点认可这一工程安全性设计，业内较少见。',
    authorId: 'exp-a', createdAt: '2024-09-22T10:15:00Z',
  },
  {
    id: 'ann-4', projectId: 'proj-3', fieldId: 'workBasis',
    startOffset: 21, endOffset: 33, quotedText: '样本 N=12,000',
    comment: '【组长批注】样本量充足，但注意询问阳性/阴性比例；不平衡数据集可能导致敏感性虚高。',
    authorId: 'exp-leader', createdAt: '2024-09-23T09:00:00Z',
  },
  {
    id: 'ann-5', projectId: 'proj-3', fieldId: 'expectedContribution',
    startOffset: 0, endOffset: 20, quotedText: '肺结节漏诊率降低至 5% 以下',
    comment: '行业均值 30% 的来源是哪份报告？需要在评审现场核实引用的数据出处，确保对比基准一致。',
    authorId: 'exp-b', createdAt: '2024-09-23T11:30:00Z',
  },
]

// Pre-seeded submitted score submissions
function buildSeedSubmissions(): Map<string, ScoreSubmission> {
  const map = new Map<string, ScoreSubmission>()

  const add = (s: ScoreSubmission) => {
    map.set(`${s.projectId}:${s.expertId}:${s.stage}`, s)
  }

  // exp-a scored proj-2 (blind) — submitted
  add({
    id: 'sub-a-p2-b', projectId: 'proj-2', expertId: 'exp-a', stage: 'blind',
    dimensionScores: [
      { dimensionId: 'dim-carb-1', score: 78, comment: '创新路径清晰但属于应用层创新' },
      { dimensionId: 'dim-carb-2', score: 82, comment: '技术实现细节扎实，极端天气调优加分' },
      { dimensionId: 'dim-carb-3', score: 75, comment: '市场逻辑成立，但客户集中度偏高' },
    ],
    overallComment: '团队技术背景扎实，产品思路清晰，政策驱动明确。需关注客户多元化节奏。',
    totalWeighted: 0.40 * 78 + 0.30 * 82 + 0.30 * 75,  // 78.3
    status: 'submitted', submittedAt: '2024-09-21T15:00:00Z',
  })

  // exp-b scored proj-1 (blind) — submitted
  add({
    id: 'sub-b-p1-b', projectId: 'proj-1', expertId: 'exp-b', stage: 'blind',
    dimensionScores: [
      { dimensionId: 'dim-bcup-1', score: 85, comment: '双技术融合原创性强' },
      { dimensionId: 'dim-bcup-2', score: 80, comment: 'MVP 数据有说服力，但专利未授权是减分项' },
      { dimensionId: 'dim-bcup-3', score: 75, comment: 'TAM 宏大但 SAM 需细化' },
      { dimensionId: 'dim-bcup-4', score: 82, comment: '技术团队优秀，商务侧需补充' },
    ],
    overallComment: '技术创新亮眼，建议重点追问 SAM 测算依据与专利实际保护范围。',
    totalWeighted: 0.35 * 85 + 0.25 * 80 + 0.20 * 75 + 0.20 * 82,  // 81.15
    status: 'submitted', submittedAt: '2024-09-21T16:30:00Z',
  })

  // exp-b scored proj-3 (open) — submitted
  add({
    id: 'sub-b-p3-o', projectId: 'proj-3', expertId: 'exp-b', stage: 'open',
    dimensionScores: [
      { dimensionId: 'dim-nat-1', score: 90, comment: '双模态创新属于业界领先' },
      { dimensionId: 'dim-nat-2', score: 85, comment: '三条商业化路径合理，SaaS 营收已验证' },
      { dimensionId: 'dim-nat-3', score: 88, comment: 'CE 认证 + 在线学习机制形成显著壁垒' },
      { dimensionId: 'dim-nat-4', score: 82, comment: '基层医疗赋能社会价值明显' },
    ],
    overallComment: '综合评分最高项目之一，监管审批节奏是核心不确定性，其余指标优异。',
    totalWeighted: 0.30 * 90 + 0.25 * 85 + 0.25 * 88 + 0.20 * 82,  // 86.65
    status: 'submitted', submittedAt: '2024-09-24T10:00:00Z',
  })

  // exp-leader scored proj-4 (open) — submitted
  add({
    id: 'sub-leader-p4-o', projectId: 'proj-4', expertId: 'exp-leader', stage: 'open',
    dimensionScores: [
      { dimensionId: 'dim-bcup-1', score: 72, comment: '创新性一般，市场应用价值更突出' },
      { dimensionId: 'dim-bcup-2', score: 78, comment: '技术已量产，准确率有竞争力' },
      { dimensionId: 'dim-bcup-3', score: 80, comment: 'LTV/CAC 健康，市场前景乐观' },
      { dimensionId: 'dim-bcup-4', score: 85, comment: '团队结合政府与技术背景，执行力强' },
    ],
    overallComment: '务实型项目，商业化进展扎实。建议聚焦 AI 分析差异化以应对大疆竞争。',
    totalWeighted: 0.35 * 72 + 0.25 * 78 + 0.20 * 80 + 0.20 * 85,  // 77.7
    status: 'submitted', submittedAt: '2024-09-25T11:00:00Z',
  })

  // exp-a scored proj-8 (blind) — submitted
  add({
    id: 'sub-a-p8-b', projectId: 'proj-8', expertId: 'exp-a', stage: 'blind',
    dimensionScores: [
      { dimensionId: 'dim-bcup-1', score: 70, comment: '应用创新为主，原创性中等' },
      { dimensionId: 'dim-bcup-2', score: 88, comment: '自举盈利+PMF 验证，技术成熟度突出' },
      { dimensionId: 'dim-bcup-3', score: 82, comment: '跨境电商市场空间大，增长逻辑清晰' },
      { dimensionId: 'dim-bcup-4', score: 91, comment: '卖家背景加分，无融资自举成长充分证明执行力' },
    ],
    overallComment: '极具说服力的产品市场契合度，建议重点追问 LLM 合规引擎更新机制与平台政策依赖风险。',
    totalWeighted: 0.35 * 70 + 0.25 * 88 + 0.20 * 82 + 0.20 * 91,  // 79.7
    status: 'submitted', submittedAt: '2024-09-26T14:00:00Z',
  })

  // exp-b scored proj-5 (blind) — submitted
  add({
    id: 'sub-b-p5-b', projectId: 'proj-5', expertId: 'exp-b', stage: 'blind',
    dimensionScores: [
      { dimensionId: 'dim-carb-1', score: 80, comment: '技术路线清晰，工艺创新属于应用层' },
      { dimensionId: 'dim-carb-2', score: 87, comment: '中试验证充分，锂回收率业界领先' },
      { dimensionId: 'dim-carb-3', score: 76, comment: '增量确定但锂价波动是隐患' },
    ],
    overallComment: '工艺壁垒扎实，主机厂协议是关键竞争护城河。需关注碳酸锂价格对收益的影响。',
    totalWeighted: 0.40 * 80 + 0.30 * 87 + 0.30 * 76,  // 81.3
    status: 'submitted', submittedAt: '2024-09-27T09:00:00Z',
  })

  return map
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function computeWeightedTotal(
  dimensionScores: ScoreSubmission['dimensionScores'],
  rubric: RubricDimension[],
): number {
  return rubric.reduce((sum, dim) => {
    const ds = dimensionScores.find((d) => d.dimensionId === dim.id)
    return sum + (ds ? ds.score * dim.weight : 0)
  }, 0)
}

function generateId(): ID {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

export class MockReviewService implements ReviewService {
  // The currently "logged in" expert; default to reviewer A for development.
  private currentExpertId: ID = 'exp-a'

  // Mutable in-memory state (keyed by `${projectId}:${expertId}:${stage}`)
  private submissions: Map<ID, ScoreSubmission> = buildSeedSubmissions()
  private annotations: Map<ID, Annotation> = new Map(
    SEED_ANNOTATIONS.map((a) => [a.id, a]),
  )
  private reScoringRequests: ReScoringRequest[] = []

  // ---- Auth ----

  async login(wechatCode: string): Promise<Expert> {
    // In mock mode, map specific codes to experts; any unknown code → reviewer A.
    const codeMap: Record<string, ID> = {
      leader: 'exp-leader',
      'reviewer-a': 'exp-a',
      'reviewer-b': 'exp-b',
    }
    this.currentExpertId = codeMap[wechatCode] ?? 'exp-a'
    return delay(this.findExpert(this.currentExpertId))
  }

  async getCurrentExpert(): Promise<Expert> {
    return delay(this.findExpert(this.currentExpertId))
  }

  // ---- Assignments ----

  async getAssignments(expertId: ID): Promise<Assignment[]> {
    return delay(ASSIGNMENTS.filter((a) => a.expertId === expertId))
  }

  // ---- Project (stage-gated volume access) ----

  async getProject(projectId: ID, stage: ReviewStageType): Promise<ProjectPayload> {
    const project = PROJECTS.find((p) => p.id === projectId)
    if (!project) throw new Error(`Project not found: ${projectId}`)

    // blind stage: never expose openVolume content.
    if (stage === 'blind') {
      return delay({ id: project.id, competitionId: project.competitionId, title: project.title, blindVolume: project.blindVolume })
    }

    return delay({
      id: project.id,
      competitionId: project.competitionId,
      title: project.title,
      blindVolume: project.blindVolume,
      openVolume: project.openVolume,
    })
  }

  // ---- Rubric ----

  async getRubric(competitionId: ID): Promise<RubricDimension[]> {
    const competition = COMPETITIONS.find((c) => c.id === competitionId)
    if (!competition) throw new Error(`Competition not found: ${competitionId}`)
    return delay(competition.rubric)
  }

  // ---- Risk report ----

  async getRiskReport(projectId: ID): Promise<RiskReport> {
    const report = RISK_REPORTS.find((r) => r.projectId === projectId)
    if (!report) throw new Error(`RiskReport not found for project: ${projectId}`)
    return delay(report)
  }

  // ---- AI scores & challenges ----

  async getAIObjectiveScores(projectId: ID): Promise<AIObjectiveScore[]> {
    return delay(AI_OBJECTIVE_SCORES.filter((s) => s.projectId === projectId))
  }

  async getAIChallenges(projectId: ID): Promise<AIChallenge[]> {
    return delay(AI_CHALLENGES.filter((c) => c.projectId === projectId))
  }

  // ---- Annotations ----

  async getAnnotations(projectId: ID, viewer: AnnotationViewer): Promise<Annotation[]> {
    const all = Array.from(this.annotations.values()).filter(
      (a) => a.projectId === projectId,
    )

    // Visibility rules:
    // - 'admin' : sees every annotation on the project, no further filtering.
    // - 'leader': sees annotations authored by anyone in their group (including themselves).
    //             Group membership is resolved by looking up GROUPS; the leader's groupId
    //             determines which memberIds are included.
    // - 'self'  : sees only annotations they personally authored.
    if (viewer.role === 'admin') {
      return delay(all)
    }

    if (viewer.role === 'leader') {
      const group = GROUPS.find((g) => g.id === viewer.groupId)
      if (!group) return delay([])
      const groupMemberIds = new Set([group.leaderId, ...group.memberIds])
      return delay(all.filter((a) => groupMemberIds.has(a.authorId)))
    }

    // role === 'self'
    return delay(all.filter((a) => a.authorId === viewer.expertId))
  }

  async createAnnotation(input: CreateAnnotationInput): Promise<Annotation> {
    const annotation: Annotation = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    this.annotations.set(annotation.id, annotation)
    return delay(annotation)
  }

  async updateAnnotation(annotationId: ID, input: UpdateAnnotationInput): Promise<Annotation> {
    const existing = this.annotations.get(annotationId)
    if (!existing) throw new Error(`Annotation not found: ${annotationId}`)
    const updated: Annotation = { ...existing, comment: input.comment }
    this.annotations.set(annotationId, updated)
    return delay(updated)
  }

  async deleteAnnotation(annotationId: ID): Promise<void> {
    if (!this.annotations.has(annotationId)) throw new Error(`Annotation not found: ${annotationId}`)
    this.annotations.delete(annotationId)
    return delay(undefined)
  }

  // ---- Scoring ----

  async getScore(projectId: ID, expertId: ID): Promise<ScoreSubmission | null> {
    // A reviewer may have separate blind and open submissions; return the most recent one.
    // Callers that need stage-specific access should use the stage param in ScoreInput.
    const allForPair = Array.from(this.submissions.values()).filter(
      (s) => s.projectId === projectId && s.expertId === expertId,
    )
    if (allForPair.length === 0) return delay(null)
    // Prefer submitted over draft; if both, return submitted.
    return delay(allForPair.find((s) => s.status === 'submitted') ?? allForPair[0] ?? null)
  }

  async saveScoreDraft(input: ScoreInput): Promise<ScoreSubmission> {
    const key = `${input.projectId}:${input.expertId}:${input.stage}`
    const rubric = this.getRubricSync(input.projectId)
    const totalWeighted = computeWeightedTotal(input.dimensionScores, rubric)

    const existing = this.submissions.get(key)
    const submission: ScoreSubmission = {
      id: existing?.id ?? generateId(),
      projectId: input.projectId,
      expertId: input.expertId,
      stage: input.stage,
      dimensionScores: input.dimensionScores,
      overallComment: input.overallComment,
      totalWeighted,
      status: 'draft',
    }
    this.submissions.set(key, submission)
    return delay(submission)
  }

  async submitScore(input: ScoreInput): Promise<ScoreSubmission> {
    const key = `${input.projectId}:${input.expertId}:${input.stage}`
    const existing = this.submissions.get(key)
    if (existing?.status === 'submitted') {
      throw new Error('Score already submitted. Contact a leader to request re-scoring.')
    }

    const rubric = this.getRubricSync(input.projectId)
    const totalWeighted = computeWeightedTotal(input.dimensionScores, rubric)

    const submission: ScoreSubmission = {
      id: existing?.id ?? generateId(),
      projectId: input.projectId,
      expertId: input.expertId,
      stage: input.stage,
      dimensionScores: input.dimensionScores,
      overallComment: input.overallComment,
      totalWeighted,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    }
    this.submissions.set(key, submission)
    return delay(submission)
  }

  // ---- Group scores (leader-only) ----

  async getGroupScores(groupId: ID, projectId: ID): Promise<ScoreSubmission[]> {
    const group = GROUPS.find((g) => g.id === groupId)
    if (!group) throw new Error(`Group not found: ${groupId}`)

    const memberIds = new Set([group.leaderId, ...group.memberIds])
    return delay(
      Array.from(this.submissions.values()).filter(
        (s) => s.projectId === projectId && memberIds.has(s.expertId),
      ),
    )
  }

  // ---- Re-scoring requests ----

  async createReScoringRequest(input: CreateReScoringRequestInput): Promise<ReScoringRequest> {
    const request: ReScoringRequest = {
      id: generateId(),
      ...input,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    this.reScoringRequests.push(request)

    // Unlock the target expert's submission so they can re-score.
    for (const [key, sub] of this.submissions.entries()) {
      if (sub.projectId === input.projectId && sub.expertId === input.targetExpertId) {
        this.submissions.set(key, { ...sub, status: 'draft', submittedAt: undefined })
      }
    }

    return delay(request)
  }

  // ---- Private helpers ----

  private findExpert(id: ID): Expert {
    const expert = EXPERTS.find((e) => e.id === id)
    if (!expert) throw new Error(`Expert not found: ${id}`)
    return expert
  }

  private getRubricSync(projectId: ID): RubricDimension[] {
    const project = PROJECTS.find((p) => p.id === projectId)
    if (!project) throw new Error(`Project not found: ${projectId}`)
    const competition = COMPETITIONS.find((c) => c.id === project.competitionId)
    if (!competition) throw new Error(`Competition not found: ${project.competitionId}`)
    return competition.rubric
  }
}
