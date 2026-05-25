import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Bell, User, Calendar, MapPin, Trophy, Sparkles, Headset, ExternalLink, ArrowRight, Shield, FileText, Phone, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  onBack: () => void;
  onRegisterOfficial?: () => void;
  onRegisterQuick?: () => void;
}

export const CompetitionDetail: React.FC<Props> = ({ onBack, onRegisterOfficial, onRegisterQuick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-white overflow-y-auto"
    >
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-brand-blue transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="w-[1px] h-4 bg-slate-200" />
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">北京亦庄项目大赛详情</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-brand-blue transition-colors relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
             <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop" className="w-full h-full object-cover" alt="User" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Beijing Yizhuang"
          />
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl w-full px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-xs lg:text-sm font-black tracking-[0.3em] uppercase opacity-80">2024 BEIJING YIZHUANG INNOVATION COMPETITION</p>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
              北京亦庄项目大赛
            </h2>
            <div className="space-y-2 opacity-90">
              <p className="text-lg lg:text-xl font-medium tracking-wide">汇聚全球创新力量，打造亦庄智造新名片。</p>
              <p className="text-lg lg:text-xl font-medium tracking-wide">诚邀各类高精尖创业项目，共创未来科技新高地。</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={onRegisterQuick}
              className="min-w-[180px] px-8 py-4 rounded-xl border border-white/50 backdrop-blur-md hover:bg-white/10 transition-all font-bold tracking-wide active:scale-95"
            >
              快速预报名
            </button>
            <div className="hidden sm:block">
               <ArrowRight className="w-5 h-5 opacity-40" />
            </div>
            <button 
              onClick={onRegisterOfficial}
              className="min-w-[180px] px-8 py-4 rounded-xl bg-white text-slate-900 hover:bg-slate-50 transition-all font-black shadow-2xl shadow-white/10 tracking-wide active:scale-95"
            >
              正式报名
            </button>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             className="flex items-center justify-center gap-2 text-sm font-bold opacity-70"
          >
             <Users className="w-4 h-4" />
             <span>已有 1,280+ 团队报名</span>
          </motion.div>
        </div>

        {/* Hero Info Grid */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
           <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">
              {[
                { label: '报名截止', value: '2024.12.30', icon: Calendar },
                { label: '奖金总池', value: '¥ 5,000,000', icon: Trophy },
                { label: '重点方向', value: '硬科技 / 生物医药', icon: Sparkles },
                { label: '举办地点', value: '北京经济技术开发区 (E-Town)', icon: MapPin },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-2 opacity-60">
                    <item.icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <p className="font-black tracking-tight">{item.value}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 py-24 space-y-32">
        {/* Intro */}
        <div className="space-y-12">
           <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900">大赛介绍</h3>
              <div className="w-16 h-1.5 bg-brand-blue rounded-full" />
           </div>
           
           <div className="space-y-8 text-slate-500 leading-relaxed text-lg">
              <p>
                本届“北京亦庄项目大赛”旨在贯彻国家创新驱动发展战略，聚焦亦庄经济技术开发区重点产业方向。我们致力于寻找具有国际化视野、硬核技术实力的创业团队，通过提供政策扶持、投融资对接、产业空间等全方位的资源支持，帮助优秀项目在亦庄这片热土上生根发芽，实现高质量跨越式发展。
              </p>
              <p>
                作为北京市乃至全国的高精尖产业聚集地，北京亦庄（经济技术开发区）始终走在科技创新的前沿。本次大赛不仅是一个展示项目的平台，更是一个深度融入亦庄产业链、供应链的绝佳契机。我们重点关注新一代信息技术、高端汽车和新能源智能汽车、生物技术和大健康、机器人和智能制造等四大主导产业，致力于发掘具备颠覆性创新潜力的初创项目与成长型企业。
              </p>
              <p>
                参赛团队将有机会获得与顶级风险投资机构面对面交流的机会，并入选亦庄“创新人才库”，享受包括落户支持、人才公寓、子女教育在内的多项人才激励政策。此外，获胜项目将直接对接区内领军企业，开展联合研发、场景落地等深度合作，加速科技成果从实验室向生产线的转化。
              </p>
              
              <div className="bg-slate-50 p-8 lg:p-12 rounded-[40px] border-l-8 border-brand-blue relative mt-16 font-medium italic text-slate-700">
                在这个充满机遇的时代，我们期待与全球志同道合的创业者一道，以技术为笔，以创新为墨，共同书写亦庄智造的新篇章。无论您是身处象牙塔的研究团队，还是在商海搏击的成熟团队，只要您的项目能够解决行业痛点、引领未来趋势，亦庄都将为您提供最坚实的土壤与最广阔的天空。
              </div>
           </div>
        </div>

        {/* Schedule */}
        <div className="space-y-20">
           <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900">赛程安排</h3>
              <div className="w-16 h-1.5 bg-brand-blue rounded-full" />
           </div>

           <div className="relative pl-12 space-y-16">
              {/* Timeline Line */}
              <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-slate-100" />

              {[
                { step: '01', title: '项目征集 (预报名)', date: '2024.10.01 - 10.31', desc: '通过官网快速填写基本信息，进入项目库', active: true },
                { step: '02', title: '正式报名 (信息补充)', date: '2024.11.01 - 11.30', desc: '完善商业计划书及核心团队背景材料' },
                { step: '03', title: '赛区海选 (初赛)', date: '2024.12.01 - 12.10', desc: '线上专家评审，筛选出各赛区入围名单' },
                { step: '04', title: '赛区决赛 (复赛)', date: '2024.12.15 - 12.20', desc: '线下分赛区路演，争夺总决赛席位' },
                { step: '05', title: '市级总决赛及颁奖典礼', date: '2024.12.28', desc: '巅峰对决，现场签约与颁发奖金' },
                { step: '06', title: '结果公示', date: '2025.01.05', desc: '官网公布获奖项目及扶持政策落地明细' },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className={cn(
                    "absolute -left-[54px] w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all shadow-lg",
                    item.active ? "bg-brand-blue text-white ring-4 ring-blue-100" : "bg-white text-slate-400 border border-slate-200"
                  )}>
                    {item.step}
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                      <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                    </div>
                    <div className="bg-blue-50/50 text-brand-blue px-4 py-2 rounded-lg text-sm font-black tabular-nums border border-blue-100/50">
                      {item.date}
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
         <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-brand-blue border border-slate-100">
               <Headset className="w-8 h-8" />
            </div>
            <div className="space-y-4">
               <p className="text-slate-400 font-black tracking-widest uppercase text-sm">咨询热线</p>
               <h4 className="text-5xl lg:text-6xl font-black text-brand-blue tracking-tighter italic">400-888-2024</h4>
               <p className="text-slate-500 font-medium tracking-wide">
                  周一至周五 09:00 - 18:00 (法定节假日除外)
               </p>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
         <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
              <button className="hover:text-brand-blue transition-colors">隐私政策</button>
              <button className="hover:text-brand-blue transition-colors">参赛条款</button>
              <button className="hover:text-brand-blue transition-colors">联系我们</button>
            </div>
            <p className="text-sm text-slate-400 font-medium">
               © 2024 北京亦庄工业投资有限公司. All rights reserved.
            </p>
         </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-12 right-12 z-50">
         <button className="w-16 h-16 bg-brand-blue text-white rounded-2xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
            <Shield className="w-8 h-8 fill-current opacity-20 absolute scale-150 rotate-12 group-hover:rotate-45 transition-transform" />
            <Sparkles className="w-6 h-6 relative z-10" />
         </button>
      </div>
    </motion.div>
  );
};
