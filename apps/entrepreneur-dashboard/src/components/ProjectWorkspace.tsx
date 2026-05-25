import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Filter, 
  Download, 
  X, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trophy,
  Sparkles,
  ArrowRight,
  Calendar,
  Building2,
  ExternalLink,
  Layers,
  ClipboardList,
  FileCheck,
  FileSpreadsheet,
  Image,
  Lock,
  PenSquare
} from 'lucide-react';
import { Project } from '../types';
import { cn } from '../lib/utils';

// Helper to resolve associated competitions for custom expandable project rows
const getCompetitionsForProject = (projectName: string) => {
  if (projectName.includes('交通') || projectName.includes('智能')) {
    return [
      { 
        name: '2024 全国高校人工智能创新大赛', 
        type: '自主申报重点项', 
        status: 'reviewing', 
        statusText: '初审通过', 
        date: '2024-06-20', 
        role: '核心技术组长', 
        bpName: '智能多模态城市交通排班自适应设计书.pdf',
        steps: [
          { label: '项目申报', active: true, done: true },
          { label: '立项批复', active: true, done: true },
          { label: '网络评审', active: true, done: true },
          { label: '决赛答辩', active: true, done: false },
          { label: '结果公示', active: false, done: false }
        ]
      },
      { 
        name: '"创青春" 全国大学生创业专项挑战赛', 
        type: '推荐选送项', 
        status: 'pending', 
        statusText: '资料待补全', 
        date: '2024-07-15', 
        role: '主讲申报人', 
        bpName: '城市低空交通与物流智能规划系统BP.docx',
        steps: [
          { label: '项目申报', active: true, done: true },
          { label: '立项批复', active: true, done: false },
          { label: '网络评审', active: false, done: false },
          { label: '决赛答辩', active: false, done: false },
          { label: '结果公示', active: false, done: false }
        ]
      }
    ];
  } else if (projectName.includes('工厂') || projectName.includes('孪生') || projectName.includes('虚拟')) {
    return [
      { 
        name: '工业 4.0 数字化转型创新实践赛', 
        type: '领航工程赛', 
        status: 'pending', 
        statusText: '待补充材料', 
        date: '2024-05-30', 
        role: '第一发明人', 
        bpName: '3D高斯泼溅高保真重现智能车间方案.pptx',
        steps: [
          { label: '项目申报', active: true, done: true },
          { label: '立项批复', active: false, done: false },
          { label: '网络评审', active: false, done: false },
          { label: '决赛答辩', active: false, done: false },
          { label: '结果公示', active: false, done: false }
        ]
      },
      { 
        name: '"挑战杯" 全国大学生课外学术科技作品竞赛', 
        type: '学术科研主线', 
        status: 'reviewing', 
        statusText: '复审评审中', 
        date: '2024-08-05', 
        role: '系统演示负责人', 
        bpName: '基于重光照算子的虚拟现实数字孪生模型.pdf',
        steps: [
          { label: '项目申报', active: true, done: true },
          { label: '立项批复', active: true, done: true },
          { label: '网络评审', active: true, done: true },
          { label: '决赛答辩', active: true, done: false },
          { label: '结果公示', active: false, done: false }
        ]
      }
    ];
  } else {
    return [
      { 
        name: '可持续发展科技创新大奖', 
        type: '绿色发展项', 
        status: 'completed', 
        statusText: '省一等奖・已出线', 
        date: '2024-05-15', 
        role: '技术首席专家', 
        bpName: '低碳协同控制与新能源负荷智能算法书.pdf',
        steps: [
          { label: '项目申报', active: true, done: true },
          { label: '立项批复', active: true, done: true },
          { label: '网络评审', active: true, done: true },
          { label: '决赛答辩', active: true, done: true },
          { label: '结果公示', active: true, done: true }
        ]
      },
      { 
        name: '全国绿色建筑与低碳技术设计创新大赛', 
        type: '示范培育项', 
        status: 'reviewing', 
        statusText: '专家函评中', 
        date: '2024-07-01', 
        role: '首位申报人', 
        bpName: '智慧能源多点测算平台商业策划书.pdf',
        steps: [
          { label: '项目申报', active: true, done: true },
          { label: '立项批复', active: true, done: true },
          { label: '网络评审', active: true, done: false },
          { label: '决赛答辩', active: false, done: false },
          { label: '结果公示', active: false, done: false }
        ]
      }
    ];
  }
};

