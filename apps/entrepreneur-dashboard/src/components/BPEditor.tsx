import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, LayoutPanelLeft, Share2, Bell, User,
  Search, MessageSquare, Plus, Undo2, Redo2,
  Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, List, Sparkles, X,
  Trash2, CheckCircle2, Save,
} from 'lucide-react';
import { BusinessPlan } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  plan: BusinessPlan | null;
  onClose: () => void;
  /** localStorage key suffix; if provided, content is saved/loaded locally */
  docId?: string;
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
  '9. 融资需求计划',
];

const DEFAULT_CONTENT = `
<h1 style="font-size:2rem;font-weight:900;margin-bottom:1.5rem">1. 项目摘要</h1>
<p style="line-height:1.8;color:#475569">在此填写项目摘要，简明扼要地描述项目的核心价值、目标市场和竞争优势。</p>

<h2 style="font-size:1.5rem;font-weight:800;margin-top:2.5rem;margin-bottom:1rem">2. 产品/服务介绍</h2>
<p style="line-height:1.8;color:#475569">详细描述您的产品或服务，包括技术方案、核心功能和差异化特点。</p>

<h2 style="font-size:1.5rem;font-weight:800;margin-top:2.5rem;margin-bottom:1rem">3. 行业与市场分析</h2>
<p style="line-height:1.8;color:#475569">分析目标市场规模、增长趋势和潜在客户群体。</p>

<h2 style="font-size:1.5rem;font-weight:800;margin-top:2.5rem;margin-bottom:1rem">4. 竞争分析</h2>
<p style="line-height:1.8;color:#475569">列举主要竞争对手，阐述本项目的核心竞争力。</p>

<h2 style="font-size:1.5rem;font-weight:800;margin-top:2.5rem;margin-bottom:1rem">5. 商业模式</h2>
<p style="line-height:1.8;color:#475569">说明盈利模式、收入来源和成本结构。</p>

<h2 style="font-size:1.5rem;font-weight:800;margin-top:2.5rem;margin-bottom:1rem">6. 融资需求计划</h2>
<p style="line-height:1.8;color:#475569">说明融资金额、用途分配和预期回报。</p>
`.trim();

const STORAGE_KEY = (docId: string) => `bcy-bp-${docId}`;

export const BPEditor: React.FC<Props> = ({ plan, onClose, docId }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [aiChat, setAiChat] = useState('');
  const [members, setMembers] = useState([
    { id: '1', name: '王发', role: '创建人', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '2', name: '陆小凤', role: '协作员', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '3', name: '司空摘星', role: '协作员', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop' },
  ]);
  const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  // Load saved content from localStorage on mount
  useEffect(() => {
    if (!editorRef.current) return;
    const saved = docId ? localStorage.getItem(STORAGE_KEY(docId)) : null;
    editorRef.current.innerHTML = saved ?? DEFAULT_CONTENT;
  }, [docId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = useCallback(() => {
    if (!docId || !editorRef.current) return;
    localStorage.setItem(STORAGE_KEY(docId), editorRef.current.innerHTML);
    showToast('已保存到本地');
  }, [docId]);

  // Ctrl/Cmd+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const removeMember = (id: string) => setMembers(members.filter(m => m.id !== id));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('链接已复制');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[1000] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Toolbar */}
      <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20 shadow-sm">
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              本地编辑模式 · Ctrl+S 保存
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center -space-x-3 relative">
            {members.slice(0, 3).map((member) => (
              <div key={member.id} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden shadow-sm cursor-pointer" title={member.name}>
                <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
              </div>
            ))}
            <button
              onClick={() => setIsMemberMenuOpen(!isMemberMenuOpen)}
              className="ml-6 flex items-center gap-2 text-slate-400 hover:text-brand-blue transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <User className="w-4 h-4" />
              <span className="text-xs font-bold">成员管理</span>
            </button>

            <AnimatePresence>
              {isMemberMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMemberMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 p-5"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black text-slate-800">项目成员 ({members.length})</h4>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg text-brand-blue"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <img src={member.avatar} className="w-10 h-10 rounded-xl object-cover" alt={member.name} />
                            <div>
                              <p className="text-sm font-bold text-slate-800">{member.name}</p>
                              <p className="text-[10px] text-slate-400">{member.role}</p>
                            </div>
                          </div>
                          {member.role !== '创建人' && (
                            <button onClick={() => removeMember(member.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-5 border-t border-slate-50">
                      <button onClick={handleShare} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
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
            {docId && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            )}
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
        {/* Left Sidebar: Outline */}
        <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="搜索目录" className="w-full bg-slate-50 border-0 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-brand-blue/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-blue bg-brand-blue/5 rounded-lg mb-2">
              <List className="w-4 h-4" />大纲
            </div>
            <div className="space-y-0.5">
              {OUTLINE.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSection(idx)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors rounded-lg flex items-center gap-2',
                    activeSection === idx ? 'text-brand-blue font-bold bg-brand-blue/5' : 'text-slate-500 hover:bg-slate-50',
                  )}
                >
                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', activeSection === idx ? 'bg-brand-blue' : 'bg-transparent')} />
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-bold text-slate-600 transition-colors">
              <Plus className="w-4 h-4" />新建页面
            </button>
          </div>
        </aside>

        {/* Center: Editable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col">
          {/* Formatting Toolbar */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm border-b border-slate-200 px-4 py-2 flex items-center gap-1 shrink-0">
            <button onClick={() => exec('undo')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Undo2 className="w-4 h-4" /></button>
            <button onClick={() => exec('redo')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Redo2 className="w-4 h-4" /></button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button onClick={() => exec('bold')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Bold className="w-4 h-4" /></button>
            <button onClick={() => exec('italic')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Italic className="w-4 h-4" /></button>
            <button onClick={() => exec('underline')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Underline className="w-4 h-4" /></button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button onClick={() => exec('justifyLeft')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><AlignLeft className="w-4 h-4" /></button>
            <button onClick={() => exec('justifyCenter')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><AlignCenter className="w-4 h-4" /></button>
            <button onClick={() => exec('justifyRight')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><AlignRight className="w-4 h-4" /></button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <button onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><List className="w-4 h-4" /></button>
            {docId && (
              <button onClick={handleSave} className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-bold transition-colors">
                <Save className="w-3.5 h-3.5" />
                保存
              </button>
            )}
          </div>

          <div className="p-12 flex justify-center">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              className="w-full max-w-[900px] bg-white shadow-2xl min-h-[1100px] p-24 outline-none focus:ring-0 text-slate-800 leading-relaxed"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
        </main>

        {/* Right Sidebar: AI Assistant */}
        <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0">
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

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                您好！我是小园，您的商业计划书 AI 助手。请在左侧文档区域直接输入内容，编辑完成后点击"保存"即可存储到本地。
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors">
                审核全文
              </button>
            </div>
            <textarea
              value={aiChat}
              onChange={(e) => setAiChat(e.target.value)}
              placeholder="请提问或者输入要求"
              className="w-full bg-slate-50 border-0 rounded-2xl p-5 text-sm focus:ring-1 focus:ring-brand-blue/20 min-h-[100px] resize-none"
            />
          </div>
        </aside>
      </div>

      <button className="fixed bottom-8 right-8 w-12 h-12 bg-brand-blue text-white rounded-2xl shadow-2xl flex items-center justify-center z-50">
        <Sparkles className="w-6 h-6" />
      </button>
    </motion.div>
  );
};
