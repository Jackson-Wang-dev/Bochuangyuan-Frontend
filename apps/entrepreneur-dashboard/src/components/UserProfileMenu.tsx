import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, MessageSquare, LogOut, X, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { PhoneVerificationModal } from './PhoneVerificationModal';
import { WeChatBindModal } from './WeChatBindModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileMenu: React.FC<Props> = ({ isOpen, onClose }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [phone, setPhone] = useState('185****4900');
  const [isWeChatBound, setIsWeChatBound] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {showPhoneModal && (
          <PhoneVerificationModal 
            isOpen={showPhoneModal} 
            onClose={() => setShowPhoneModal(false)}
            onSuccess={(newPhone) => setPhone(newPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'))}
          />
        )}
        {showWeChatModal && (
          <WeChatBindModal 
            isOpen={showWeChatModal} 
            onClose={() => setShowWeChatModal(false)}
            onSuccess={() => setIsWeChatBound(true)}
          />
        )}
      </AnimatePresence>

      {/* Overlay to close menu when clicking outside */}
      <div 
        className="fixed inset-0 z-[1001]" 
        onClick={onClose} 
      />
      
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute top-14 right-0 w-[240px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[1002] py-4"
      >
        {/* User Header */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-50 mb-2">
          <img 
            src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop" 
            className="w-12 h-12 rounded-full border-2 border-slate-100 shadow-sm object-cover" 
            alt="User Avatar" 
          />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-lg">王发</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {/* Phone */}
          <div className="w-full px-6 py-3 flex items-center justify-between text-slate-600 hover:bg-slate-50 transition-colors text-sm group">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
              <span className="font-medium">{phone}</span>
            </div>
            <button 
              onClick={() => setShowPhoneModal(true)}
              className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-400 hover:bg-brand-blue hover:text-white transition-all font-bold"
            >
              更换
            </button>
          </div>

          {/* Password */}
          <div className="w-full px-6 py-3 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors text-sm group">
            <Lock className="w-5 h-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
            <div className="flex items-center gap-1">
              <span className="font-medium">密码</span>
              <span className="text-slate-400">（未设置）</span>
            </div>
          </div>

          {/* WeChat */}
          <div className="w-full px-6 py-3 flex items-center justify-between text-slate-600 hover:bg-slate-50 transition-colors text-sm group">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
              <div className="flex items-center gap-1">
                <span className="font-medium">微信号</span>
                <span className={cn("text-slate-400", isWeChatBound && "text-emerald-500 font-bold")}>
                  {isWeChatBound ? '（已绑定）' : '（未绑定）'}
                </span>
              </div>
            </div>
            {!isWeChatBound && (
              <button 
                onClick={() => setShowWeChatModal(true)}
                className="text-[10px] bg-brand-blue/10 px-2 py-0.5 rounded-md text-brand-blue hover:bg-brand-blue hover:text-white transition-all font-bold"
              >
                绑定
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-2 border-t border-slate-50" />

        {/* Logout */}
        <button
          className="w-full px-6 py-3 flex items-center gap-3 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
          <span className="font-medium">退出登录</span>
        </button>
      </motion.div>
    </>
  );
};