interface Props {
  projects: Project[];
  onCreateNew: () => void;
  onViewDetails: (project: Project) => void;
}

// Interfaces & Types for expandable customizable metrics requested by user
export interface MaterialItem {
  id: string;
  info: string;
  bp: string;
  attachments: string[];
  updatedAt: string;
}

export interface CompDetailsItem {
  name: string;
  info: string; // 参赛信息 text
  bpName: string; // bp Name (can be edited/selected)
  attachments: string[]; // Clickable to view/preview
  date: string; // 参赛时间
  stage: '初赛' | '复赛' | '决赛'; // Primary stages
  enterprise: string; // 关联企业
}

const PRESET_BPS = [
  "【博创核心】智能排班多源强化算法商业计划书.pdf",
  "【推荐专项】基于深度微型算力自调节自适应决策Bp.docx",
  "【主推荐版】3D高斯高分辨三维复现车间项目发展计划书.pdf",
  "【绿色示范】极低碳排放耦合回归能效平台投资可研报告.pptx",
  "【通用模版】高校杰出科技成果转化与孵化标准商业计划书.pdf",
  "【极简一页】核心科技团队配比一页纸BP摘要.pdf"
];

const generateDefaultDetails = (projectName: string): { materials: MaterialItem[]; competitions: CompDetailsItem[] } => {
  const isTraffic = projectName.includes('交通') || projectName.includes('智能');
  const isFactory = projectName.includes('工厂') || projectName.includes('孪生') || projectName.includes('虚拟');

  const materials: MaterialItem[] = isTraffic ? [
    {
      id: 'm-1',
      info: '博创智能排班高阶多AGENT路由自适应算法立项报告',
      bp: '智能交通自适应决策核心商业计划书_v1.pdf',
      attachments: ['神经网络收敛跑分.xlsx', '立项批件复印件.pdf'],
      updatedAt: '2024-05-22'
    },
    {
      id: 'm-2',
      info: '一期核心专利交底书：路网流自适应分流节点控制权法',
      bp: '节点控制核心底层技术规格BP_v3.docx',
      attachments: ['专利公开说明书_Draft.pdf'],
      updatedAt: '2024-05-19'
    }
  ] : isFactory ? [
    {
      id: 'm-1',
      info: '3D高斯泼溅无损光照微秒级仿真系统可研报告',
      bp: '高斯泼溅数字孪生工厂产业化BP_v2.pdf',
      attachments: ['全真渲染引擎基准测试.xlsx', '中试基地合作协议_盖章版.pdf'],
      updatedAt: '2024-05-21'
    },
    {
      id: 'm-2',
      info: '博创数字化车间低成本毫米级时延感知专利声明',
      bp: '毫米级感知工厂智能监测体系商业BP.pptx',
      attachments: ['专利申报回执和公开书.pdf'],
      updatedAt: '2024-05-15'
    }
  ] : [
    {
      id: 'm-1',
      info: '可持续绿色低碳园区能量流多级耦合测试大纲',
      bp: '绿色低碳能量流耦合系统BP_v4.pdf',
      attachments: ['用电荷载预测矩阵.xlsx', '省发改委试点通知.pdf'],
      updatedAt: '2024-05-22'
    },
    {
      id: 'm-2',
      info: '博创能效控制单元离群工况自适应回归算法细节',
      bp: '能效测算单元智能回归BP_草稿.docx',
      attachments: ['回归算法有效性论证证明.pdf'],
      updatedAt: '2024-05-12'
    }
  ];

  const competitions: CompDetailsItem[] = isTraffic ? [
    {
      name: '2024 全国高校人工智能创新大赛',
      info: '以深度自适应学习架构获评审最高分，获大赛主委会一等奖保举。',
      bpName: '智能多模态城市交通排班自适应设计书.pdf',
      attachments: ['决赛答辩幻灯片_张嘉诚.pptx', '路网跑分实况演示.mp4'],
      date: '2024-06-20',
      stage: '决赛',
      enterprise: '百度 Apollo 智能路网、国铁集团'
    },
    {
      name: '"创青春" 全国大学生创业专项挑战赛',
      info: '作为创新标杆案例入省选拔，全要素路演方案，提供闭环场景支持。',
      bpName: '城市低空交通与物流智能规划系统BP.docx',
      attachments: ['创青春商业计划白皮书_加印盖章.pdf', '物流三期测点概况表.xlsx'],
      date: '2024-07-15',
      stage: '复赛',
      enterprise: '大疆创新、中国公路学会'
    }
  ] : isFactory ? [
    {
      name: '工业 4.0 数字化转型创新实践赛',
      info: '重工流水线无损重建赛道。利用100Hz高频时序传感器与高精确3D点云，实现微秒瞬态拟真。',
      bpName: '3D高斯泼溅高保真重现智能车间方案.pptx',
      attachments: ['中车装配车间点云高阶采样.png', '工业4.0重载物理验证.xlsx'],
      date: '2024-05-30',
      stage: '初赛',
      enterprise: '中国中车、三一重工集团'
    },
    {
      name: '"挑战杯" 全国大学生课外学术科技作品竞赛',
      info: '虚实全天候交互工坊，被教育部高等司评定为国家重点大创课题项目。',
      bpName: '基于重光照算子的虚拟现实数字孪生模型.pdf',
      attachments: ['挑战杯组委会正式回信说明.pdf', '虚拟重光照试验跑跑视频.mp4'],
      date: '2024-08-05',
      stage: '复赛',
      enterprise: '中兴通讯、沈阳精密机床大联盟'
    }
  ] : [
    {
      name: '可持续发展科技创新大奖',
      info: '专注于多微网柔性控制与碳配额回馈，在新能源消纳与预测中展现出超高鲁棒性。',
      bpName: '低碳协同控制与新能源负荷智能算法书.pdf',
      attachments: ['省科技厅高精尖成果查新通知.pdf', '微电网实时负荷调优表现.mp4'],
      date: '2024-05-15',
      stage: '决赛',
      enterprise: '国网综能服务开发公司、远景能源'
    },
    {
      name: '全国绿色建筑与低碳技术设计创新大赛',
      info: '构建跨业态绿色建筑物能耗预测算模型，经实测其离群预测精度提升了43.2%。',
      bpName: '智慧能源多点测算平台商业策划书.pdf',
      attachments: ['博创绿色低碳建筑测算说明.pdf'],
      date: '2024-07-01',
      stage: '复赛',
      enterprise: '中建建筑科学研究院、博安物联'
    }
  ];

  return { materials, competitions };
};

