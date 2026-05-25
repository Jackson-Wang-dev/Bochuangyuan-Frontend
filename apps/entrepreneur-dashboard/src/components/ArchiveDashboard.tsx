import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  TrendingUp, 
  Search, 
  Plus, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Zap,
  Layout,
  BookOpen,
  PieChart,
  Download,
  Trash2,
  MoreVertical,
  Briefcase,
  Upload,
  ArrowRight,
  ShieldCheck,
  Eye,
  X,
  Calendar,
  MapPin,
  Trophy,
  Clock,
  Link,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GrowthTimeline } from './GrowthTimeline';
import { GrowthAnalytics } from './GrowthAnalytics';
import CircularGallery from './CircularGallery';
import { AssessmentCard } from './AssessmentCard';
import { TimelineEvent, GrowthDataPoint, PersonalityData } from '../types';

const COMPETITIONS = [
  {
    id: 1,
    title: "全国创新创业大赛 2024",
    tagline: "报名进行中",
    description: "汇聚全国顶尖创新力量，为创业者提供展示舞台、资本对接与顶尖导师资源。总奖金池高达 ¥ 500万。",
    deadline: "2024.03.15",
    location: "北京 · 中国",
    reward: "500",
    rewardUnit: "万",
    image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=1400"
  },
  {
    id: 2,
    title: "全球 AI 挑战赛 2024",
    tagline: "火热筹备中",
    description: "探索人工智能的极限，挑战最前沿的算法难题。与全球顶尖开发者同台竞技，赢取丰厚奖金与硅谷交流机会。",
    deadline: "2024.05.20",
    location: "上海 · 中国",
    reward: "800",
    rewardUnit: "万",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1400"
  },
  {
    id: 3,
    title: "未来城市建构大赛",
    tagline: "作品征集中",
    description: "重新构想我们的居住空间。关注可持续发展、智慧建筑与人文关怀，为未来的城市生活提供创新的设计方案。",
    deadline: "2024.06.10",
    location: "深圳 · 中国",
    reward: "300",
    rewardUnit: "万",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1400"
  }
];

const sliderVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

interface Props {
  timelineEvents: TimelineEvent[];
  growthData: GrowthDataPoint[];
  personalityData?: PersonalityData[];
  onStartAssessment?: () => void;
  onRegisterCompetition?: () => void;
  onGoToBPEdit?: () => void;
}

