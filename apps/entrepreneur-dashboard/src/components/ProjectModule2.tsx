import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderPlus, 
  Search, 
  Calendar, 
  Users, 
  ChevronRight, 
  ArrowLeft, 
  FileText, 
  Download, 
  Share2, 
  Trash2, 
  Upload, 
  Check, 
  Clock, 
  Plus, 
  Eye, 
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

// High-fidelity custom SVG Folder Icon that matches the user's attachment
// Lighter amber/yellow front flap, golden back folder base, and a blue document sliding/fitting inside perfectly
interface FolderIconProps {
  isHovered: boolean;
  isOpen?: boolean;
}

const CustomFolderIcon: React.FC<FolderIconProps> = ({ isHovered, isOpen = false }) => {
  return (
    <div className="relative w-28 h-24 flex items-center justify-center select-none">
      <svg 
        viewBox="0 0 100 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full drop-shadow-xl"
      >
        {/* Back folder sheet (Warm Golden #E29E0B) */}
        <path 
          d="M6 16C6 12.6863 8.68629 10 12 10H32C34.3314 10 36.5414 11.084 38 12.9282L44.5 21.0718C45.9586 22.916 48.1686 24 50.5 24H88C91.3137 24 94 26.6863 94 30V68C94 71.3137 91.3137 74 88 74H12C8.68629 74 6 71.3137 6 68V16Z" 
          fill="#D97706" 
        />
        
        {/* Sub-back piece shadow */}
        <path 
          d="M6 24H94V30H6V24Z" 
          fill="#B45309"
          opacity="0.3"
        />

        {/* Dynamic Blue Document Sheet (Animate sliding upwards on hover/open) */}
        <motion.g
          animate={{ 
            y: isOpen ? -14 : (isHovered ? -10 : 0),
            scale: isOpen ? 1.05 : (isHovered ? 1.02 : 1)
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Rounded Blue Sheet */}
          <rect 
            x="24" 
            y="18" 
            width="52" 
            height="40" 
            rx="6" 
            fill="#3B82F6" 
            className="shadow-md"
          />
          {/* Aesthetic inner lines representing structured content */}
          <line x1="34" y1="28" x2="66" y2="28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
          <line x1="34" y1="36" x2="58" y2="36" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
          <line x1="34" y1="44" x2="50" y2="44" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
        </motion.g>

        {/* Front folder flap overlay (Lighter warm gold #FCD34D & rounded, with a subtle 3D shadow) */}
        <motion.path 
          d="M6 32C6 28.6863 8.68629 26 12 26H88C91.3137 26 94 28.6863 94 32V68C94 71.3137 91.3137 74 88 74H12C8.68629 74 6 71.3137 6 68V32Z" 
          fill="#FEDF60"
          animate={{ 
            rotateX: isOpen ? -12 : (isHovered ? -6 : 0),
            originY: 0.9
          }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="drop-shadow-[0_-3px_8px_rgba(0,0,0,0.12)]"
        />

        {/* Front Slot U-Notch Overlay matching the user's uploaded icon */}
        <path 
          d="M34 26C34 24.8954 34.8954 24 36 24H64C65.1046 24 66 24.8954 66 26V34C66 35.1046 65.1046 36 64 36H36C34.8954 36 34 35.1046 34 34V26Z" 
          fill="#3B82F6" 
          opacity="0.9"
          className="mix-blend-overlay"
        />
      </svg>
      
      {/* Front Label Plate Inside Slot */}
      <div className="absolute bottom-[20px] left-[34%] right-[34%] h-2 flex items-center justify-center">
        <span className="w-8 h-1 bg-amber-600/30 rounded-full" />
      </div>
    </div>
  );
};

interface ProjectFolder {
  id: string;
  name: string;
  category: 'smart' | 'space' | 'model' | 'energy';
  categoryLabel: string;
  status: 'planning' | 'developing' | 'completed';
  lastModified: string;
  docCount: number;
  creator: string;
  team: { name: string; avatar: string }[];
  description: string;
  files: {
    id: string;
    title: string;
    type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'images';
    size: string;
    modifiedAt: string;
    status: '最新' | '草稿' | '已完成' | '需修改';
  }[];
}

const INITIAL_FOLDERS: ProjectFolder[] = [
  {
    id: 'f-1',
    name: '城市智能排班调度系统',
    category: 'smart',
    categoryLabel: '智能交通',
    status: 'developing',
    lastModified: '15:21',
    docCount: 23,
    creator: '张嘉诚',
    description: '通过融合多主体深度强化算法，重新配置城市高运量铁道自主换线与发车节拍，优化综合能效达12%。',
    team: [
      { name: '王发', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' },
      { name: '陆小凤', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' },
      { name: '司空摘星', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop' }
    ],
    files: [
      { id: 'fl-1', title: '智能调度主项申报建议书 v2.pdf', type: 'pdf', size: '3.4 MB', modifiedAt: '15:21', status: '最新' },
      { id: 'fl-2', title: '深度强化算法收敛评估报告.docx', type: 'docx', size: '1.8 MB', modifiedAt: '昨日', status: '已完成' },
      { id: 'fl-3', title: '答辩汇报 PPT 设计初稿.pptx', type: 'pptx', size: '12.4 MB', modifiedAt: '3天前', status: '需修改' },
      { id: 'fl-4', title: '一期交通工况数据测算模型表.xlsx', type: 'xlsx', size: '4.2 MB', modifiedAt: '上周', status: '已完成' }
    ]
  },
  {
    id: 'f-2',
    name: '3D高斯泼溅数字孪生工厂',
    category: 'space',
    categoryLabel: '空间重建',
    status: 'planning',
    lastModified: '昨日 10:30',
    docCount: 15,
    creator: '张嘉诚',
    description: '为先进重工业产线提供高保真无感重光照孪生重塑，以毫秒级时延响应各类工业故障预测。',
    team: [
      { name: '张嘉诚', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' },
      { name: '司空摘星', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop' }
    ],
    files: [
      { id: 'fl-5', title: '数字孪生工厂可行性方案.pdf', type: 'pdf', size: '5.1 MB', modifiedAt: '昨日 10:30', status: '最新' },
      { id: 'fl-6', title: '重工业传感器通讯规格要求.docx', type: 'docx', size: '0.9 MB', modifiedAt: '4天前', status: '草稿' },
      { id: 'fl-7', title: '首期仿真测试渲染参数设定.pdf', type: 'pdf', size: '2.7 MB', modifiedAt: '上周', status: '已完成' }
    ]
  },
  {
    id: 'f-3',
    name: '博创AI多智能体协同终端',
    category: 'model',
    categoryLabel: '大模型应用',
    status: 'completed',
    lastModified: '3天前',
    docCount: 8,
    creator: '张嘉诚',
    description: '基于自研智能体路由引擎，连环触发多个高能Agent协同编写代码、检索行研、自动化生产BP等。',
    team: [
      { name: '王发', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' },
      { name: '陆小凤', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' }
    ],
    files: [
      { id: 'fl-8', title: '博创Agent路由设计规格书.pdf', type: 'pdf', size: '2.2 MB', modifiedAt: '3天前', status: '已完成' },
      { id: 'fl-9', title: '智能体提示词微调数据集概要.xlsx', type: 'xlsx', size: '1.5 MB', modifiedAt: '5天前', status: '最新' }
    ]
  },
  {
    id: 'f-4',
    name: '智能汽车电池健康监测平台',
    category: 'energy',
    categoryLabel: '新能源',
    status: 'developing',
    lastModified: '5天前',
    docCount: 18,
    creator: '陆小凤',
    description: '通过高精度特征提取网络，捕捉汽车电池工况的微小离群波动，提前两周预测电芯内短路极化风险。',
    team: [
      { name: '陆小凤', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' },
      { name: '王发', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' }
    ],
    files: [
      { id: 'fl-10', title: '电化学阻抗谱(EIS)健康度评估算法.pdf', type: 'pdf', size: '6.4 MB', modifiedAt: '5天前', status: '最新' },
      { id: 'fl-11', title: '多通道电芯监测数据采集手册.docx', type: 'docx', size: '2.1 MB', modifiedAt: '1周前', status: '已完成' }
    ]
  }
];

export const ProjectModule2: React.FC = () => {
  const [folders, setFolders] = useState<ProjectFolder[]>(INITIAL_FOLDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'smart' | 'space' | 'model' | 'energy'>('all');
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<ProjectFolder | null>(null);
  
  // New project modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjCategory, setNewProjCategory] = useState<'smart' | 'space' | 'model' | 'energy'>('smart');
  
  // Toast notifications
  const [successToast, setSuccessToast] = useState('');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const catLabels = {
      smart: '智能交通',
      space: '空间重建',
      model: '大模型应用',
      energy: '新能源'
    };

    const newFolder: ProjectFolder = {
      id: `f-${Date.now()}`,
      name: newProjName,
      category: newProjCategory,
      categoryLabel: catLabels[newProjCategory],
      status: 'planning',
      lastModified: '今天 刚更新',
      docCount: 1,
      creator: '张嘉诚',
      description: newProjDesc || '新创建的项目文件夹，用于集中化管理、协同编写相关申报资料。',
      team: [
        { name: '王发', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' }
      ],
      files: [
        { id: `fl-${Date.now()}`, title: '初始化申报立项模板.pdf', type: 'pdf', size: '1.2 MB', modifiedAt: '刚刚', status: '最新' }
      ]
    };

    setFolders([newFolder, ...folders]);
    setNewProjName('');
    setNewProjDesc('');
    setIsCreateOpen(false);
    showToast(`文件夹「${newFolder.name}」创建成功！`);
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除此项目文件夹及其内含的所有文档吗？此操作不可逆。')) {
      const folderToDelete = folders.find(f => f.id === id);
      setFolders(folders.filter(f => f.id !== id));
      showToast(`已删除项目「${folderToDelete?.name}」`);
    }
  };

  const handleShareFile = (fileTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://bochuang.com/documents/share/${Math.floor(Math.random() * 900000 + 100000)}`);
    showToast(`已复制「${fileTitle}」的极速预览共享链！`);
  };

  const handleDownloadFile = (fileTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`正在启动云端专线安全下载「${fileTitle}」...`);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedFolder) return;
    const file = e.target.files[0];
    
    const fileTypeMap: Record<string, 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'images'> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };

    const type = fileTypeMap[file.type] || 'pdf';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

    const newFile = {
      id: `fl-${Date.now()}`,
      title: file.name,
      type,
      size: `${sizeMB} MB`,
      modifiedAt: '刚刚',
      status: '最新' as const
    };

    // Update state
    const updatedFolders = folders.map(f => {
      if (f.id === selectedFolder.id) {
        const nextFiles = [newFile, ...f.files];
        return {
          ...f,
          files: nextFiles,
          docCount: nextFiles.length,
          lastModified: '刚刚 刚上传'
        };
      }
      return f;
    });

    setFolders(updatedFolders);
    const updatedFolder = updatedFolders.find(f => f.id === selectedFolder.id);
    if (updatedFolder) setSelectedFolder(updatedFolder);
    
    showToast(`成功将本地方案「${file.name}」导入项目文件库！`);
  };

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          folder.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || folder.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 select-none relative">
      {/* Toast Announcement */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[1000] bg-slate-900 border border-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedFolder ? (
          <motion.div
            key="folder-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight text-slate-800">项目模块2</h2>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest">
                    触感式文件库
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">
                  轻量化管理多核项目文档、设计草案与立项卷宗
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入文件夹或项目描述..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  />
                </div>
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-brand-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  新建项目夹
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 pb-4">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black transition-all",
                  categoryFilter === 'all' 
                    ? "bg-brand-blue text-white shadow-md shadow-blue-500/10" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                )}
              >
                全部大类
              </button>
              <button 
                onClick={() => setCategoryFilter('smart')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black transition-all",
                  categoryFilter === 'smart' 
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/10" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                )}
              >
                智能交通
              </button>
              <button 
                onClick={() => setCategoryFilter('space')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black transition-all",
                  categoryFilter === 'space' 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                )}
              >
                空间重建
              </button>
              <button 
                onClick={() => setCategoryFilter('model')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black transition-all",
                  categoryFilter === 'model' 
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/10" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                )}
              >
                大模型应用
              </button>
              <button 
                onClick={() => setCategoryFilter('energy')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black transition-all",
                  categoryFilter === 'energy' 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10" 
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                )}
              >
                新能源
              </button>
            </div>

            {/* Folders Grid Section */}
            {filteredFolders.length === 0 ? (
              <div className="py-24 text-center space-y-4 border border-dashed border-slate-100 rounded-[2.5rem]">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-800 font-bold text-sm">未能匹配到相关大类文件夹</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">试试其他搜索词或新建立一个项目卷宗</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFolders.map((folder) => {
                  const isHovered = hoveredFolderId === folder.id;
                  return (
                    <motion.div
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder)}
                      onMouseEnter={() => setHoveredFolderId(folder.id)}
                      onMouseLeave={() => setHoveredFolderId(null)}
                      whileHover={{ y: -6 }}
                      className="group relative bg-[#0B0F19] rounded-[2rem] p-6 h-[320px] flex flex-col justify-between cursor-pointer border border-slate-800 shadow-2xl transition-all"
                    >
                      {/* Interactive Subtle Cyber Glow */}
                      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Top Action Header */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className={cn(
                          "text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider",
                          folder.category === 'smart' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                          folder.category === 'space' && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                          folder.category === 'model' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                          folder.category === 'energy' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        )}>
                          {folder.categoryLabel}
                        </span>
                        
                        <button 
                          onClick={(e) => handleDeleteFolder(folder.id, e)}
                          className="w-7 h-7 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Interactive Folder Icon Frame */}
                      <div className="relative z-10 flex justify-center py-2 h-28 items-center">
                        <CustomFolderIcon isHovered={isHovered} />
                        
                        {/* Display doc badge count overlaying folder */}
                        <motion.div 
                          className="absolute bottom-1 bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg"
                          animate={{ y: isHovered ? -5 : 0 }}
                        >
                          {folder.docCount} 份卷宗
                        </motion.div>
                      </div>

                      {/* Title & Stats Block */}
                      <div className="relative z-10 space-y-1 text-center">
                        <h3 className="font-extrabold text-slate-200 text-[15px] tracking-tight truncate px-1">
                          {folder.name}
                        </h3>
                        <p className="text-[10px] text-slate-400/90 font-medium px-2 line-clamp-1">
                          {folder.description}
                        </p>
                      </div>

                      {/* Bottom Footer Details */}
                      <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{folder.lastModified}</span>
                        </div>
                        <div className="flex -space-x-1.5">
                          {folder.team.map((t, i) => (
                            <img 
                              key={i} 
                              src={t.avatar} 
                              className="w-5 h-5 rounded-full border border-slate-950 object-cover" 
                              title={t.name}
                              alt={t.name}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* Inside Folder Detailed Document view */
          <motion.div
            key="folder-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Nav Back Button & Folder Info Card */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedFolder(null)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all flex items-center justify-center border border-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[8px] font-black px-1.5 py-0.5 rounded",
                    selectedFolder.category === 'smart' && "bg-amber-100 text-amber-700",
                    selectedFolder.category === 'space' && "bg-indigo-100 text-indigo-700",
                    selectedFolder.category === 'model' && "bg-blue-100 text-blue-700",
                    selectedFolder.category === 'energy' && "bg-emerald-100 text-emerald-700"
                  )}>
                    {selectedFolder.categoryLabel}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                    {selectedFolder.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">{selectedFolder.description}</p>
              </div>
            </div>

            {/* Two Column Layout: Left Column (Files List/Manager), Right Column (Folder Operations / Drag Drop) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Files Table */}
              <div className="lg:col-span-8 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    收录文档 ({selectedFolder.files.length}件)
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>创建人: {selectedFolder.creator}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedFolder.files.map((file) => (
                    <div 
                      key={file.id}
                      className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-sm hover:border-blue-500/20 group/file transition-all duration-350"
                    >
                      {/* Left Block: File Icon + File Info */}
                      <div className="flex items-center gap-3.5">
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                          file.type === 'pdf' && "bg-rose-50 text-rose-500",
                          file.type === 'docx' && "bg-blue-50 text-blue-600",
                          file.type === 'pptx' && "bg-amber-50 text-amber-500",
                          file.type === 'xlsx' && "bg-emerald-50 text-emerald-600"
                        )}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 max-w-sm md:max-w-md">
                          <p className="text-xs font-extrabold text-slate-800 truncate leading-snug group-hover/file:text-brand-blue transition-colors">
                            {file.title}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                            <span>大小: {file.size}</span>
                            <span>•</span>
                            <span>完成率: 100%</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: File Specs & Actions */}
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-md",
                          file.status === '最新' && "bg-blue-50 text-blue-600",
                          file.status === '已完成' && "bg-emerald-50 text-emerald-600",
                          file.status === '草稿' && "bg-slate-50 text-slate-500",
                          file.status === '需修改' && "bg-rose-50 text-rose-500"
                        )}>
                          {file.status}
                        </span>

                        {/* Hover Action Bar */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => handleShareFile(file.title, e)}
                            className="p-2 bg-slate-50 hover:bg-brand-blue hover:text-white rounded-xl text-slate-400 transition-all cursor-pointer"
                            title="一键分享预览"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleDownloadFile(file.title, e)}
                            className="p-2 bg-slate-50 hover:bg-brand-blue hover:text-white rounded-xl text-slate-400 transition-all cursor-pointer"
                            title="下载文件"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Interaction Hub & Drag Area */}
              <div className="lg:col-span-4 space-y-6">
                {/* Visual Tactile Uploader Panel */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDragging(false); 
                    showToast('文件拖入成功，正在智能解析加入文书库...'); 
                  }}
                  className={cn(
                    "relative border-2 border-dashed rounded-[2.5rem] p-8 text-center transition-all duration-350 cursor-pointer min-h-[220px] flex flex-col justify-center items-center gap-3.5",
                    isDragging 
                      ? "border-brand-blue bg-blue-50/20 scale-[1.02] shadow-2xl" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <input 
                    type="file" 
                    id="doc-upload-raw" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleUploadFile}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-md">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-800 font-extrabold text-[13px]">
                      将申报材料拖放到此处
                    </p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                      支持 PDF / DOCX / PPTX / XLSX 文件
                    </p>
                  </div>
                  <div className="text-[9px] font-black uppercase text-brand-blue tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    或者点击上传本地方案
                  </div>
                </div>

                {/* Team Collaboration Panel */}
                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                    <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                      项目协同小组成员
                    </h4>
                    <button 
                      onClick={() => showToast('正在开启网络共享席位配置...')}
                      className="text-[10px] font-extrabold text-brand-blue flex items-center gap-0.5 hover:opacity-80"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      邀请
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedFolder.team.map((member, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={member.avatar} className="w-6 h-6 rounded-lg object-cover border border-slate-100" alt={member.name} />
                          <span className="text-xs font-bold text-slate-700">{member.name}</span>
                        </div>
                        <span className="text-[9px] font-black bg-slate-50 text-slate-500 px-2 py-0.5 rounded uppercase">
                          {i === 0 ? '组长' : '协作人'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create New Folder Sliding Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 border border-slate-100 z-10"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-brand-blue">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-800 text-base">建立新立项群组</h3>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">项目文件夹名称</label>
                  <input 
                    type="text" 
                    required
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="例如: 重型机械液压臂智能监测系统"
                    className="w-full px-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">立项大类</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'smart', label: '智能交通' },
                      { key: 'space', label: '空间重建' },
                      { key: 'model', label: '大模型应用' },
                      { key: 'energy', label: '新能源' }
                    ].map((opt) => (
                      <button 
                        key={opt.key}
                        type="button"
                        onClick={() => setNewProjCategory(opt.key as any)}
                        className={cn(
                          "py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all",
                          newProjCategory === opt.key 
                            ? "bg-brand-blue/5 border-brand-blue text-brand-blue" 
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">立项初衷与描述</label>
                  <textarea 
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="输入该申报组的详细描述与收纳规则范围"
                    rows={3}
                    className="w-full px-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-slate-800"
                  />
                </div>

                <div className="pt-3">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/15 active:scale-95 transition-all text-center"
                  >
                    立即生成立项库
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
