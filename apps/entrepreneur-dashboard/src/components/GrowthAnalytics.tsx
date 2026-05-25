import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GrowthDataPoint } from '../types';

interface Props {
  data: GrowthDataPoint[];
}

export const GrowthAnalytics: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800">多维生长曲线</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-blue" />
            <span className="text-xs text-slate-500 font-medium font-mono">TECH INDEX</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-cyan" />
            <span className="text-xs text-slate-500 font-medium font-mono">MARKET CAP</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[350px] glass-card p-6 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                color: '#1e293b',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="technical" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTech)" 
            />
            <Area 
              type="monotone" 
              dataKey="market" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMarket)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 group hover:border-brand-blue/30 transition-all">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">AI 建议采纳次数</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-black text-slate-900 group-hover:text-brand-blue transition-colors">128</p>
            <span className="text-emerald-500 text-xs font-bold font-mono">+12%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-brand-blue h-full w-[80%] rounded-full" />
          </div>
        </div>
        <div className="glass-card p-6 group hover:border-brand-blue/30 transition-all">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">个人能量值</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-black text-slate-900 group-hover:text-brand-blue transition-colors">84%</p>
            <span className="text-slate-400 text-xs font-bold font-mono">OPT</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-brand-cyan h-full w-[65%] rounded-full" />
          </div>
        </div>
        <div className="glass-card p-6 group hover:border-brand-blue/30 transition-all">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">风控健康指数</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-black text-slate-900 group-hover:text-brand-blue transition-colors">92</p>
            <span className="text-emerald-500 text-xs font-bold font-mono">A+</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[92%] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
