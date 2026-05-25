/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileHeader } from './components/ProfileHeader';
import { GrowthTimeline } from './components/GrowthTimeline';
import { GrowthAnalytics } from './components/GrowthAnalytics';
import { PersonalityRadar } from './components/PersonalityRadar';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { ProjectFormModal } from './components/ProjectFormModal';
import { NotificationPopover } from './components/NotificationPopover';
import { AssessmentModal } from './components/AssessmentModal';
import { BPManager } from './components/BPManager';
import { BPEditor } from './components/BPEditor';
import { BPSelectionModal } from './components/BPSelectionModal';
import { ProjectDetails } from './components/ProjectDetails';
import { BPPreviewModal } from './components/BPPreviewModal';
import { ArchiveDashboard } from './components/ArchiveDashboard';
import { CompetitionDetail } from './components/CompetitionDetail';
import { UserProfileMenu } from './components/UserProfileMenu';
import { ProjectModule2 } from './components/ProjectModule2';
import { PersonalityData, TimelineEvent, GrowthDataPoint, Project, BusinessPlan } from './types';
import { User, TrendingUp, Search, Bell, Settings, MessageSquare, Briefcase, Calendar, LayoutDashboard, HelpCircle, ChevronDown, RefreshCw, Upload, Globe, Check, X as CloseIcon, FileText, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';

const PERSONALITY_DATA: PersonalityData[] = [
  { subject: '技术洞察', value: 95, fullMark: 100 },
  { subject: '市场直觉', value: 85, fullMark: 100 },
  { subject: '领导力', value: 90, fullMark: 100 },
  { subject: '风险意识', value: 75, fullMark: 100 },
  { subject: '创新能级', value: 92, fullMark: 100 },
];

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'ev-1',
    date: '2024-03-15',
    title: '高级合伙人认证',
    description: '成功通过博创网（BoChuang）高级合伙人层级考核，具备多项目管理与风控决策权。',
    type: 'certificate',
    icon: 'certificate'
  },
  {
    id: 'ev-2',
    date: '2023-11-20',
    title: '全国大学生创业大赛金奖',
    description: '主导的“AI+分布式算力”项目在万人重围中脱颖而出，获得年度最具创新潜力奖。',
    type: 'award',
    icon: 'award'
  },
  {
    id: 'ev-3',
    date: '2023-06-05',
    title: '首次获得天使轮融资',
    description: '通过Nexus平台对接，成功获得国内顶尖风投机构300万天使轮投资。',
    type: 'milestone',
    icon: 'milestone'
  },
];

const GROWTH_DATA: GrowthDataPoint[] = [
  { date: 'Jan', technical: 65, market: 40, health: 80, aiAdoption: 30, riskControl: 70 },
  { date: 'Feb', technical: 72, market: 48, health: 75, aiAdoption: 45, riskControl: 72 },
  { date: 'Mar', technical: 85, market: 60, health: 85, aiAdoption: 70, riskControl: 85 },
  { date: 'Apr', technical: 92, market: 75, health: 84, aiAdoption: 120, riskControl: 92 },
];

