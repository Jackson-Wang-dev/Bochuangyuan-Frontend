import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BPSelectionModal } from './BPSelectionModal';
import { BusinessPlan } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onlinePlans: BusinessPlan[];
}

export const ProjectFormModal: React.FC<Props> = ({ isOpen, onClose, onlinePlans }) => {
  const [isBPModalOpen, setIsBPModalOpen] = useState(false);
  const [selectedBP, setSelectedBP] = useState<BusinessPlan | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    education: '本科',
    company: '',
    role: '',
    email: '',
    hasEnterprise: '否',
    enterpriseName: '',
    targetArea: '上海市',
    projectName: '',
    projectDesc: '',
    teamDesc: '',
    phone: '',
    code: ''
  });

  useEffect(() => {
    if (selectedBP) {
        setIsAnalyzing(true);
        // Simulate AI analysis delay
        const timer = setTimeout(() => {
            setIsAnalyzing(false);
            setFormData({
                ...formData,
                projectName: selectedBP.title,
                projectDesc: selectedBP.previewText || '基于深度学习的城市交通流量预测与优化系统，通过实时监控摄像头数据，动态调整交通信号灯时长，旨在提升通行效率 30% 以上，降低碳排放。',
                teamDesc: '核心团队由 3 名清华大学博士组成，拥有多项计算机视觉专利。',
                name: '张嘉诚',
                company: '博创科技实验室',
                role: '创始人 / 项目主理人',
                email: 'jiacheng.zhang@bochuang.com'
            });
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [selectedBP]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto custom-scrollbar flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-slate-800">新建项目申请表</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-8 space-y-12">
            {/* AI Auto Fill */}
            <section className="space-y-4">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full w-fit">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">AI 智能识别</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">上传商业计划书 (BP) 自动填表 (推荐)</h3>
                    <p className="text-sm text-slate-500">系统将通过 AI 技术识别您的 BP 文件内容并自动填充下方表单项</p>
                  </div>
                  <button 
                    onClick={() => setIsBPModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue/5 text-brand-blue border border-brand-blue/20 rounded-lg text-sm font-bold hover:bg-brand-blue/10 transition-all shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    选择在线 BP
                  </button>
               </div>
               
               <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-brand-blue/30 transition-all cursor-pointer group">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center text-center">
                        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                        <p className="font-bold text-slate-800">正在解析 BP 内容...</p>
                        <p className="text-xs text-slate-400 mt-2">预计还需要 2 秒</p>
                    </div>
                  ) : selectedBP ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
                            <FileText className="w-8 h-8" />
                        </div>
                        <p className="font-bold text-slate-800 text-lg">已关联：{selectedBP.title}</p>
                        <p className="text-xs text-emerald-500 font-bold mt-1 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI 已为您自动填充表单内容
                        </p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedBP(null); }}
                            className="mt-4 text-rose-500 text-xs font-bold hover:underline"
                        >
                            移除关联
                        </button>
                    </div>
                  ) : (
                    <>
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-brand-blue">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-800">点击或将文件拖拽至此上传</p>
                        <p className="text-xs text-slate-400 mt-2">支持 PDF / PPT / Word 格式</p>
                        <div className="flex gap-6 mt-8 text-center justify-center">
                            {['深度语义分析', '3秒内极速识别', '安全加密传输'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/40" />
                                {item}
                            </div>
                            ))}
                        </div>
                    </>
                  )}
               </div>
            </section>

            {/* Form Sections */}
            <div className="space-y-10">
               {/* Section: Personal Info */}
               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h4 className="font-bold text-slate-800">个人基本信息</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">姓名 <span className="text-rose-500">*</span></label>
                       <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="请输入真实姓名" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">最高学历 <span className="text-rose-500">*</span></label>
                       <select 
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30"
                       >
                          <option>本科</option>
                          <option>硕士</option>
                          <option>博士</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">现工作单位 <span className="text-rose-500">*</span></label>
                       <input 
                        type="text" 
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        placeholder="全称, 例如: XX科技有限公司" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">现工作单位职务 <span className="text-rose-500">*</span></label>
                       <input 
                        type="text" 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        placeholder="例如: 首席执行官 / 研发总监" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30" 
                       />
                    </div>
                    <div className="col-span-full space-y-2">
                       <label className="text-xs font-bold text-slate-600">电子邮箱 <span className="text-rose-500">*</span></label>
                       <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="example@domain.com" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30" 
                       />
                    </div>
                 </div>
               </div>

               {/* Section: Enterprise Info */}
               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h4 className="font-bold text-slate-800">企业与意向信息</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">是否已创办企业 <span className="text-rose-500">*</span></label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="enterprise" 
                                    checked={formData.hasEnterprise === '是'}
                                    onChange={() => setFormData({...formData, hasEnterprise: '是'})}
                                    className="text-brand-blue focus:ring-brand-blue" 
                                />
                                <span className="text-sm">是</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="enterprise" 
                                    checked={formData.hasEnterprise === '否'}
                                    onChange={() => setFormData({...formData, hasEnterprise: '否'})}
                                    className="text-brand-blue focus:ring-brand-blue" 
                                />
                                <span className="text-sm">否</span>
                            </label>
                        </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">注册企业名称 (若选择“是”)</label>
                       <input 
                        type="text" 
                        value={formData.enterpriseName}
                        onChange={(e) => setFormData({...formData, enterpriseName: e.target.value})}
                        placeholder="请输入已注册企业完整名称" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">意向落地地区 <span className="text-rose-500">*</span></label>
                       <select 
                        value={formData.targetArea}
                        onChange={(e) => setFormData({...formData, targetArea: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30"
                       >
                          <option>请选择意向落地省份/城市</option>
                          <option>上海市</option>
                          <option>北京市</option>
                          <option>深圳市</option>
                          <option>杭州市</option>
                       </select>
                    </div>
                 </div>
               </div>

               {/* Section: Project Details */}
               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h4 className="font-bold text-slate-800">项目详情</h4>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">项目名称 <span className="text-rose-500">*</span></label>
                       <input 
                        type="text" 
                        value={formData.projectName}
                        onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                        placeholder="简洁明了的项目标题" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all focus:border-brand-blue/30 font-bold" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">项目介绍 <span className="text-rose-500">*</span></label>
                       <textarea 
                        rows={4} 
                        value={formData.projectDesc}
                        onChange={(e) => setFormData({...formData, projectDesc: e.target.value})}
                        placeholder="请简要描述项目的核心技术、市场痛点及解决方案 (建议300字以内)" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none transition-all focus:border-brand-blue/30 leading-relaxed" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-600">团队介绍</label>
                       <textarea 
                        rows={3} 
                        value={formData.teamDesc}
                        onChange={(e) => setFormData({...formData, teamDesc: e.target.value})}
                        placeholder="介绍核心成员背景及团队优势 (可选)" 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none resize-none transition-all focus:border-brand-blue/30 leading-relaxed" 
                       />
                    </div>
                 </div>
               </div>

               {/* Section: Security */}
               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-brand-blue rounded-full" />
                    <h4 className="font-bold text-slate-800">安全验证</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-2">
                        <div className="w-20 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-500">+86</div>
                        <input 
                            type="text" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="请输入手机号码" 
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none border-brand-blue/10" 
                        />
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            placeholder="6位数字" 
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none border-brand-blue/10" 
                        />
                        <button className="px-4 py-3 border border-brand-blue text-brand-blue rounded-xl text-xs font-bold hover:bg-brand-blue/5 transition-all whitespace-nowrap">获取验证码</button>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 flex justify-end gap-4 sticky bottom-0 bg-white">
            <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">取消</button>
            <button className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-brand-blue/90 transition-all">提交申请</button>
          </div>
        </motion.div>

        {/* BP Selection Sub-Modal */}
        <BPSelectionModal 
            isOpen={isBPModalOpen}
            onClose={() => setIsBPModalOpen(false)}
            plans={onlinePlans}
            onSelect={(plan) => setSelectedBP(plan)}
        />
      </div>
    </AnimatePresence>
  );
};
