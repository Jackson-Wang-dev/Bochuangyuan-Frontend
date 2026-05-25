import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Edit3 } from 'lucide-react';
import { BusinessPlan } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: BusinessPlan | { title: string; id: string } | null;
  onEdit?: () => void;
}

export const BPPreviewModal: React.FC<Props> = ({ isOpen, onClose, plan, onEdit }) => {
  if (!isOpen || !plan) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-slate-50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-20 shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-brand-blue">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{plan.title}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Size: 4.2 MB · Type: PDF</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 custom-scrollbar">
             {/* Simulated Document Pages */}
             {[1, 2, 3].map(i => (
                <div key={i} className="mx-auto w-full max-w-[800px] bg-white shadow-xl rounded-lg border border-slate-200 flex flex-col p-8 md:p-20 space-y-10">
                   <div className="h-8 bg-slate-50 rounded w-1/3" />
                   <div className="space-y-4">
                      <div className="h-4 bg-slate-50 rounded w-full" />
                      <div className="h-4 bg-slate-50 rounded w-full" />
                      <div className="h-4 bg-slate-50 rounded w-2/3" />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="h-40 bg-slate-50 rounded-xl" />
                      <div className="h-40 bg-slate-50 rounded-xl" />
                   </div>
                </div>
             ))}
          </div>

          {/* Footer Bar (Only if onEdit is provided) */}
          {onEdit && (
            <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-center z-20 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <button 
                  onClick={onEdit}
                  className="flex items-center gap-2 px-12 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  在线编辑
                </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
