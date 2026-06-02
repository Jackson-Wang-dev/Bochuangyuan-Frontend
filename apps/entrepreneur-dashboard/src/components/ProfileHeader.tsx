import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, MapPin, Users, ChevronRight, ChevronLeft, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  data: {
    name: string;
    id: string;
    tag: string;
    avatar: string;
  };
  onRegister?: () => void;
}

const COMPETITIONS = [
  {
    id: 1,
    title: "全国创新创业大赛 2024",
    tagline: "报名进行中",
    description: "汇聚全国顶尖创新力量，为创业者提供展示舞台、资本对接与顶尖导师资源。总奖金池高达 ¥ 500万。",
    deadline: "2024.03.15",
    location: "北京 · 中国",
    reward: "500",
    rewardUnit: "万",
    image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=1400"
  },
  {
    id: 2,
    title: "全球 AI 挑战赛 2024",
    tagline: "火热筹备中",
    description: "探索人工智能的极限，挑战最前沿的算法难题。与全球顶尖开发者同台竞技，赢取丰厚奖金与硅谷交流机会。",
    deadline: "2024.05.20",
    location: "上海 · 中国",
    reward: "800",
    rewardUnit: "万",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1400"
  },
  {
    id: 3,
    title: "未来城市建构大赛",
    tagline: "作品征集中",
    description: "重新构想我们的居住空间。关注可持续发展、智慧建筑与人文关怀，为未来的城市生活提供创新的设计方案。",
    deadline: "2024.06.10",
    location: "深圳 · 中国",
    reward: "300",
    rewardUnit: "万",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1400"
  }
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

export const ProfileHeader: React.FC<Props> = ({ onRegister }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentIndex = Math.abs(page % COMPETITIONS.length);

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  const goToSlide = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        paginate(1);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, paginate]);

  const currentComp = COMPETITIONS[currentIndex]!;

  return (
    <div className="space-y-6 mb-8">
      {/* Recent Competitions Section */}
      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative rounded-[32px] overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 group transition-all duration-500 hover:shadow-blue-500/15 h-[380px] w-full"
        >
          {/* Animated Background Glow */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-blue/5 rounded-full blur-[100px] group-hover:bg-brand-blue/15 transition-all duration-1000 animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-400/5 rounded-full blur-[100px] group-hover:bg-blue-400/15 transition-all duration-1000" />

          {/* Main Banner Content */}
          <div className="w-full h-full relative">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.5, ease: "easeInOut" },
                  opacity: { duration: 0.3 }
                }}
                className="absolute inset-0 flex flex-col lg:flex-row w-full h-full"
              >
                {/* Left Content Area */}
                <div className="flex-1 p-8 lg:p-14 flex flex-col justify-center relative z-10 bg-blue-100/70 backdrop-blur-md">
                  <div className="space-y-8 lg:space-y-10">
                    <div className="space-y-4 lg:space-y-5">
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tighter leading-tight transition-all duration-700 group-hover:tracking-tight group-hover:text-blue-950 group-hover:drop-shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                      >
                        {currentComp.title.split('大赛')[0]}<span className="text-brand-blue drop-shadow-[0_2px_8px_rgba(37,99,235,0.3)]">大赛</span>{currentComp.title.split('大赛')[1]}
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-slate-500 text-sm font-medium max-w-lg leading-relaxed opacity-90 border-l-2 border-slate-100 pl-4"
                      >
                        {currentComp.description.split('¥')[0]} <span className="font-black text-slate-900 bg-blue-50 px-1 rounded">¥ {currentComp.reward}{currentComp.rewardUnit}</span>。
                      </motion.p>
                    </div>

                    <div className="flex flex-wrap gap-8 lg:gap-12 items-center">
                      <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:scale-110 transition-all duration-500 shadow-sm">
                          <Calendar className="w-5 h-5 transition-transform group-hover/item:rotate-12" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5">报名截止</p>
                          <p className="text-sm lg:text-base font-black text-slate-800 tracking-tight">{currentComp.deadline}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:scale-110 transition-all duration-500 shadow-sm">
                          <MapPin className="w-5 h-5 transition-transform group-hover/item:bounce" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-0.5">举办地点</p>
                          <p className="text-sm lg:text-base font-black text-slate-800 tracking-tight">{currentComp.location}</p>
                        </div>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50/80 text-brand-blue rounded-full border border-blue-100 shadow-[0_2px_10px_rgba(37,99,235,0.1)] transition-transform hover:scale-105 w-fit h-fit self-center lg:mt-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                        <span className="text-[11px] font-black tracking-[0.1em] uppercase">{currentComp.tagline}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Right Image/Banner Area */}
                <div className="w-full lg:w-[46%] relative min-h-[50%] lg:min-h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent z-10 opacity-40 group-hover:opacity-70 transition-all duration-700" />
                  
                  <img 
                    src={currentComp.image} 
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={currentComp.title}
                  />
                  
                  {/* Overlay Tags */}
                  <motion.div 
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="absolute top-8 left-8 z-20 bg-white/95 backdrop-blur-2xl px-5 py-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 flex items-center gap-3 transition-all duration-500"
                  >
                    <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-xs font-black text-slate-900 tracking-tight">热门赛事推荐</span>
                  </motion.div>

                  <div className="absolute top-8 right-8 z-20">
                    <motion.div 
                      className="bg-brand-blue px-6 py-4 lg:px-8 lg:py-6 rounded-[24px] lg:rounded-[28px] shadow-[0_25px_60px_-15px_rgba(37,99,235,0.6)] text-white flex items-center gap-4 lg:gap-6 border border-blue-400/40 relative overflow-hidden group/reward"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/reward:opacity-100 transition-opacity" />
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                        <Trophy className="w-7 h-7 lg:w-8 lg:h-8 text-white transition-transform group-hover/reward:scale-110" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-80 mb-1">总奖金池</p>
                        <p className="text-2xl lg:text-3xl font-black tabular-nums tracking-tighter italic">¥ {currentComp.reward}<span className="text-xl">{currentComp.rewardUnit}</span></p>
                      </div>
                    </motion.div>
                  </div>

                   {/* Interaction Buttons Overlay */}
                  <div className="absolute bottom-8 right-8 z-20 flex gap-4 transition-all duration-500 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    <button 
                      onClick={onRegister}
                      className="bg-brand-blue hover:bg-blue-600 active:scale-95 text-white px-8 py-3.5 lg:px-10 lg:py-4 rounded-xl lg:rounded-2xl font-black transition-all shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] flex items-center gap-2 group/btn"
                    >
                      立即报名
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button 
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-90"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-90"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {COMPETITIONS.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => goToSlide(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  currentIndex === idx 
                    ? "w-10 bg-brand-blue shadow-[0_0_12px_rgba(37,99,235,0.6)]" 
                    : "w-10 bg-slate-300/50 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};


