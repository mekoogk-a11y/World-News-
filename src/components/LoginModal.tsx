import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ShieldAlert, CheckCircle2, X, Eye, EyeOff, UserCheck } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [email, setEmail] = useState('mekoogk@gmail.com');
  const [password, setPassword] = useState('admin123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'فشل التحقق من بيانات الدخول.');
      }

      localStorage.setItem('admin_token', data.token);
      onLoginSuccess(data.user, data.token);
      setSuccessMessage('تم تسجيل الدخول بصلاحيات المدير الرئيسي بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطأ في الاتصال بالخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'فشل تحديث كلمة المرور.');
      }

      setSuccessMessage('تم تحديث كلمة المرور بنجاح!');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'خطأ أثناء تغيير كلمة المرور.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 p-4 backdrop-blur-xs">
      <div
        id="login-modal-box"
        className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl text-neutral-900 animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-red-800 p-2 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif-editorial text-lg font-bold text-neutral-900">
                بوابة الإدارة المركزية
              </h3>
              <p className="text-xs text-neutral-500">
                الصحيفة الإلكترونية لأخبار العالم • الإشراف التحريري الكامل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentUser ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-600 p-2 text-white">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950">{currentUser.name}</h4>
                    <p className="text-xs text-emerald-700 font-mono-code">{currentUser.email}</p>
                    <span className="inline-block mt-1 rounded bg-emerald-200/60 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      صلاحية المدير الرئيسي (Super Admin)
                    </span>
                  </div>
                </div>
              </div>

              {isChangingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm text-neutral-800">تغيير كلمة المرور الخاصة بك:</h4>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      كلمة المرور الجديدة:
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8 أحرف على الأقل..."
                      required
                      className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      تأكيد كلمة المرور:
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور..."
                      required
                      className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-red-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 rounded bg-red-800 py-2 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                    >
                      {isLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="rounded border border-neutral-300 px-3 py-2 text-xs font-semibold hover:bg-neutral-100 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center justify-center gap-2 rounded border border-neutral-300 bg-white py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-neutral-500" />
                    تغيير كلمة المرور
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 rounded bg-red-800 py-2 text-xs font-bold text-white hover:bg-red-900 transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  البريد الإلكتروني للإدارة:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="mekoogk@gmail.com"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pl-10 text-sm focus:border-red-800 focus:ring-1 focus:ring-red-800 focus:outline-hidden"
                    dir="ltr"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    كلمة المرور:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('mekoogk@gmail.com');
                      setPassword('admin123456');
                    }}
                    className="text-[11px] font-medium text-red-800 hover:underline"
                  >
                    استخدام بيانات الدخول التجريبية (admin123456)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pl-10 text-sm focus:border-red-800 focus:ring-1 focus:ring-red-800 focus:outline-hidden"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-700" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-800 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-900 transition-colors disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'جاري التحقق...' : 'دخول المدير الرئيسي'}
              </button>

              <p className="text-center text-[11px] text-neutral-500">
                مخصص لإدارة التحرير، قسم المقاولات، وضبط السياسات التحريرية ومحرك الذكاء الاصطناعي.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