export const ProjectWorkspace: React.FC<Props> = ({ projects, onCreateNew, onViewDetails }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterConditions, setFilterConditions] = useState([{ id: 1, field: '', operator: '', value: '' }]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([]);

  // Local state to support dynamic updates of Project details (Materials & Competitions)
  const [projectData, setProjectData] = useState<Record<string, { materials: MaterialItem[]; competitions: CompDetailsItem[] }>>({});

  // Trigger states for user edit & view actions
  const [editingBp, setEditingBp] = useState<{
    projectId: string;
    type: 'material' | 'competition';
    index: number;
    currentName: string;
  } | null>(null);

  const [viewingAttachment, setViewingAttachment] = useState<{
    fileName: string;
    projectId: string;
    projectName: string;
    source: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Initialize data
  React.useEffect(() => {
    const initial: Record<string, { materials: MaterialItem[]; competitions: CompDetailsItem[] }> = {};
    projects.forEach(p => {
      initial[p.id] = generateDefaultDetails(p.name);
    });
    setProjectData(initial);
  }, [projects]);

  // Safe getter for a project's details
  const getProjectDetails = (projectId: string, projectName: string) => {
    if (projectData[projectId]) {
      return projectData[projectId];
    }
    return generateDefaultDetails(projectName);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  const handleSaveBp = (newName: string) => {
    if (!editingBp) return;
    const { projectId, type, index } = editingBp;
    
    setProjectData(prev => {
      const copy = { ...prev };
      if (!copy[projectId]) {
        // Fallback initialize if not yet present
        const foundProj = projects.find(p => p.id === projectId);
        copy[projectId] = generateDefaultDetails(foundProj ? foundProj.name : '');
      }
      
      const projState = { ...copy[projectId] };
      if (type === 'material') {
        const listCopy = [...projState.materials];
        listCopy[index] = { ...listCopy[index], bp: newName, updatedAt: new Date().toISOString().split('T')[0] };
        projState.materials = listCopy;
      } else {
        const listCopy = [...projState.competitions];
        listCopy[index] = { ...listCopy[index], bpName: newName };
        projState.competitions = listCopy;
      }
      
      copy[projectId] = projState;
      return copy;
    });

    showToast(`商业计划书(BP)名称更新为：「${newName}」`);
    setEditingBp(null);
  };

  const addCondition = () => {
    setFilterConditions([...filterConditions, { id: Date.now(), field: '', operator: '', value: '' }]);
  };

  const removeCondition = (id: number) => {
    if (filterConditions.length > 1) {
      setFilterConditions(filterConditions.filter(c => c.id !== id));
    }
  };

  const toggleAll = () => {
    if (selectedProjectIds.length === projects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(projects.map(p => p.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedProjectIds.includes(id)) {
      setSelectedProjectIds(selectedProjectIds.filter(pid => pid !== id));
    } else {
      setSelectedProjectIds([...selectedProjectIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 relative">
          <div className="flex gap-2">
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all cursor-pointer hover:bg-slate-100">
                  <option>项目状态</option>
                  <option>待补充</option>
                  <option>审核中</option>
                  <option>结果已出</option>
              </select>
          </div>
          
          <div className="relative flex-1 group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
              <input 
                  type="text" 
                  placeholder="请输入您想搜索的内容" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-inner"
              />
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border shadow-sm",
                isFilterOpen 
                  ? "bg-brand-blue border-brand-blue text-white shadow-brand-blue/20" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>

            {/* Advanced Filter Panel - Now as an absolute popover */}
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-[800px] z-50 glass-card p-6 border-brand-blue/20 shadow-2xl animate-in zoom-in-95 fade-in duration-200 origin-top-right">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-800">筛选</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-500 font-medium">符合以下:</span>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 outline-none focus:border-brand-blue">
                          <option>所有</option>
                          <option>任一</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => setFilterConditions([{ id: 1, field: '', operator: '', value: '' }])}
                        className="text-sm text-slate-400 hover:text-rose-500 transition-colors font-medium border-l border-slate-100 pl-4"
                      >
                        清空筛选条件
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filterConditions.map((condition, index) => (
                      <div key={condition.id} className="flex items-center gap-3 group">
                        <GripVertical className="w-4 h-4 text-slate-200 flex-shrink-0" />
                        <select className="flex-1 min-w-[160px] bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all">
                          <option value="">请选择筛选的字段</option>
                          <option>项目名称</option>
                          <option>大赛名称</option>
                          <option>截止日期</option>
                          <option>当前状态</option>
                        </select>
                        <select className="w-32 flex-shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none focus:border-brand-blue transition-all">
                          <option value="">请选择</option>
                          <option>等于</option>
                          <option>包含</option>
                          <option>不包含</option>
                          <option>开始于</option>
                          <option>结束于</option>
                        </select>
                        <div className="flex-[2]">
                          <input 
                            type="text" 
                            placeholder="请输入内容"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none focus:border-brand-blue transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-4 pl-4 border-l border-slate-100 flex-shrink-0">
                          <label className="flex items-center gap-2 cursor-pointer group/check">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20 cursor-pointer" />
                            <span className="text-sm text-slate-500 group-hover/check:text-slate-800 transition-colors">常用</span>
                          </label>
                          <button 
                            onClick={() => removeCondition(condition.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={addCondition}
                    className="mt-6 flex items-center gap-2 text-brand-blue hover:text-brand-blue/80 text-sm font-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加筛选条件
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
                onClick={onCreateNew}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg glow-blue active:scale-95"
            >
                <Plus className="w-4 h-4" />
                创建新项目
            </button>
            <button 
                onClick={() => setShowCheckboxes(!showCheckboxes)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 border",
                  showCheckboxes 
                    ? "bg-slate-800 border-slate-800 text-white shadow-lg" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
            >
                <Download className="w-4 h-4" />
                {showCheckboxes ? '确认导出' : '导出'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                {showCheckboxes && (
                  <th className="pl-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20 cursor-pointer" 
                      checked={selectedProjectIds.length === projects.length && projects.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                <th className={cn("px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[20%]", showCheckboxes && "pl-2")}>项目名称</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[25%]">大赛名称</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[12%]">截止日期</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[10%]">当前状态</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[18%]">操作</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-[15%]">详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project, idx) => {
                const isExpanded = expandedProjectIds.includes(project.id);
                const competitions = getCompetitionsForProject(project.name);

                return (
                  <React.Fragment key={project.id}>
                    <tr className={cn(
                      "hover:bg-slate-50/50 transition-colors group cursor-default",
                      selectedProjectIds.includes(project.id) && "bg-brand-blue/[0.02]",
                      isExpanded && "bg-slate-50/60"
                    )}>
                      {showCheckboxes && (
                        <td className="pl-6 py-4">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20 cursor-pointer" 
                            checked={selectedProjectIds.includes(project.id)}
                            onChange={() => toggleOne(project.id)}
                          />
                        </td>
                      )}
                      <td className={cn("px-6 py-4", showCheckboxes && "pl-2")}>
                        <span className="text-sm font-bold text-slate-800">{project.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{project.competition}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500 font-mono">{project.deadline}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                            project.status === 'pending' ? "bg-orange-50 text-orange-500 border-orange-100" :
                            project.status === 'reviewing' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-slate-100 text-slate-400 border-slate-200"
                        )}>
                            ● {project.status === 'pending' ? '待补充' : project.status === 'reviewing' ? '审核中' : '结果已出'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            {project.status !== 'pending' && (
                                <button 
                                  onClick={() => onViewDetails(project)}
                                  className="flex items-center gap-1.5 px-3 py-1 hover:bg-brand-blue/5 text-brand-blue rounded text-xs font-bold transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  预览成果
                                </button>
                            )}
                            {project.status === 'pending' && (
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => onViewDetails(project)}
                                        className="bg-brand-blue text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-blue/90 transition-all shadow-sm"
                                    >
                                        继续完善
                                    </button>
                                    <span className="text-[10px] text-rose-500 font-bold">还剩 {project.remainingDays} 天</span>
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (expandedProjectIds.includes(project.id)) {
                              setExpandedProjectIds(expandedProjectIds.filter(pid => pid !== project.id));
                            } else {
                              setExpandedProjectIds([...expandedProjectIds, project.id]);
                            }
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer",
                            isExpanded 
                              ? "bg-slate-800 border-slate-800 text-white shadow-md hover:bg-slate-700" 
                              : "text-slate-600 border-slate-200 hover:border-brand-blue/20 bg-white hover:bg-blue-50/20"
                          )}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isExpanded ? '关闭详情' : '查看详情'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Collapsible Region for Project details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/40">
                        <td colSpan={showCheckboxes ? 7 : 6} className="p-0 border-t border-b border-slate-150">
                          <div className="px-8 py-7 space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* SECTION 1: 项目资料 */}
                            <div className="space-y-3.5 text-left">
                              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                <span className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-2">
                                  <span className="w-1.5 h-3 bg-brand-blue rounded-full inline-block"></span>
                                  · 项目资料
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">储存了所有与该项目直接关联的基础文档与背景BP材料</span>
                              </div>

                              <div className="overflow-hidden border border-slate-100 rounded-xl bg-white shadow-sm">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                                      <th className="px-5 py-3 w-[40%]">信息 (内容描述)</th>
                                      <th className="px-5 py-3 w-[25%]">bp (商业计划书)</th>
                                      <th className="px-5 py-3 w-[20%]">附件</th>
                                      <th className="px-5 py-3 w-[15%]">更新日期</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium whitespace-keep">
                                    {getProjectDetails(project.id, project.name).materials.map((mat, mIdx) => (
                                      <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
                                              <ClipboardList className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-slate-800 font-bold tracking-tight text-[12px]">{mat.info}</span>
                                          </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingBp({
                                                projectId: project.id,
                                                type: 'material',
                                                index: mIdx,
                                                currentName: mat.bp
                                              });
                                            }}
                                            title="点击编辑或选择商业计划书"
                                            className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 hover:bg-blue-105 hover:bg-blue-100/50 text-brand-blue rounded-xl border border-blue-100 hover:border-blue-200 text-[11px] font-black tracking-tight transition-all active:scale-95 text-left cursor-pointer"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-blue-500 group-hover:scale-105 transition-transform" />
                                            <span className="truncate max-w-[160px]">{mat.bp}</span>
                                            <PenSquare className="w-3 h-3 text-blue-400 hover:text-blue-600 opacity-60 group-hover:opacity-100 shrink-0 ml-0.5" />
                                          </button>
                                        </td>
                                        <td className="px-5 py-3.5">
                                          <div className="flex flex-col gap-1.5">
                                            {mat.attachments.map((att) => (
                                              <button
                                                key={att}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setViewingAttachment({
                                                    fileName: att,
                                                    projectId: project.id,
                                                    projectName: project.name,
                                                    source: '项目资料'
                                                  });
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-lg border border-slate-100 hover:border-blue-100 text-[10px] font-bold text-left w-fit transition-all hover:translate-x-0.5 cursor-pointer"
                                              >
                                                <Eye className="w-2.5 h-2.5 shrink-0 text-slate-400 hover:text-brand-blue" />
                                                <span className="truncate max-w-[130px]">{att}</span>
                                              </button>
                                            ))}
                                          </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                                          <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-300" />
                                            <span>{mat.updatedAt}</span>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* SECTION 2: 参赛情况 */}
                            <div className="space-y-3.5 text-left">
                              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                <span className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-2">
                                  <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block"></span>
                                  · 参赛情况
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">该项目已报名的各大杯赛/双创大赛及联合研发状态</span>
                              </div>

                              <div className="space-y-4">
                                {getProjectDetails(project.id, project.name).competitions.map((comp, compIdx) => (
                                  <div 
                                    key={comp.name}
                                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md hover:border-brand-blue/30 hover:shadow-lg transition-all space-y-4 relative overflow-hidden"
                                  >
                                    {/* Top colored ambient accent bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 to-amber-500/20" />
                                    
                                    {/* Comp Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                                          <h4 className="text-xs font-black text-slate-800 tracking-tight">{comp.name}</h4>
                                          <span className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 border uppercase tracking-wider",
                                            comp.stage === '决赛' ? "bg-red-50 text-rose-600 border-red-100" :
                                            comp.stage === '复赛' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-blue-50 text-blue-600 border-blue-100"
                                          )}>
                                            {comp.stage}
                                          </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-bold">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-300" />
                                            <span>参赛时间: <strong className="text-slate-600 font-mono">{comp.date}</strong></span>
                                          </div>
                                          <span>•</span>
                                          <div className="flex items-center gap-1">
                                            <Building2 className="w-3 h-3 text-slate-300" />
                                            <span>关联企业: <strong className="text-slate-600 font-sans">{comp.enterprise}</strong></span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Comp Details Body Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                                      {/* Info text */}
                                      <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 text-left flex flex-col justify-center">
                                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1 block">参赛核心信息</span>
                                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed text-balance">
                                          {comp.info}
                                        </p>
                                      </div>

                                      {/* BP Selector Block */}
                                      <div className="md:col-span-4 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 text-left flex flex-col justify-between gap-2">
                                        <div>
                                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 block">绑定的商业计划书 (BP)</span>
                                          <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span className="text-[11px] font-mono font-black text-slate-800 truncate" title={comp.bpName}>
                                              {comp.bpName}
                                            </span>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBp({
                                              projectId: project.id,
                                              type: 'competition',
                                              index: compIdx,
                                              currentName: comp.bpName
                                            });
                                          }}
                                          className="flex items-center justify-center gap-1 w-full mt-1.5 py-1.5 bg-white hover:bg-brand-blue hover:text-white text-brand-blue border border-slate-200 hover:border-brand-blue rounded-lg text-[10px] font-black tracking-tight active:scale-95 transition-all cursor-pointer"
                                        >
                                          <PenSquare className="w-3 h-3" />
                                          <span>编辑/选择大赛BP书</span>
                                        </button>
                                      </div>

                                      {/* Attachment section */}
                                      <div className="md:col-span-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 text-left flex flex-col justify-between gap-2">
                                        <div>
                                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 block">赛事附属支撑性物料</span>
                                          <div className="flex flex-col gap-1.5">
                                            {comp.attachments.map((att) => (
                                              <button
                                                key={att}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setViewingAttachment({
                                                    fileName: att,
                                                    projectId: project.id,
                                                    projectName: project.name,
                                                    source: comp.name
                                                  });
                                                }}
                                                className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-blue text-[10px] font-bold text-left transition-colors whitespace-nowrap cursor-pointer hover:translate-x-0.5"
                                              >
                                                <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate max-w-[140px] underline decoration-dotted">{att}</span>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-bold bg-white border border-slate-150 rounded px-2 py-0.5 text-center select-none">
                                          已接入沙箱防篡改保护
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50/50 p-4 flex items-center justify-between border-t border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-medium">共 {projects.length} 个项目</span>
              {selectedProjectIds.length > 0 && (
                <span className="text-xs text-brand-blue font-bold bg-brand-blue/5 px-2 py-0.5 rounded-full animate-in fade-in zoom-in-95">
                  已选择 {selectedProjectIds.length} 项
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button className="w-8 h-8 rounded-lg bg-brand-blue text-white text-xs font-bold shadow-sm glow-blue">1</button>
                <button className="w-8 h-8 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-200/50 transition-all">2</button>
                <button className="w-8 h-8 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-200/50 transition-all">3</button>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. EDIT & SELECT BUSINESS PLAN MODAL */}
      {editingBp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6 border-b border-sidebar-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                  <PenSquare className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-[13px]">编辑与选择商业计划书 (BP)</h3>
              </div>
              <button 
                onClick={() => setEditingBp(null)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Type directly field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">直接重命名或编辑 (Direct Filename Edit)</label>
                <input 
                  type="text" 
                  value={editingBp.currentName}
                  onChange={(e) => setEditingBp({ ...editingBp, currentName: e.target.value })}
                  placeholder="请输入您的商业计划书新文件名"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-mono font-bold"
                />
              </div>

              {/* Select preset list */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">或从备选云库一键替换为推荐预设 BP (Apply Preset Template)</label>
                <div className="grid grid-cols-1 gap-2 max-h-[190px] overflow-y-auto pr-1">
                  {PRESET_BPS.map((preset) => {
                    const isSelected = editingBp.currentName === preset;
                    return (
                      <button
                        key={preset}
                        onClick={() => setEditingBp({ ...editingBp, currentName: preset })}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-between gap-2 cursor-pointer",
                          isSelected
                            ? "bg-brand-blue/5 border-brand-blue text-brand-blue"
                            : "bg-white border-slate-150 hover:bg-slate-50 text-slate-700 hover:border-slate-300"
                        )}
                      >
                        <span className="truncate">{preset}</span>
                        {isSelected ? (
                          <span className="text-[9px] bg-brand-blue text-white px-2 py-0.5 rounded-full font-bold">已选</span>
                        ) : (
                          <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">套用</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal buttons */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setEditingBp(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={() => handleSaveBp(editingBp.currentName)}
                className="px-5 py-2 bg-brand-blue text-white hover:bg-brand-blue/95 rounded-xl text-xs font-bold shadow-md shadow-brand-blue/15 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>保存并更新关联</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECURE CLOUD ATTACHMENT LIGHTBOX PREVIEW */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 text-left flex flex-col h-[85vh]">
            
            {/* Left aligned header with indicators */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  {viewingAttachment.fileName.endsWith('.xlsx') ? (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  ) : viewingAttachment.fileName.endsWith('.png') || viewingAttachment.fileName.endsWith('.jpg') ? (
                    <Image className="w-5 h-5 text-purple-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-brand-blue" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-[13px] leading-snug truncate max-w-[400px]">
                    {viewingAttachment.fileName}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    所属项目: <strong className="text-slate-500 font-extrabold">{viewingAttachment.projectName}</strong> ({viewingAttachment.source})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingAttachment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated viewer body scrollable */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-slate-700 font-sans space-y-6">
              
              {/* Document Checksum & Safe Notice */}
              <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-semibold gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>博创云安全沙箱已载入密级预览 • 大小: {(Math.random() * 5 + 1).toFixed(2)} MB • 网安哈希校准通过</span>
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider hidden sm:inline bg-emerald-100 col-span-1 px-2.5 py-0.5 rounded-full">Secure Ssl</span>
              </div>

              {/* Doc details generator */}
              <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">数字化支撑印证附件大纲 (Support Materials Proof Ledger)</span>
                  <h4 className="text-sm font-black text-slate-800 mt-1">{viewingAttachment.fileName}</h4>
                </div>

                {viewingAttachment.fileName.endsWith('.xlsx') ? (
                  /* Excel View Sandbox Sheet Simulation */
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-4 bg-slate-100 text-[10px] font-black uppercase text-slate-500 rounded p-1 text-center font-mono">
                      <div>研究科目</div>
                      <div>预算预估</div>
                      <div>匹配度</div>
                      <div>占比</div>
                    </div>
                    {[
                      { item: '神经网络收敛层算力成本', val: '¥24,500', rate: '0.85', ratio: '24%' },
                      { item: '微秒级高分辨率传感器阵列采购', val: '¥68,000', rate: '0.90', ratio: '42%' },
                      { item: '大模型Token运行与冷启动保障', val: '¥18,000', rate: '0.95', ratio: '18%' },
                      { item: '产学研联合实验室运营管理经费', val: '¥12,000', rate: '1.00', ratio: '16%' }
                    ].map((row, rIdx) => (
                      <div key={rIdx} className="grid grid-cols-4 text-[11px] font-bold text-slate-600 p-2 border-b border-slate-100 text-center font-mono">
                        <div className="text-left font-sans truncate">{row.item}</div>
                        <div className="text-emerald-600 font-black">{row.val}</div>
                        <div>{row.rate}</div>
                        <div className="text-slate-500">{row.ratio}</div>
                      </div>
                    ))}
                    <div className="pt-2 text-right">
                      <span className="text-[10px] text-slate-400">核定联合申报预算额: </span>
                      <strong className="text-brand-blue font-mono font-black text-sm ml-1">¥122,500</strong>
                    </div>
                  </div>
                ) : (
                  /* Standard PDF Outline view with beautiful chapters */
                  <div className="space-y-4 text-xs font-semibold leading-relaxed text-slate-600">
                    <div className="space-y-2 text-left">
                      <h5 className="font-extrabold text-slate-800 text-xs">一、学术背景及核心攻关指标陈述</h5>
                      <p className="text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        该项目秉承“双创高精尖科研课题深度孵化”的核心宗旨，开展了多分支核心算法的系统性调优。印证物料中所提报的研究材料与专利申报项，均已通关多模型仿真环境的严格抗离群性能测试，并取得高校联合实验室的盖章备案。
                      </p>
                    </div>

                    <div className="space-y-2 text-left">
                      <h5 className="font-extrabold text-slate-800 text-xs">二、产学研实测佐证 & 深度合作场景</h5>
                      <p className="text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        项目旨在推倒产学研边界，不以纯粹空谈学术为终点，现已成功联合战略关联伙伴进行实机中试打磨。在与 {viewingAttachment.source === '项目资料' ? '各大联合战略实体' : viewingAttachment.source} 的测定验证中，该方案被证明能够让高算力耗损直线缩短 25% 以上。
                      </p>
                    </div>

                    <div className="space-y-2 text-left">
                      <h5 className="font-extrabold text-slate-800 text-xs">三、大创组委会盖章与赛事备档备注</h5>
                      <p className="text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        本数字加密快照件由博创数据云端签名链进行追溯，在您查阅的同时，水印已被后台静密登记。该证书仅供备战各大杯赛决赛、商业展示计划（BP）对接路演所用，受到防泄密规则严控。
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Security and auditing info panel */}
              <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl text-left space-y-2">
                <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest block">云审阅与防篡改痕迹 (Digital Footprint & Ledger)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-500 font-bold">
                  <div>校对印：<span className="text-emerald-600 font-extrabold">国家级赛区验证</span></div>
                  <div>审阅状态：<span className="text-slate-800">只读安全模式</span></div>
                  <div>数字证书：<span className="text-slate-800 font-mono">BC-928X-FF</span></div>
                  <div>安全校验：<span className="text-slate-850">印签双控通过</span></div>
                </div>
              </div>
            </div>

            {/* Lightbox footer buttons */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">数字阅览链路校验正常 • 2026-05-22</span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button 
                  onClick={() => {
                    showToast(`文件自博创系统拉取下载中: ${viewingAttachment.fileName}`);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>下载原档</span>
                </button>
                <button 
                  onClick={() => setViewingAttachment(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  已阅关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TOAST SUCCESS NOTIFICATION POPUP */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[11px] font-extrabold shadow-2xl px-5 py-3 rounded-2xl flex items-center gap-2.5 z-[9999] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
