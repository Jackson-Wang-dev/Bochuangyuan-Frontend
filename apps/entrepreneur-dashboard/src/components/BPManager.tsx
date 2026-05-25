import React from 'react';
import { Plus, Upload, MoreHorizontal, FileText, Search, Clock, Link, CheckCircle2 } from 'lucide-react';
import { BusinessPlan } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  plans: BusinessPlan[];
  onCreateNew: () => void;
  onEdit: (plan: BusinessPlan) => void;
  onPreview: (plan: BusinessPlan) => void;
}

export const BPManager: React.FC<Props> = ({ plans, onCreateNew, onEdit, onPreview }) => {
  const [members, setMembers] = React.useState([
    { id: '1', name: '王发', role: '创建人', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '2', name: '陆小凤', role: '协作员', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop' },
    { id: '3', name: '司空摘星', role: '协作员', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop' },
  ]);
  const [activePlanId, setActivePlanId] = React.useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://bochuang.com/bp/share/129381');
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6 relative">
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
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="请输入您想搜索的内容" 
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all focus:border-brand-blue/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-blue/90 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            新建BP
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-blue text-brand-blue rounded-lg text-sm font-bold hover:bg-brand-blue/5 transition-all cursor-pointer active:scale-95">
            <Upload className="w-4 h-4" />
            导入
            <input type="file" className="hidden" onChange={(e) => alert('已选择文件：' + e.target.files?.[0]?.name)} />
          </label>
        </div>
      </div>

      {/* BP Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl transition-all group overflow-visible relative">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-brand-blue">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{plan.title}</h3>
              </div>
              <div className="relative group/menu">
                <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {/* Dropdown Menu - Anchored left to expand towards the right */}
                <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 py-1 overflow-hidden">
                  <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors">删除</button>
                  <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">导出为word</button>
                  <button className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">导出为pdf</button>
                  <div className="h-[1px] bg-slate-50 my-1" />
                  <button 
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2 text-[11px] font-bold text-brand-blue hover:bg-brand-blue/5 transition-colors flex items-center justify-between"
                  >
                    分享链接
                    <Link className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-5 pb-5 space-y-4">
              <div className="aspect-[1.4/1] bg-slate-50/50 rounded-xl border border-slate-100 p-6 relative overflow-hidden flex flex-col items-center justify-center">
                {/* Dummy content lines */}
                <div className="w-full space-y-1.5 opacity-10">
                   <div className="h-1 bg-slate-400 rounded w-1/4" />
                   <div className="h-1 bg-slate-400 rounded w-full" />
                   <div className="h-1 bg-slate-400 rounded w-full" />
                   <div className="h-1 bg-slate-400 rounded w-3/4" />
                </div>
                
                <button 
                  onClick={() => onPreview(plan)}
                  className="absolute px-5 py-2 bg-white shadow-lg shadow-blue-500/5 rounded-full text-[11px] font-bold text-brand-blue hover:scale-105 transition-all z-10"
                >
                  预览内容
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                   <Clock className="w-3 h-3" />
                   <span>修改于 {plan.lastModified}</span>
                </div>
                
                {/* Members Avatars - Interactive Position */}
                <div className="relative">
                  <div 
                    onClick={() => setActivePlanId(activePlanId === plan.id ? null : plan.id)}
                    className="flex -space-x-2 cursor-pointer hover:scale-105 transition-transform"
                  >
                    {members.slice(0, 3).map((member) => (
                      <div key={member.id} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                      </div>
                    ))}
                    {members.length > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">
                        +{members.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Member Management Popover */}
                  {activePlanId === plan.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setActivePlanId(null)} />
                      <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-40 p-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-black text-slate-800">成员管理</h4>
                          <button className="p-1 hover:bg-slate-50 rounded text-brand-blue">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between group/row">
                              <div className="flex items-center gap-2">
                                <img src={member.avatar} className="w-6 h-6 rounded-lg object-cover" alt={member.name} />
                                <div>
                                  <p className="text-[10px] font-bold text-slate-800">{member.name}</p>
                                  <p className="text-[8px] text-slate-400">{member.role}</p>
                                </div>
                              </div>
                              {member.role !== '创建人' && (
                                <button 
                                  onClick={() => removeMember(member.id)}
                                  className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all opacity-0 group-hover/row:opacity-100"
                                >
                                  <Plus className="w-3 h-3 rotate-45" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button 
                  onClick={() => onEdit(plan)}
                  className="w-full py-2 bg-brand-blue text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                >
                  编辑
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Placeholder for empty state expansion */}
        {plans.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
             <FileText className="w-12 h-12 mb-4 opacity-50" />
             <p className="font-bold">暂无商业计划书</p>
             <button onClick={onCreateNew} className="mt-4 text-brand-blue text-sm font-bold hover:underline">点击立即创建</button>
          </div>
        )}
      </div>
    </div>
  );
};
