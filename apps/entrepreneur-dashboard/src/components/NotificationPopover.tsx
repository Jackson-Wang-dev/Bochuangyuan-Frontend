import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Shield, PieChart, Wallet, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'success' | 'alert' | 'report' | 'finance';
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: '项目合规性审核通过',
    description: '您的项目 "Alpha Block" 已通过法律治理委员会的合规性审核。您可以开始执行下一阶段计...',
    time: '2分钟前',
    unread: true,
    type: 'success'
  },
  {
    id: '2',
    title: '安全凭证即将过期',
    description: '您的数字保险库密钥将在24小时内过期，请尽快在安全中心完成年度更新。',
    time: '1小时前',
    unread: true,
    type: 'alert'
  },
  {
    id: '3',
    title: '周度数据中心简报',
    description: '上周的项目进展摘要已生成，共计 12 个关键里程碑已完成，整体进度领先 5%。',
    time: '3天前',
    unread: false,
    type: 'report'
  },
  {
    id: '4',
    title: '年度财务报表已就绪',
    description: 'Q3季度财务审计报告现已可供下载。请登录财务管理终端查看详情。',
    time: '9个月前',
    unread: false,
    type: 'finance'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<Props> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = filter === 'all' 
    ? NOTIFICATIONS 
    : NOTIFICATIONS.filter(n => n.unread);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'alert': return <Shield className="w-5 h-5 text-amber-700" />;
      case 'report': return <PieChart className="w-5 h-5 text-slate-500" />;
      case 'finance': return <Wallet className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBg = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-blue-50';
      case 'alert': return 'bg-amber-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute top-16 right-0 w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">消息</h3>
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  {filter === 'all' ? '全部消息' : '未读消息'}
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-current ml-1" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all py-1 z-20">
                    <button 
                      onClick={() => setFilter('all')}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      全部消息
                    </button>
                    <button 
                      onClick={() => setFilter('unread')}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      未读消息
                    </button>
                </div>
              </div>
           </div>
           
           <div className="flex gap-8 relative">
              <button 
                onClick={() => setFilter('all')}
                className={cn(
                  "text-sm font-bold pb-2 transition-all relative",
                  filter === 'all' ? "text-blue-600" : "text-slate-400"
                )}
              >
                通知
                {filter === 'all' && (
                  <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
           </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-slate-400">暂无消息</p>
            </div>
          ) : (
            filtered.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4 group cursor-pointer">
                <div className={cn("w-10 h-10 rounded-xl shrink-0 flex items-center justify-center", getBg(notification.type))}>
                   {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                      {notification.title}
                      {notification.unread && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{notification.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <button className="text-sm font-bold text-blue-700 hover:underline">
            标记全部为已读
          </button>
        </div>
      </motion.div>
    </>
  );
};
