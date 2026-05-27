import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, Brain, Target, Shield, Zap, TrendingUp, RefreshCw, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { PersonalityRadar } from './PersonalityRadar';
import { useUserStore } from '../store/userStore';
import {
  useAssessmentStore,
  QUESTIONS,
  PERSONAS_DATA,
  getTopDim,
  scoresToRadarData,
} from '../store/assessmentStore';

// Bind icon components to persona insight data at the component level
const INSIGHT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '全局思维': Target, '风险预判': Shield, '节奏把控': Zap,
  '行动优先': Zap, '目标拆解': Target, '抗干扰力': Shield,
  '长期主义': Star, '激励感召': Zap, '耐受模糊': Shield,
  '高速迭代': Zap, '机会嗅觉': Target, '心理韧性': Shield,
  '结构化思维': Target, '决策严谨': Shield, '根因追溯': Zap,
  '市场感知': Zap, '机会识别': Target, '快速决断': Shield,
}

export const AssessmentInline: React.FC = () => {
  const { user } = useUserStore();
  const nickname = user?.username;
  const { step, currentIdx, progress, scores, startTest, next, reset } = useAssessmentStore();

  const topDim = scores ? getTopDim(scores) : null;
  const personaData = topDim ? PERSONAS_DATA[topDim] : null;
  const radarData = scores ? scoresToRadarData(scores) : [];

  return (
    <div className="w-full h-full flex flex-col">

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      {step === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 rotate-12">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">AI 深度创业人格测评</h2>
          <p className="text-slate-500 max-w-sm leading-relaxed mb-8 text-sm">
            {nickname ? `${nickname}，` : ''}3 道场景决策题，揭示你的核心创业思维模型与潜在优势。
          </p>
          <button
            onClick={startTest}
            className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 group flex items-center gap-2"
          >
            开始测评
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* ── Questions ─────────────────────────────────────────────────────── */}
      {step === 'testing' && (
        <div className="flex-1 flex flex-col pt-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                第 {currentIdx + 1} 题 / 共 {QUESTIONS.length} 题
              </span>
              <span className="text-[11px] font-black text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                className="space-y-5"
              >
                <h3 className="text-lg font-bold text-slate-800 leading-snug">
                  {QUESTIONS[currentIdx]?.text}
                </h3>
                <div className="space-y-3">
                  {QUESTIONS[currentIdx]?.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => next(option.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/8 transition-all group flex items-center justify-between gap-4"
                    >
                      <span className="text-sm font-medium text-slate-700 leading-relaxed">{option.text}</span>
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {step === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.12, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
            />
            <div className="relative w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">正在构建你的人格模型…</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            分析决策路径与思维权重
          </p>
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────────────── */}
      {step === 'result' && personaData && (
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl px-8 py-6 text-center mb-4">
            {nickname && (
              <p className="text-blue-400 text-xs font-black uppercase tracking-[0.15em] mb-1">{nickname}</p>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black rounded-full uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" />
              Core Identity
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-1">{personaData.name}</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">"{personaData.keyword}"</p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">能力雷达</p>
              <p className="text-xs text-slate-400 mb-3">基于你的答题决策路径计算</p>
              <PersonalityRadar data={radarData} />
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI 洞察</p>
              <div className="space-y-2">
                {personaData.insights.map((insight, i) => {
                  const Icon = INSIGHT_ICONS[insight.label] ?? Zap;
                  return (
                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-start gap-3 shadow-sm">
                      <div className={cn(
                        'mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                        insight.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        insight.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-amber-50 text-amber-600',
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{insight.label}</p>
                        <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{insight.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.06]">
                <TrendingUp className="w-24 h-24" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">给{nickname || '你'}的建议</h4>
                </div>
                <p className="text-slate-300 text-sm leading-[1.85]">{personaData.advice}</p>
                <button
                  onClick={reset}
                  className="mt-4 px-5 py-2 bg-white/10 hover:bg-white/15 text-white/80 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  重新测评
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
