import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  FileText, 
  Edit3, 
  Eye, 
  Sparkles, 
  AlertCircle, 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  GitBranch,
  Settings2,
  Lock,
  Upload
} from 'lucide-react';
import { Project, BusinessPlan } from '../types';
import { cn } from '../lib/utils';

import { BPPreviewModal } from './BPPreviewModal';

interface Props {
  project: Project;
  onBack: () => void;
  onEditBP: (plan: BusinessPlan) => void;
  onReupload: () => void;
}

export const ProjectDetails: React.FC<Props> = ({ project, onBack, onEditBP, onReupload }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  const [activeStep, setActiveStep] = useState('正式报名');

  const steps = [
    { id: 'pre', name: '预报名', icon: GitBranch },
    { id: 'formal', name: '正式报名', icon: Edit3 },
    { id: 'preliminary', name: '初赛', icon: GitBranch },
    { id: 'semifinal', name: '复赛', icon: Settings2 },
  ];

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAIScanning, setIsAIScanning] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [typedInsights, setTypedInsights] = useState<string[]>([]);
  
  const insights = [
    "项目在【核心研发投入】维度得分较高，建议在 BP 中进一步强化专利护城河的描述。",
    "市场竞争分析部分略显薄弱，AI 检测到竞对 A 最近完成了 C 轮融资，建议更新对标数据。",
    "现金流预测过于乐观，建议增加 15% 的冗余预算以应对供应链波动风险。"
  ];

  const handleGetAIAdvice = () => {
    setIsAIScanning(true);
    setTypedInsights([]);
    setShowAIInsights(false);
    
    setTimeout(() => {
        setIsAIScanning(false);
        setShowAIInsights(true);
        
        // Character-by-character effect for all insights
        let currentInsightIdx = 0;
        let currentCharIdx = 0;
        const tempInsights = insights.map(() => "");
        setTypedInsights(tempInsights);

        const typeNextChar = () => {
          if (currentInsightIdx < insights.length) {
            const fullText = insights[currentInsightIdx];
            if (currentCharIdx < fullText.length) {
              tempInsights[currentInsightIdx] = fullText.slice(0, currentCharIdx + 1);
              setTypedInsights([...tempInsights]);
              currentCharIdx++;
              setTimeout(typeNextChar, 15); // Fast typing
            } else {
              currentInsightIdx++;
              currentCharIdx = 0;
              setTimeout(typeNextChar, 200); // Small pause between blocks
            }
          }
        };

        setTimeout(typeNextChar, 100);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all hover:text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {/* Breadcrumbs moved to header */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              项目管理
            </button>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-900">项目详情</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Laser Scanner Effect - Restricted to main content area overlay */}
        <AnimatePresence>
            {isAIScanning && (
                <motion.div 
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    className="absolute left-0 right-[320px] h-1.5 bg-brand-blue z-[30] shadow-[0_0_25px_rgba(37,99,235,0.7)] pointer-events-none"
                />
            )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* Node Switcher (Stepper) */}
            <div className="w-full bg-white rounded-2xl border border-slate-100 p-8 mb-8">
                <div className="max-w-4xl mx-auto relative">
                    {/* Connecting Lines */}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-[22px] z-0" />
                    <div 
                      className="absolute top-1/2 left-0 h-[2px] bg-brand-blue -translate-y-[22px] z-0 transition-all duration-500" 
                      style={{ 
                        width: activeStep === '预报名' ? '0%' : 
                               activeStep === '正式报名' ? '33.3%' : 
                               activeStep === '初赛' ? '66.6%' : '100%' 
                      }}
                    />
                    
                    <div className="flex justify-between items-center relative z-10">
                        {steps.map((step) => {
                          const isActive = activeStep === step.name;
                          const StepIcon = step.icon;
                          
                          return (
                            <button 
                              key={step.id}
                              onClick={() => setActiveStep(step.name)}
                              className="flex flex-col items-center gap-3 group outline-none"
                            >
                                <div className={cn(
                                  "w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-white relative",
                                  isActive 
                                    ? "border-brand-blue text-brand-blue scale-110 shadow-lg shadow-blue-500/20" 
                                    : "border-slate-100 text-slate-400 hover:border-slate-300"
                                )}>
                                    {isActive && (
                                      <div className="absolute inset-0 bg-brand-blue/10 rounded-full blur-xl animate-pulse" />
                                    )}
                                    <StepIcon className={cn("w-6 h-6 relative z-10", isActive ? "text-brand-blue" : "text-slate-400")} />
                                </div>
                                <span className={cn(
                                  "text-sm font-bold transition-colors",
                                  isActive ? "text-brand-blue" : "text-slate-400 group-hover:text-slate-600"
                                )}>
                                  {step.name}
                                </span>
                            </button>
                          );
                        })}
                    </div>
                </div>
            </div>

            {activeStep === '正式报名' ? (
              <div className="space-y-10">
                {/* Title moved to main content area */}
                <div className="flex flex-col gap-1 mb-2">
                    <h2 className="text-2xl font-black text-slate-900">参赛项目信息</h2>
                    <p className="text-xs text-slate-400 font-mono">Project ID: {project.id}</p>
                </div>

                {/* Section: BP Attachment (Primary) */}
                <section className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">商业计划书</h3>
                </div>
                
                <div className="relative group w-full">
                    <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-6 flex items-center gap-6 transition-all">
                        <div className="w-20 h-24 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 shrink-0">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600">DOCX</span>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <h5 className="font-bold text-slate-800">商业计划书_2024.docx</h5>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">安全已验证</span>
                            </div>
                            <div className="flex items-center gap-6 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold">2.4 MB</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold">2024-05-24 14:30</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                        <button 
                            onClick={() => setIsPreviewOpen(true)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:text-brand-blue transition-all shadow-xl active:scale-95",
                                project.status !== 'pending' && "px-12"
                            )}
                        >
                            <Eye className="w-4 h-4" />
                            预览内容
                        </button>
                        {project.status === 'pending' && (
                            <button 
                                onClick={onReupload}
                                className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white border border-brand-blue/20 rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-all shadow-xl active:scale-95"
                            >
                                <Upload className="w-4 h-4" />
                                重新上传
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Section: Personal Info */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lock className="w-8 h-8 text-slate-400" />
                 </div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">个人基本信息</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <EditableInfoItem label="姓名 (必填)" defaultValue="张嘉诚" />
                    <EditableInfoItem label="最高学历 (必填)" value="博士" isSelect options={['本科', '硕士', '博士']} />
                    <EditableInfoItem label="现工作单位 (必填)" defaultValue="博创科技实验室" />
                    <EditableInfoItem label="现工作单位职务 (必填)" defaultValue="创始人 / 项目主理人" />
                    <div className="col-span-full">
                        <EditableInfoItem label="电子邮箱 (必填)" defaultValue="jiacheng.zhang@bochuang.com" />
                    </div>
                 </div>
            </section>

            {/* Section: Enterprise Info */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lock className="w-8 h-8 text-slate-400" />
                 </div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">企业与意向信息</h3>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">是否已创办企业</label>
                        <div className="flex gap-6 mt-1">
                            {['是', '否'].map(opt => (
                                <div key={opt} className="flex items-center gap-2 opacity-80">
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                        opt === '是' ? "border-brand-blue" : "border-slate-200"
                                    )}>
                                        {opt === '是' && <div className="w-2 h-2 bg-brand-blue rounded-full" />}
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <EditableInfoItem label="注册企业名称 (若选择“是”)" defaultValue="博创科技发展有限公司" />
                    <EditableInfoItem label="意向落地地区 (必填)" value="上海市" isSelect options={['上海市', '北京市', '深圳市', '杭州市']} />
                 </div>
            </section>

            {/* Section: Project Details */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lock className="w-8 h-8 text-slate-400" />
                 </div>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">项目详情</h3>
                 </div>
                 <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">项目名称 (必填)</label>
                        <div className="w-full text-sm font-bold text-slate-800 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                            {project.name}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">项目介绍 (必填)</label>
                        <div className="w-full text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-xl border border-slate-100/50 min-h-[150px] whitespace-pre-wrap">
                            {"本项目基于深度学习的城市交通流量预测与优化 system，通过实时监控摄像头数据，动态调整交通信号灯时长。核心技术包括：\n- 实时多目标检测与轨迹追踪算法\n- 基于强化学习的红绿灯配时优化模型\n- 分布式交通云感知控制平台"}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">团队介绍</label>
                        <div className="w-full text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-xl border border-slate-100/50 min-h-[100px] whitespace-pre-wrap">
                            {"核心团队由 3 名清华大学博士组成，曾在大疆创新、商汤科技等头部 AI 公司担任核心算法工程师，拥有多项计算机视觉专利。"}
                        </div>
                    </div>
                 </div>
            </section>

            {/* Section: Security */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">安全验证</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EditableInfoItem label="手机号码" defaultValue="138****8888" />
                    <div className="space-y-2 opacity-50 pointer-events-none">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">验证状态</label>
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100 italic">
                            <CheckCircle2 className="w-4 h-4" />
                            已通过实名手机核验
                        </div>
                    </div>
                 </div>
            </section>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed"
              >
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 bg-slate-100 rounded-full animate-ping opacity-10" />
                  <FileText className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{activeStep}节点</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs text-center leading-relaxed">
                  该阶段的数据尚未开始收集或已归档，请在“正式报名”阶段查看当前项目状态。
                </p>
                <button 
                  onClick={() => setActiveStep('正式报名')}
                  className="mt-8 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                >
                  返回正式报名
                </button>
              </motion.div>
            )}
        </div>

        {/* AI Insight Sidebar */}
        <aside className="w-80 bg-white border-l border-slate-100 shrink-0 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-slate-50">
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full w-fit mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">AI 创业助理</span>
             </div>
             <h3 className="text-lg font-bold text-slate-800">深度诊断建议</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
             {!showAIInsights && !isAIScanning && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Loader2 className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-400 px-4">AI 尚未对该项目进行深度建模分析</p>
                    <button 
                        onClick={handleGetAIAdvice}
                        className="px-8 py-3 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-brand-blue/90 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        获取 AI 建议
                    </button>
                </div>
             )}

             {isAIScanning && (
                <div className="space-y-8 animate-pulse pt-12">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-1/3" />
                        <div className="h-20 bg-slate-50 rounded-2xl" />
                     </div>
                   ))}
                </div>
             )}

             {showAIInsights && (
                <div className="space-y-6">
                   {/* Risk Alert */}
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3"
                   >
                      <div className="flex items-center gap-2 text-blue-700">
                         <AlertCircle className="w-4 h-4" />
                         <span className="text-xs font-bold uppercase tracking-wider">Risk Alert</span>
                      </div>
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">
                        您的【财务模型】中运营成本预估偏差 12%，已命中高风险预警。
                      </p>
                   </motion.div>

                   {/* Growth Insights */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Growth Insights</span>
                        </div>
                      </div>
                      
                      {typedInsights.map((text, idx) => (
                        <motion.div 
                           key={idx}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="p-5 relative rounded-2xl overflow-hidden group border border-blue-100/30"
                        >
                           {/* Aurora Background Effect */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/20 via-white to-blue-50/20 z-0" />
                           <div className="relative z-10 flex gap-3">
                              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                                 <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                {text}
                              </p>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </aside>
      </div>

      <BPPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        plan={{ id: 'mock-bp-1', title: '项目申报商业计划书 (BP).v3' }}
        onEdit={project.status === 'pending' ? () => {
          setIsPreviewOpen(false);
          // Assuming the mock plan matches one in App.tsx for editing
          onEditBP({ id: 'mock-bp-1', title: '项目申报商业计划书 (BP).v3', lastModified: '2024-05-24' });
        } : undefined}
      />
    </div>
  );
};

interface EditableInfoItemProps {
  label: string;
  value?: string;
  defaultValue?: string;
  isSelect?: boolean;
  options?: string[];
}

const EditableInfoItem: React.FC<EditableInfoItemProps> = ({ label, value, defaultValue }) => (
  <div className="space-y-2 group/item">
    <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <span className="text-[9px] font-bold text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity">已锁定</span>
    </div>
    <div className="w-full bg-slate-50/50 border border-slate-100/50 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 group-hover/item:text-slate-800 transition-colors">
        {value || defaultValue}
    </div>
  </div>
);
