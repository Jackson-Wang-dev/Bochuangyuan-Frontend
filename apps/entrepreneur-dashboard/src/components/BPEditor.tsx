import React, { useState } from 'react';
import { 
  ChevronLeft, LayoutPanelLeft, Share2, Bell, User, 
  Search, MessageSquare, Plus, Undo2, Redo2, 
  Type, Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Image as ImageIcon, Sparkles, Send, X,
  Trash2, Copy, CheckCircle2
} from 'lucide-react';
import { BusinessPlan } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  plan: BusinessPlan | null;
  onClose: () => void;
}

const OUTLINE = [
  '1. 项目摘要',
  '2. 产品/服务介绍',
  '3. 行业与市场分析',
  '4. 竞争分析',
  '5. 现有基础',
  '6. 商业模式',
  '7. 未来5年发展规划',
  '8. 财务预测',
  '9. 融资需求计划'
];

export const BPEditor: React.FC<Props> = ({ plan, onClose }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [aiChat, setAiChat] = useState('');
  const [members, setMembers] = useState([
    { id: '1', name: '王发', role: '创建人', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '2', name: '陆小凤', role: '协作员', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '3', name: '司空摘星', role: '协作员', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '4', name: '花满楼', role: '观察员', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100&h=100&auto=format&fit=crop' },
  ]);
  const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleShare = () => {
    navigator.clipboard.writeText('https://bochuang.com/bp/share/129381');
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col"
    >
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
      {/* Top Standard Toolbar */}
      <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-xl transition-all active:scale-95 group">
            <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="w-[1px] h-8 bg-slate-200 mx-2" />
          <button className="p-3 hover:bg-slate-100 rounded-xl transition-all">
            <LayoutPanelLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex flex-col ml-4">
            <span className="text-lg font-black text-slate-800 leading-tight">{plan?.title || '新商业计划书'}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">商业计划书编辑模式</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Project Members Section - Common design pattern: top right header */}
          <div className="flex items-center -space-x-3 relative">
            {members.slice(0, 3).map((member) => (
              <div 
                key={member.id} 
                className="w-10 h-10 rounded-full border-4 border-white overflow-hidden shadow-sm relative group cursor-pointer"
                title={member.name}
              >
                <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
              </div>
            ))}
            {members.length > 3 && (
              <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm cursor-pointer hover:bg-slate-200 transition-colors">
                +{members.length - 3}
              </div>
            )}
            
            {/* Management Trigger */}
            <button 
              onClick={() => setIsMemberMenuOpen(!isMemberMenuOpen)}
              className="ml-6 flex items-center gap-2 text-slate-400 hover:text-brand-blue transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <User className="w-4 h-4" />
              <span className="text-xs font-bold">成员管理</span>
            </button>

            {/* Member Management Popover */}
            <AnimatePresence>
              {isMemberMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMemberMenuOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 p-5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black text-slate-800">项目成员 ({members.length})</h4>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg text-brand-blue transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden glass-card">
                              <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{member.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{member.role}</p>
                            </div>
                          </div>
                          {member.role !== '创建人' && (
                            <button 
                              onClick={() => removeMember(member.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-50">
                      <button 
                        onClick={handleShare}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        邀请新成员公开分享
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="w-[1px] h-8 bg-slate-200" />

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 active:scale-95 transition-all">
              <Sparkles className="w-4 h-4" />
              智能生成
            </button>
            <button className="p-3 text-slate-400 hover:text-brand-blue transition-colors rounded-xl hover:bg-slate-50 relative">
              <Bell className="w-6 h-6" />
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Outline Navigation */}
        <aside className="w-[360px] bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">导航</span>
                <Search className="w-4 h-4 text-slate-300" />
            </div>
            <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="搜索目录" 
                    className="w-full bg-slate-50 border-0 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-brand-blue/20"
                />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-blue bg-brand-blue/5 rounded-lg mb-4">
                <List className="w-4 h-4" />
                大纲
            </div>
            <div className="space-y-1">
              {OUTLINE.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSection(idx)}
                  className={cn(
                    "w-full text-left px-5 py-2.5 text-sm transition-colors rounded-lg flex items-center gap-2",
                    activeSection === idx 
                      ? "text-brand-blue font-bold bg-brand-blue/5" 
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full", activeSection === idx ? "bg-brand-blue" : "bg-transparent")} />
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 border-t border-slate-100">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-bold text-slate-600 transition-colors">
                <Plus className="w-4 h-4" />
                新建页面
            </button>
          </div>
        </aside>

        {/* Center: Editor Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col">
            {/* Rich Text Toolbar */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur shadow-sm border-b border-slate-200 px-4 py-2 flex items-center gap-1 shrink-0">
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Undo2 className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Redo2 className="w-4 h-4" /></button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                <button className="px-3 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-600 flex items-center gap-2">正文 <ChevronLeft className="w-3 h-3 rotate-270" /></button>
                <button className="px-3 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-600 ml-1">22</button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Bold className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Italic className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Underline className="w-4 h-4" /></button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><AlignLeft className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><AlignCenter className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><AlignRight className="w-4 h-4" /></button>
                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><ImageIcon className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Plus className="w-4 h-4" /></button>
                <div className="ml-auto flex items-center gap-3">
                   {/* Removed WPS AI Assistant button as requested */}
                </div>
            </div>

            <div className="p-12 flex justify-center">
                <div className="w-[1000px] bg-white shadow-2xl min-h-[1100px] p-24 space-y-12">
                   <section className="space-y-6">
                      <h1 className="text-4xl font-black tracking-tight text-slate-900">1.项目摘要</h1>
                      <div className="p-4 bg-brand-blue/5 rounded-xl border-l-4 border-brand-blue">
                         <p className="text-slate-600 leading-relaxed text-sm">
                            以本项目代表了我们下一财年的核心计划。通过利用先进的神经网络和高仿真数据处理，我们的目标是重新定义协同文档编辑领域。
                         </p>
                      </div>
                   </section>

                   <section className="space-y-6">
                      <h2 className="text-3xl font-black tracking-tight text-slate-800">2.产品/服务介绍</h2>
                      <p className="text-slate-500 italic text-sm">无缝跨平台集成，实现零延迟同步。</p>
                      <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium">
                         服务产品服务产品服务产品产品呢
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">
                         专为深度工作设计的直观界面，通过极简设计模式减少干扰。
                      </p>
                      <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-white/20" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        我们的市场进入策略专注于需要高安全性和可靠性标准的垂直领域高产团队。以下章节详细介绍了我们的分阶段推出计划和基础设施要求……
                      </p>
                   </section>
                </div>
            </div>
        </main>

        {/* Right Sidebar: AI Assistant */}
        <aside className="w-[480px] bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-brand-blue/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">小园</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">智能助手</p>
              </div>
            </div>
            <X className="w-5 h-5 text-slate-300 cursor-pointer" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
             <div className="flex gap-6 border-b border-slate-100">
                 <button className="pb-3 border-b-2 border-brand-blue text-sm font-black text-brand-blue px-4">AI 聊天</button>
             </div>

             <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        我已经分析了您的文档，您是否需要我引言生成摘要，或者为“领域”一词建议一些更专业的同义词？
                    </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-blue/30 transition-colors">
                    <p className="text-sm text-slate-400 italic">为第二段中的“领域”建议一些同义词。</p>
                    <MessageSquare className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition-colors" />
                </div>

                <div className="p-6 bg-brand-blue/[0.03] rounded-2xl border border-brand-blue/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-brand-blue text-white rounded-lg">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400">小园正在为您整理...</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">这里有一些替代方案：</p>
                    <ul className="space-y-3">
                        {['生态系统', '基础设施', '范畴'].map((word, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-brand-blue font-bold cursor-pointer hover:underline underline-offset-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                                {word}
                            </li>
                        ))}
                    </ul>
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-slate-100 space-y-4">
             <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors">
                  审核全文
                </button>
             </div>
             <div className="relative">
                <textarea 
                    value={aiChat}
                    onChange={(e) => setAiChat(e.target.value)}
                    placeholder="请提问或者输入要求" 
                    className="w-full bg-slate-50 border-0 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-brand-blue/20 min-h-[120px] resize-none"
                />
             </div>
          </div>
        </aside>
      </div>

      <button className="fixed bottom-8 right-8 w-12 h-12 bg-brand-blue text-white rounded-2xl shadow-2xl flex items-center justify-center z-50">
        <Sparkles className="w-6 h-6" />
      </button>
    </motion.div>
  );
};
