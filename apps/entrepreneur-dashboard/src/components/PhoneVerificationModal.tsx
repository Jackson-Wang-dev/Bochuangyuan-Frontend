import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPhone: string) => void;
}

type Step = 'verify-old' | 'enter-new' | 'verify-new' | 'success';

export const PhoneVerificationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<Step>('verify-old');
  const [phone, setPhone] = useState('185****4900');
  const [newPhone, setNewPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = () => {
    setCountdown(60);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOld = () => {
    // Mock verification
    setStep('enter-new');
    setCode(['', '', '', '', '', '']);
    setCountdown(0);
  };

  const handleNextToVerifyNew = () => {
    if (newPhone.length === 11) {
      setStep('verify-new');
      setCountdown(0);
    }
  };

  const handleVerifyNew = () => {
    setStep('success');
    setTimeout(() => {
      onSuccess(newPhone);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-100 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10">
          <AnimatePresence mode="wait">
            {step === 'verify-old' && (
              <motion.div
                key="verify-old"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-brand-blue" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">验证原手机号</h2>
                  <p className="text-slate-400 text-sm">为了您的账号安全，请先验证当前手机号 {phone}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between gap-2">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`code-${idx}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        className="w-12 h-14 border-2 border-slate-100 rounded-xl text-center text-xl font-bold text-brand-blue focus:border-brand-blue outline-none transition-colors"
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="w-full text-center text-sm font-bold text-brand-blue disabled:text-slate-300 transition-colors"
                  >
                    {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
                  </button>
                </div>

                <button
                  onClick={handleVerifyOld}
                  className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                >
                  下一步
                </button>
              </motion.div>
            )}

            {step === 'enter-new' && (
              <motion.div
                key="enter-new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">绑定新手机号</h2>
                  <p className="text-slate-400 text-sm">请输入您要绑定的新手机号码</p>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r border-slate-100 pr-4">+86</span>
                  <input
                    type="tel"
                    placeholder="请输入新手机号"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-20 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-brand-blue outline-none transition-all font-bold text-slate-800"
                    maxLength={11}
                  />
                </div>

                <button
                  onClick={handleNextToVerifyNew}
                  disabled={newPhone.length !== 11}
                  className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:grayscale disabled:opacity-50"
                >
                  获取验证码
                </button>
              </motion.div>
            )}

            {step === 'verify-new' && (
              <motion.div
                key="verify-new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-brand-blue" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">输入验证码</h2>
                  <p className="text-slate-400 text-sm">验证码已发送至 {newPhone}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between gap-2">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`code-new-${idx}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        className="w-12 h-14 border-2 border-slate-100 rounded-xl text-center text-xl font-bold text-brand-blue focus:border-brand-blue outline-none transition-colors"
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="w-full text-center text-sm font-bold text-brand-blue disabled:text-slate-300 transition-colors"
                  >
                    {countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码'}
                  </button>
                </div>

                <button
                  onClick={handleVerifyNew}
                  className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                >
                  确 认
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-800">更换成功</h2>
                <p className="text-slate-400">您的手机号已成功更新</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
