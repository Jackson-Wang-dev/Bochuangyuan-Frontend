import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, QrCode, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WeChatBindModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isScanned, setIsScanned] = useState(false);

  if (!isOpen) return null;

  const handleMockScan = () => {
    setIsScanned(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!isScanned ? (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">绑定微信</h2>
              <p className="text-slate-400 text-sm">请使用微信扫一扫完成绑定</p>
            </div>

            <div 
              onClick={handleMockScan}
              className="relative aspect-square w-48 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 p-4 cursor-pointer group"
            >
              <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors rounded-2xl flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-brand-blue uppercase tracking-widest bg-white px-3 py-1.5 rounded-full shadow-sm">点击模拟扫码</span>
              </div>
              <QrCode className="w-full h-full text-slate-300" strokeWidth={1} />
            </div>

            <p className="text-xs text-slate-400">扫码成功后将自动跳转</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-slate-800">扫码成功</h2>
            <p className="text-slate-400 text-sm">正在为您完成绑定...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
