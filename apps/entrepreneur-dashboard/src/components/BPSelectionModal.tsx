import React, { useState } from 'react';
import { X, FileText, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessPlan } from '../types';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plans: BusinessPlan[];
  onSelect: (plan: BusinessPlan) => void;
}

export const BPSelectionModal: React.FC<Props> = ({ isOpen, onClose, plans, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const plan = plans.find(p => p.id === selectedId);
    if (plan) {
      onSelect(plan);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
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
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">选择在线 BP</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Grid Content */}
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedId(plan.id)}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 transition-all cursor-pointer group",
                    selectedId === plan.id 
                      ? "border-brand-blue bg-brand-blue/[0.03]" 
                      : "border-slate-100 hover:border-brand-blue/30"
                  )}
                >
                  {selectedId === plan.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors",
                    selectedId === plan.id ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-400 group-hover:bg-brand-blue/10"
                  )}>
                    <FileText className="w-6 h-6" />
                  </div>

                  <h3 className="font-bold text-slate-800 mb-2 truncate">{plan.title}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>2024-05-08 {plan.lastModified}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
            >
              取消
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!selectedId}
              className="px-8 py-2.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              确认选择
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