const PROJECTS: Project[] = [
  { id: 'prj-1', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-2', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-3', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-4', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'reviewing', bpLink: '#', remainingDays: 2 },
  { id: 'prj-5', name: '智能城市交通管理系统', competition: '2024 全国高校人工智能创新大赛', deadline: '2024-06-20', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-6', name: '虚拟现实数字孪生工厂', competition: '工业 4.0 数字化转型竞赛', deadline: '2024-05-30', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-7', name: '绿色能源监控平台', competition: '可持续发展科技创新奖', deadline: '2024-05-15', status: 'pending', bpLink: '#', remainingDays: 2 },
  { id: 'prj-8', name: '绿色能源监控平台', competition: '可持续发展科技创新奖', deadline: '2024-05-15', status: 'completed', bpLink: '#', remainingDays: 2 },
];

const BP_MOCKS: BusinessPlan[] = [
  {
    id: 'bp-1',
    title: '商业计划书1',
    lastModified: '15:21',
    previewText: '以本项目代表了我们下一财年的核心计划...',
    isLinked: true
  },
  {
    id: 'bp-2',
    title: '商业计划书1',
    lastModified: '昨日 10:30',
    previewText: '基于AI算法的城市交通疏导方案...',
    isLinked: false
  }
];

type ViewMode = 'cockpit' | 'bp_edit' | 'workspace' | 'project_details' | 'competition_detail' | 'project_module_2';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('cockpit');
  const [activeTab, setActiveTab] = useState<'profile' | 'growth'>('growth');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isReuploadOptionsOpen, setIsReuploadOptionsOpen] = useState(false);
  const [isOnlineBPSelectOpen, setIsOnlineBPSelectOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<BusinessPlan | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<BusinessPlan | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handlePreviewBP = (plan: BusinessPlan) => {
    setPreviewPlan(plan);
    setIsPreviewOpen(true);
  };

  const handleRegisterQuick = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleReuploadOnline = () => {
    setIsReuploadOptionsOpen(false);
    setIsOnlineBPSelectOpen(true);
  };

  const handleReuploadLocal = () => {
    setIsReuploadOptionsOpen(false);
    setIsProjectModalOpen(true); // Re-use the existing form for local upload
  };

  const handleCreateBP = () => {
    setCurrentPlan(null);
    setIsEditorOpen(true);
  };

  const handleEditBP = (plan: BusinessPlan) => {
    setCurrentPlan(plan);
    setIsEditorOpen(true);
    setActiveView('bp_edit');
  };

  const handleCreateProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleViewProject = (project: Project) => {
    setCurrentProject(project);
    setActiveView('project_details');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <AnimatePresence>
        {isProjectModalOpen && (
          <ProjectFormModal 
            key="project-modal"
            isOpen={isProjectModalOpen} 
            onClose={() => setIsProjectModalOpen(false)} 
            onlinePlans={BP_MOCKS}
          />
        )}
        {isEditorOpen && (
          <BPEditor 
            key="bp-editor"
            plan={currentPlan} 
            onClose={() => setIsEditorOpen(false)} 
          />
        )}
        {isAssessmentOpen && (
          <AssessmentModal 
            key="assessment-modal"
            isOpen={isAssessmentOpen} 
            onClose={() => setIsAssessmentOpen(false)} 
          />
        )}
        <BPPreviewModal 
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewPlan(null);
          }}
          plan={previewPlan}
        />

        {/* Reupload Flow Modals */}
        <ReuploadOptionsModal 
          key="reupload-options"
          isOpen={isReuploadOptionsOpen} 
          onClose={() => setIsReuploadOptionsOpen(false)} 
          onLocal={handleReuploadLocal}
          onOnline={handleReuploadOnline}
        />

        <BPSelectionModal 
          key="online-bp-select"
          isOpen={isOnlineBPSelectOpen} 
          onClose={() => setIsOnlineBPSelectOpen(false)} 
          plans={BP_MOCKS}
          onSelect={(plan) => {
            console.log('Selected plan for reupload:', plan);
            setIsOnlineBPSelectOpen(false);
            // In a real app, logic to associate this BP with the project would go here
          }}
        />
      </AnimatePresence>

      <AnimatePresence>
        {activeView === 'competition_detail' && (
          <CompetitionDetail 
            onBack={() => setActiveView('cockpit')} 
            onRegisterOfficial={() => setIsProjectModalOpen(true)}
            onRegisterQuick={handleRegisterQuick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[2000] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span>报名成功！</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Section (Header + Profile) */}
      <div className="relative bg-brand-blue pb-4">
        <nav className="flex items-center justify-between p-4 px-8 text-white w-full">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                  <div className="w-14 h-14 relative bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl group cursor-pointer overflow-hidden border border-white/20">
                       <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                       <div className="w-full h-full bg-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-black italic text-xl tracking-tighter">B</span>
                       </div>
                  </div>
                  <div className="flex flex-col">
                      <span className="font-bold text-2xl tracking-tighter leading-none text-white">博创网</span>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-8">
              <div className="flex items-center gap-6 relative">
                  <div className="relative">
                    <Bell 
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" 
                    />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-brand-blue" />
                    
                    <AnimatePresence>
                      {isNotificationOpen && (
                        <NotificationPopover isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex items-center gap-3 pl-6 border-l border-white/10 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop" 
                      className="w-8 h-8 rounded-xl border-2 border-white/20 shadow-sm cursor-pointer hover:scale-105 transition-all" 
                      alt="User" 
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    />
                    <ChevronDown className="w-4 h-4 text-white/40 cursor-pointer" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} />
                    
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <UserProfileMenu isOpen={isProfileMenuOpen} onClose={() => setIsProfileMenuOpen(false)} />
                      )}
                    </AnimatePresence>
                  </div>
              </div>
          </div>
        </nav>
      </div>

      <div className="flex-1 px-8 relative z-10 max-w-[1800px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-2 space-y-1">
                <button 
                    onClick={() => setActiveView('cockpit')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                        activeView === 'cockpit' 
                            ? "bg-brand-blue/10 text-brand-blue border-r-4 border-brand-blue" 
                            : "text-slate-500 hover:bg-white/50"
                    )}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>首页</span>
                </button>
                <button 
                    onClick={() => setActiveView('workspace')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                        activeView === 'workspace' 
                            ? "bg-brand-blue/10 text-brand-blue border-r-4 border-brand-blue" 
                            : "text-slate-500 hover:bg-white/50"
                    )}
                >
                    <Briefcase className="w-5 h-5" />
                    <span>项目管理</span>
                </button>
                <button 
                    onClick={() => setActiveView('bp_edit')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                        activeView === 'bp_edit' 
                            ? "bg-brand-blue/10 text-brand-blue border-r-4 border-brand-blue" 
                            : "text-slate-500 hover:bg-white/50"
                    )}
                >
                    <FileText className="w-5 h-5" />
                    <span>在线编辑BP</span>
                </button>
                <button 
                    onClick={() => setActiveView('project_module_2')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group",
                        activeView === 'project_module_2' 
                            ? "bg-amber-500/10 text-amber-600 border-r-4 border-amber-500" 
                            : "text-slate-500 hover:bg-white/50"
                    )}
                >
                    <div className="relative flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 3.93 3H2a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" fill="currentColor" fillOpacity="0.15" />
                      </svg>
                      <span className="absolute -top-1.5 -right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    </div>
                    <span>项目模块2</span>
                </button>
            </aside>

            {/* Content Body */}
            <main className="lg:col-span-10 min-h-[600px] pb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-full"
                    >
                        {activeView === 'cockpit' && (
                            <ArchiveDashboard 
                                timelineEvents={TIMELINE_EVENTS}
                                growthData={GROWTH_DATA}
                                personalityData={PERSONALITY_DATA}
                                onStartAssessment={() => setIsAssessmentOpen(true)}
                                onRegisterCompetition={() => setActiveView('competition_detail')}
                                onGoToBPEdit={() => setActiveView('bp_edit')}
                            />
                        )}

                                



                        {activeView === 'workspace' && (
                            <div className="space-y-8">
                                <section>
          <div className="flex items-center mb-6">
                                     <h2 className="text-xl font-bold text-slate-800">项目管理</h2>
                                  </div>
                                  <ProjectWorkspace 
                                    projects={PROJECTS} 
                                    onCreateNew={handleCreateProject}
                                    onViewDetails={handleViewProject}
                                  />
                                </section>
                            </div>
                        )}

                        {activeView === 'project_details' && currentProject && (
                            <ProjectDetails 
                                project={currentProject} 
                                onBack={() => setActiveView('workspace')}
                                onEditBP={handleEditBP}
                                onReupload={() => setIsReuploadOptionsOpen(true)}
                            />
                        )}

                        {activeView === 'bp_edit' && (
                            <BPManager 
                              plans={BP_MOCKS} 
                               onCreateNew={handleCreateBP}
                              onEdit={handleEditBP}
                              onPreview={handlePreviewBP}
                            />
                        )}

                        {activeView === 'project_module_2' && (
                            <ProjectModule2 />
                        )}
                    </motion.div>
                </AnimatePresence>

            </main>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-blue rounded-full flex items-center justify-center text-white shadow-2xl glow-blue z-50 overflow-hidden"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

// --- Reupload Flow Components ---

interface ReuploadOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocal: () => void;
  onOnline: () => void;
}

const ReuploadOptionsModal: React.FC<ReuploadOptionsModalProps> = ({ isOpen, onClose, onLocal, onOnline }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
        >
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-lg font-bold text-slate-800">重新上传</h3>
            <p className="text-sm text-slate-400">请选择您的 BP 来源</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={onLocal}
              className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-brand-blue/30 hover:bg-white transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">本地文件上传</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Local Device</p>
              </div>
            </button>
            <button 
              onClick={onOnline}
              className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-brand-blue/30 hover:bg-white transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">在线 BP 选择</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cloud Space</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