export const ArchiveDashboard: React.FC<Props> = ({
  timelineEvents,
  growthData,
  onRegisterCompetition,
  onGoToBPEdit
}) => {
  const [activeTab, setActiveTab] = useState<'growth' | 'assessment'>('growth');
  const [documentFilter, setDocumentFilter] = useState('全部');
  const [showGallery, setShowGallery] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [[compPage, compDirection], setCompPage] = useState([0, 0]);
  const [isCompHovered, setIsCompHovered] = useState(false);
  const compTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCompIndex = Math.abs(compPage % COMPETITIONS.length);

  const paginateComp = useCallback((newDirection: number) => {
    setCompPage([compPage + newDirection, newDirection]);
  }, [compPage]);

  const goToCompSlide = (index: number) => {
    const newDirection = index > currentCompIndex ? 1 : -1;
    setCompPage([index, newDirection]);
  };

  useEffect(() => {
    if (!isCompHovered) {
      compTimerRef.current = setInterval(() => {
        paginateComp(1);
      }, 5000);
    }
    return () => {
      if (compTimerRef.current) clearInterval(compTimerRef.current);
    };
  }, [isCompHovered, paginateComp]);

  const currentComp = COMPETITIONS[currentCompIndex];

  const [members, setMembers] = useState([
    { id: '1', name: '王发', role: '创建人', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '2', name: '陆小凤', role: '协作员', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '3', name: '司空摘星', role: '协作员', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop' },
  ]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('https://bochuang.com/bp/share/129381');
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  // Generate 10 items for the gallery
  const galleryItems = Array.from({ length: 10 }).map((_, idx) => {
    const event = timelineEvents[idx % timelineEvents.length];
    return {
      id: `ev-${idx}`,
      title: event.title,
      date: event.date,
      description: event.description,
      image: `https://picsum.photos/seed/tech-${idx}/800/600?grayscale`,
      text: event.title
    };
  });

  const initialCategories = [
    { 
      id: 'industry', 
      title: '行业前沿', 
      desc: 'AI与城市建模最新动态', 
      icon: <Zap className="w-8 h-8" />, 
      color: 'indigo', 
      badge: '5条新见解',
      bgIcon: <Zap className="w-48 h-48" />
    },
    { 
      id: 'investment', 
      title: '投资机会', 
      desc: '全网创投资资本实时追踪', 
      icon: <TrendingUp className="w-8 h-8" />, 
      color: 'emerald', 
      badge: '2条新匹配',
      bgIcon: <TrendingUp className="w-48 h-48" />
    },
    { 
      id: 'policy', 
      title: '政策解读', 
      desc: '政策专案中心', 
      icon: <FileText className="w-8 h-8" />, 
      color: 'white', 
      badge: '本月更新',
      avtars: [1, 2, 3]
    },
    { 
      id: 'thinktank', 
      title: '智库动态', 
      desc: '全球顶尖智库报告分析', 
      icon: <BookOpen className="w-8 h-8" />, 
      color: 'slate', 
      badge: '新增3份'
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const { scrollLeft } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - 400 : scrollLeft + 400;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const docCategories = ['全部', '学术论文', '专利技术', '荣誉奖项', '资质证件'];

  const mockDocuments = [
    { title: '深度学习图像识别技术综述报告', size: '2.3 MB', category: '学术论文', date: '2025.03.01', status: '已发表' },
    { title: '基于AI的分布式计算架构设计方案', size: '1.8 MB', category: '学术论文', date: '2024.11.15', status: '实审中' },
    { title: '多模态融合的智慧城市交通感知研究', size: '3.1 MB', category: '学术论文', date: '2024.07.22', status: '已发表' },
    { title: '新型深度学习模型训练效率优化专利申请', size: '0.9 MB', category: '专利技术', date: '2023.08.10', status: '实审中' },
    { title: '全国大学生创业大赛金奖荣誉证书', size: '1.2 MB', category: '荣誉奖项', date: '2023.11.20', status: '有效' },
    { title: '个人有效身份证件扫描件', size: '0.5 MB', category: '资质证件', date: '2020.01.01', status: '有效', showActions: true },
    { title: '中国护照扫描件', size: '0.4 MB', category: '资质证件', date: '2019.06.15', status: '有效' },
    { title: '单样本识别下的对比学习性能提升研究', size: '2.7 MB', category: '学术论文', date: '2024.04.10', status: '已发表' },
  ];

  const filteredDocuments = mockDocuments.filter(doc => 
    documentFilter === '全部' || doc.category === documentFilter
  );

  return (
    <div className="space-y-10 pb-20 relative">
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[1000] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            共享链接已复制
          </motion.div>
        )}
      </AnimatePresence>
      {/* 1. Achievement Task Banner (AchievementMissionCenter) */}
      <div className="space-y-6">
        {/* 标题区域 */}
        <div className="px-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">成就任务中心</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
            个人成就成长里程碑
          </p>
        </div>

        {/* AI 智能推荐卡片 */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative group cursor-pointer"
        >
          {/* 外层炫彩光晕效果 */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-[2rem] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500" />
          
          {/* 主卡片内容 */}
          <div className="relative bg-white border border-blue-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-500/5 group-hover:border-blue-300 transition-all">
            <div className="flex items-center gap-6">
              {/* 左侧 AI 智能图标 */}
              <div className="relative">
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform">
                  <Sparkles size={32} className="animate-pulse relative z-10" />
                  {/* 底部扩散光影 */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-600/20 blur-xl" />
                </div>
                {/* 右上角小闪电标签 */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <Zap size={10} className="text-white fill-current" />
                </div>
              </div>

              {/* 中间文字与进度条区域 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm shadow-blue-100">
                    AI 智慧推荐
                  </span>
                </div>
                
                <p className="text-lg font-bold text-slate-800">
                  发现新路径！正在通往 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ml-1">
                    「人才大佬」
                  </span> 称号
                </p>

                {/* 进度条套件 */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '80%' }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-500 italic">
                    进度 8/10 
                    <span className="text-blue-600 ml-2">再上传 2 份材料即可解锁证书 已达成 ✓</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧交互按钮 */}
            <button className="mt-4 md:mt-0 flex items-center gap-3 bg-slate-900 text-white hover:bg-blue-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 group-hover:scale-105 active:scale-95">
              去同步档案 <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 2. Shrunk Competition Slider Module */}
      <div className="space-y-4">
        {/* Title */}
        <div className="px-2 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">热门征集 · 竞赛前沿</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
              对接海量资源与高额奖金
            </p>
          </div>
        </div>

        {/* Compressed Slider Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onMouseEnter={() => setIsCompHovered(true)}
          onMouseLeave={() => setIsCompHovered(false)}
          className="relative rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-xl group transition-all duration-500 hover:shadow-blue-500/10 h-[220px] w-full"
        >
          {/* Subtle inside glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Slider Content */}
          <div className="w-full h-full relative">
            <AnimatePresence initial={false} custom={compDirection}>
              <motion.div
                key={compPage}
                custom={compDirection}
                variants={sliderVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.4, ease: "easeInOut" },
                  opacity: { duration: 0.25 }
                }}
                className="absolute inset-0 flex flex-row w-full h-full"
              >
                {/* Left Area (Sleek Description and Info) */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between relative z-10 bg-gradient-to-r from-blue-50/90 to-white/95 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                        推荐
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {currentComp.tagline}
                      </span>
                    </div>

                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                      {currentComp.title}
                    </h3>
                    <p className="text-slate-500 text-[11px] font-medium max-w-xl leading-relaxed pl-3 border-l-2 border-slate-100 line-clamp-2">
                      {currentComp.description}
                    </p>
                  </div>

                  {/* Compact Info Badges */}
                  <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-500 font-bold border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>截止 {currentComp.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentComp.location}</span>
                    </div>
                  </div>
                </div>

                {/* Right Area (Image and Action Button) */}
                <div className="w-[30%] md:w-[40%] xl:w-[35%] relative overflow-hidden shrink-0 flex items-center justify-center bg-slate-950">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent z-10" />
                  <img 
                    src={currentComp.image} 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    alt={currentComp.title} 
                  />

                  {/* Compact Reward Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-2 shadow-xl">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-black tabular-nums">¥ {currentComp.reward}{currentComp.rewardUnit}</span>
                    </div>
                  </div>

                  {/* Shrunk Registration Button */}
                  <div className="absolute bottom-4 right-4 z-20 opacity-90 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={onRegisterCompetition}
                      className="bg-brand-blue hover:bg-blue-600 active:scale-95 text-white text-[11px] font-black px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-1.5 group/btn"
                    >
                      立即报名
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Compact Navigation Arrows */}
            <button 
              onClick={() => paginateComp(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-35 w-8 h-8 rounded-full bg-white/80 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90 shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => paginateComp(1)}
              className="absolute right-[calc(30%+8px)] md:right-[calc(40%+8px)] xl:right-[calc(35%+8px)] top-1/2 -translate-y-1/2 z-35 w-8 h-8 rounded-full bg-white/80 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-brand-blue opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90 shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Shrunk Carousel Indicators */}
            <div className="absolute bottom-3 left-6 flex gap-1.5 z-30">
              {COMPETITIONS.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => goToCompSlide(idx)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    currentCompIndex === idx 
                      ? "w-4 bg-brand-blue shadow-sm" 
                      : "w-2 bg-slate-300/60 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Core Intelligence Station */}
      <section className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">精选推荐·核心情报站</h2>
          </div>
        </div>

        <div className="relative px-2 group/scroll">
          {/* 悬浮左右切换按钮 */}
          <button 
            onClick={() => scroll('left')} 
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-blue opacity-0 group-hover/scroll:opacity-100 transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => scroll('right')} 
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-blue opacity-0 group-hover/scroll:opacity-100 transition-all active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
          
          <div 
            ref={scrollRef} 
            className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x scroll-smooth -mx-2 px-2"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {/* 热门赛事精选推荐卡片 (Square Competition Card) */}
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={onRegisterCompetition}
              className="min-w-[400px] h-64 rounded-[2.5rem] relative overflow-hidden group/card cursor-pointer snap-start flex flex-col justify-between p-10 bg-slate-950 text-white shadow-2xl"
            >
              {/* Background Image with Dark Overlay */}
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover opacity-40 group-hover/card:scale-110 transition-transform duration-700" 
                  alt="Competition BG"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
              </div>

              {/* Top Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="bg-brand-blue/90 border border-blue-400/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                  热门赛事
                </div>
              </div>

              {/* Center Text */}
              <div className="relative z-10 space-y-1">
                <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                  全国创新创业大赛 2024
                </h3>
                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                  全球首创科技城市项目孵化，获取 500 万丰厚奖金与海量投资资本直接对接机会。
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="relative z-10 flex items-center justify-between">
                <button 
                  onClick={(e) => { e.stopPropagation(); if (onRegisterCompetition) onRegisterCompetition(); }}
                  className="flex items-center gap-2 bg-white text-slate-900 px-6 py-2.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  立即报名
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/50 bg-white/5 px-3 py-1.5 rounded-xl">
                  <Calendar className="w-3 h-3 text-white/40" />
                  <span>截止 03.15</span>
                </div>
              </div>
            </motion.div>

            {initialCategories.map((category) => (
              <motion.div 
                key={category.id} 
                whileHover={{ y: -5 }}
                className={cn(
                  "min-w-[400px] h-64 rounded-[2.5rem] relative overflow-hidden group/card cursor-pointer snap-start flex flex-col justify-between p-10",
                  category.color === 'white' ? "bg-white shadow-2xl shadow-slate-200/50 border border-slate-100/50" : "text-white shadow-2xl"
                )}
              >
                {/* Background Shadow/Glow */}
                {category.color === 'indigo' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800" />
                )}
                {category.color === 'emerald' && (
                  <div className="absolute inset-0 bg-[#0f2e2d]" />
                )}
                {category.color === 'slate' && (
                  <div className="absolute inset-0 bg-slate-900" />
                )}
                {category.color === 'white' && (
                   <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-full -mr-10 -mt-10 blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
                )}

                {/* Content Icons */}
                <div className="relative z-10 flex items-center justify-between">
                   <div className={cn(
                     "p-3 rounded-2xl backdrop-blur-md",
                     category.color === 'white' ? "bg-slate-50 text-slate-600" : "bg-white/10 text-white"
                   )}>
                      {category.icon}
                   </div>
                   {category.bgIcon && (
                     <div className="absolute top-0 right-0 opacity-10 blur-sm group-hover/card:scale-110 transition-transform">
                        {category.bgIcon}
                     </div>
                   )}
                   {category.badge && (
                      <div className={cn(
                        "bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10",
                        category.color === 'white' ? "bg-amber-50 text-amber-600 border-amber-100" : "text-white"
                      )}>
                        {category.badge}
                      </div>
                   )}
                </div>

                <div className="relative z-10 space-y-2">
                   <h3 className={cn("text-2xl font-bold", category.color === 'white' ? "text-slate-800" : "text-white")}>
                      {category.title}
                   </h3>
                   <p className={cn("text-sm", category.color === 'white' ? "text-slate-400" : "text-white/60")}>
                      {category.desc}
                   </p>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                   <button className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-black/5 hover:scale-105 transition-transform",
                      category.color === 'white' ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                   )}>
                      查看详情
                      <ChevronRight className="w-3.5 h-3.5" />
                   </button>

                   {category.avtars && (
                      <div className="flex -space-x-3">
                        {category.avtars.map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                             <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[8px] text-white font-bold">
                           +15
                        </div>
                      </div>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Growth Section (Timeline & Chart Side-by-Side as in Image 2) */}
      <section className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Timeline Left */}
            <div className="lg:col-span-4 lg:border-r lg:border-slate-100 lg:pr-12">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-slate-800">成长历程</h2>
                  <button 
                    onClick={() => setShowGallery(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-brand-blue hover:bg-white transition-all shadow-sm group"
                  >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">预览</span>
                  </button>
               </div>
               
               <div className="relative space-y-10 pl-6 border-l-2 border-slate-100/60">
                  {timelineEvents.map((event, idx) => (
                    <div key={event.id} className="relative group">
                       <div className={cn(
                          "absolute -left-[31px] top-0 w-3 h-3 rounded-full border-2 border-white shadow-md z-10",
                          idx === 0 ? "bg-brand-blue ring-4 ring-blue-100" : idx === 1 ? "bg-amber-400" : "bg-blue-600"
                       )} />
                       <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all cursor-default">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{event.date}</span>
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-brand-blue transition-colors">{event.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{event.description}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Chart Right */}
            <div className="lg:col-span-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-10 self-center lg:self-start">
                    <div className="p-1 bg-slate-100 rounded-2xl flex">
                        <button 
                          onClick={() => setActiveTab('growth')}
                          className={cn(
                            "px-8 py-2.5 rounded-xl text-xs font-bold transition-all",
                            activeTab === 'growth' ? "bg-white text-brand-blue shadow-lg" : "text-slate-400"
                          )}
                        >
                          个人生长曲线
                        </button>
                        <button 
                          onClick={() => setActiveTab('assessment')}
                          className={cn(
                            "px-8 py-2.5 rounded-xl text-xs font-bold transition-all",
                            activeTab === 'assessment' ? "bg-white text-brand-blue shadow-lg" : "text-slate-400"
                          )}
                        >
                          系统测评
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                   {activeTab === 'growth' ? (
                     <GrowthAnalytics data={growthData} />
                   ) : (
                     <AssessmentCard />
                   )}
                </div>
            </div>
        </div>
      </section>

      {/* 4. Intelligent Resource Library (Table matching Image 1) */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        {/* 头部信息 */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">档案库</h3>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center">
                  {docCategories.map(cat => (
                      <button 
                          key={cat}
                          onClick={() => setDocumentFilter(cat)}
                          className={cn(
                              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                              documentFilter === cat ? "bg-white text-brand-blue shadow-lg" : "text-slate-400 hover:text-slate-600"
                          )}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
            {/* Search & Upload */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="通过文件名、DOI、流水号快速检索..."
                        className="w-full bg-slate-50 border-0 rounded-[1.5rem] pl-16 pr-8 py-5 text-sm font-bold text-slate-700 placeholder-slate-300 focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none"
                    />
                </div>
                <button className="px-10 py-5 bg-brand-blue text-white rounded-[1.5rem] font-black text-sm flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Upload className="w-5 h-5" />
                    上传新文件
                </button>
            </div>

            {/* 表格内容 */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <th className="px-8 py-5">文件名</th>
                            <th className="px-8 py-5">所属分类</th>
                            <th className="px-8 py-5">上传日期</th>
                            <th className="px-8 py-5">状态标识</th>
                            <th className="px-8 py-5 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredDocuments.map((doc, idx) => (
                           <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                               <td className="px-8 py-6">
                                  <div className="flex items-start gap-4">
                                     <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                        doc.category === '学术论文' ? "bg-blue-50 text-brand-blue" :
                                        doc.category === '专利技术' ? "bg-emerald-50 text-emerald-500" :
                                        doc.category === '荣誉奖项' ? "bg-amber-50 text-amber-500" : "bg-purple-50 text-purple-500"
                                     )}>
                                        <FileText className="w-5 h-5" />
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-700 group-hover:text-brand-blue transition-colors line-clamp-1">{doc.title}</p>
                                        <p className="text-[10px] font-black text-slate-400 font-mono">{doc.size}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <span className="text-[10px] font-black text-slate-400 px-3 py-1 bg-slate-100 rounded-lg group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">{doc.category}</span>
                               </td>
                               <td className="px-8 py-6 font-mono text-xs font-bold text-slate-500">{doc.date}</td>
                               <td className="px-8 py-6">
                                  <div className={cn(
                                     "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest",
                                     doc.status === '已发表' ? "bg-emerald-50 text-emerald-600" :
                                     doc.status === '实审中' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                     "bg-blue-50 text-brand-blue"
                                  )}>
                                     <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        doc.status === '已发表' ? "bg-emerald-500" :
                                        doc.status === '实审中' ? "bg-amber-500 animate-pulse" : "bg-brand-blue"
                                     )} />
                                     {doc.status}
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="p-2.5 text-slate-400 hover:text-brand-blue hover:bg-white rounded-xl shadow-sm transition-all">
                                          <Download className="w-4 h-4" />
                                      </button>
                                      <button className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl shadow-sm transition-all">
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                      <button className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-white rounded-xl shadow-sm transition-all">
                                          <MoreVertical className="w-4 h-4" />
                                      </button>
                                  </div>
                               </td>
                           </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </section>

      {/* Growth Preview Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-3xl flex items-center justify-center p-8 overflow-hidden"
          >
            {/* Modal Container (Green Box Area) */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-6xl h-full max-h-[85vh] bg-white/[0.01] border border-white/5 rounded-[3.5rem] backdrop-blur-[60px] relative overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Background Glows inside container */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
              </div>
              
              {/* Close Button (Red Box area) */}
              <button 
                onClick={() => setShowGallery(false)}
                className="absolute top-10 right-10 w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all z-50 group active:scale-90"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Header Text */}
              <div className="absolute top-12 left-12 z-20">
                <h2 className="text-white text-3xl font-black tracking-tight">成长全景预览</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em] mt-2">GROWTH PANORAMA PREVIEW</p>
              </div>

              {/* Circular Gallery */}
              <div className="flex-1 w-full relative flex items-center justify-center pt-24 pb-8">
                <div className="w-full h-full relative">
                  <CircularGallery 
                    items={galleryItems}
                    bend={1}
                    textColor="#ffffff"
                    borderRadius={0.05}
                    scrollSpeed={2}
                    scrollEase={0.1}
                    onScroll={setScrollProgress}
                  />
                </div>
              </div>

              {/* 时间轴 SVG */}
              <div className="w-full max-w-5xl mx-auto px-20 pb-10">
                <div className="relative h-24">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100">
                    <path 
                      d="M 50 80 Q 500 20 950 80" 
                      fill="none" 
                      stroke="rgba(59, 130, 246, 0.2)" 
                      strokeWidth="1" 
                    />
                    
                    {galleryItems.map((item, idx) => {
                      const total = galleryItems.length;
                      const normalizedProgress = ((scrollProgress % 1) + 1) % 1;
                      let t = (idx / total - normalizedProgress);
                      
                      if (t < -0.5) t += 1;
                      if (t > 0.5) t -= 1;
                      
                      const curveT = t + 0.5;
                      const x = 50 + curveT * 900;
                      const y = 80 * (1-curveT)**2 + 20 * 2 * (1-curveT) * curveT + 80 * curveT**2;
                      
                      const distFromCenter = Math.abs(t);
                      const focusIntensity = Math.max(0, 1 - distFromCenter / 0.12);
                      const isActive = distFromCenter < 0.035;

                      return (
                        <g key={item.id}>
                          <AnimatePresence>
                            {isActive && (
                              <motion.circle
                                initial={{ r: 8, opacity: 0.5 }}
                                animate={{ r: 30, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                cx={x} cy={y}
                                fill="#3b82f6"
                              />
                            )}
                          </AnimatePresence>

                          <motion.circle 
                            animate={{ 
                              r: isActive ? 12 : 5, 
                              fill: isActive ? "#1e40af" : "#3b82f6", 
                              stroke: isActive ? "#60a5fa" : "rgba(255,255,255,0.1)",
                              strokeWidth: isActive ? 3 : 0,
                              opacity: 0.4 + focusIntensity * 0.6 
                            }} 
                            cx={x} cy={y} 
                          />

                          <motion.g
                            animate={{ 
                              y: isActive ? y + 50 : y + 40, 
                              opacity: focusIntensity, 
                              scale: isActive ? 1.2 : 1 
                            }}
                          >
                            <motion.text 
                              x={x} 
                              textAnchor="middle" 
                              fill={isActive ? "#60a5fa" : "white"}
                              className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none transition-colors",
                                isActive ? "fill-blue-400" : "fill-white/40"
                              )}
                            >
                              {item.date}
                            </motion.text>
                          </motion.g>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

