import React from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, Milestone, Plus } from 'lucide-react';
import { TimelineEvent } from '../types';
import { cn } from '../lib/utils';

interface Props {
  events: TimelineEvent[];
  onUpload: () => void;
}

export const GrowthTimeline: React.FC<Props> = ({ events, onUpload }) => {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'certificate': return <BookOpen className="w-5 h-5" />;
      case 'award': return <Award className="w-5 h-5" />;
      case 'milestone': return <Milestone className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800">成长历程</h2>
        <button 
          onClick={onUpload}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
          title="上传证书"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 py-2 space-y-8">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8"
          >
            <div className={cn(
              "absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-transform hover:scale-125 cursor-default",
              event.type === 'award' ? "bg-amber-400" : "bg-brand-blue"
            )}>
              {/* Dot indicator */}
            </div>
            
            <div className="glass-card p-5 group hover:border-brand-blue/30 transition-all hover:shadow-md cursor-default">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{event.date}</span>
              <h3 className="text-sm font-bold mt-1 text-slate-800 group-hover:text-brand-blue transition-colors line-clamp-1">{event.title}</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
