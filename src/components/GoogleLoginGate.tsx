import React, { useState } from 'react';
import {
  Lock,
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Mail,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { useHR } from '../context/HRContext';

interface GoogleLoginGateProps {
  children: React.ReactNode;
}

export const GoogleLoginGate: React.FC<GoogleLoginGateProps> = ({ children }) => {
  const {
    currentUser,
    signInWithGoogle,
    signInAsRegisteredUser,
    companyBranding,
    darkMode
  } = useHR();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [directEmail, setDirectEmail] = useState('');

  // If user is logged in, show the application!
  if (currentUser) {
    return <>{children}</>;
  }

  const handleGoogleSignIn = async () => {
    setErrorNotice(null);
    setIsProcessing(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorNotice('تعذر استكمال تسجيل الدخول عبر Google. يمكنك استخدام الدخول المباشر بالبريد أدناه.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail.trim()) return;
    signInAsRegisteredUser(directEmail.trim().toLowerCase());
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-200 font-['Cairo',sans-serif] ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-slate-900'
    }`}>
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card Box */}
      <div className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Company Logo & Identity */}
        <div className="text-center space-y-3 mb-8">
          {companyBranding.logoUrl ? (
            <img
              src={companyBranding.logoUrl}
              alt={companyBranding.companyName}
              className="w-16 h-16 rounded-2xl object-cover shadow-lg mx-auto border border-emerald-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-emerald-500/30 mx-auto">
              {companyBranding.companyName ? companyBranding.companyName.trim()[0] : 'م'}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {companyBranding.companyName || 'منظومة موارد HR الذكية'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              {companyBranding.subtitle || 'إدارة الموارد البشرية وبوابة الخدمة الذاتية للموظفين'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>تسجيل الدخول الموحد متاح لجميع موظفي الشركة</span>
          </div>
        </div>

        {/* Informative Guidance */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>تسجيل دخول آمن ومعتمد</span>
          </div>
          <p>
            تم تحديث صلاحيات Google لتقتصر على التحقق الأساسي من الهوية (البريد والاسم) لضمان عدم حظر الدخول. يمكنك تسجيل الدخول بضغطة زر واحدة عبر Google أو إدخال بريدك مباشرة.
          </p>
        </div>

        {errorNotice && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-center">
            {errorNotice}
          </div>
        )}

        {/* Sole Google Sign-In Button (Open to Everyone without sensitive scope block) */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
          )}
          <span>تسجيل الدخول عبر حساب Google</span>
        </button>

        {/* Alternative Direct Email Input (Guarantees Access in All Browsers) */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleDirectEmailSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                أو الدخول المباشر بالبريد الإلكتروني:
              </label>
              <button
                type="button"
                onClick={() => signInAsRegisteredUser('mz0970mmz@gmail.com')}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                دخول كمدير عام (mz0970mmz)
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                required
                value={directEmail}
                onChange={(e) => setDirectEmail(e.target.value)}
                placeholder="mz0970mmz@gmail.com أو بريدك..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>دخول</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* New Employee Onboarding / Access Request Action Card */}
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-right">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  موظف جديد ولم يتم تسجيل حسابك بعد؟
                </span>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-0.5 leading-relaxed">
                  يمكنك ملء بياناتك المسجلة بالشركة وإرسال طلب تفعيل الحساب لمسؤولي الموارد البشرية (HR).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const email = directEmail.trim() || prompt('يرجى إدخال بريدك الإلكتروني لتقديم طلب الدخول:') || '';
                  if (email) {
                    signInAsRegisteredUser(email);
                  }
                }}
                className="shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all self-center"
              >
                <span>تقديم طلب الدخول للـ HR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">بوابة الموظف</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">الخدمة الذاتية</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">التواصل الداخلي</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">شات الأقسام</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">قانون العمل</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">12 لسنة 2003</span>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center space-y-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          متوافق مع قانون العمل المصري رقم 12 لسنة 2003 وقانون التأمينات والمعاشات رقم 148 لسنة 2019
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-600">
          حساب المدير العام المعتمد: <span className="font-mono text-emerald-400">mz0970mmz@gmail.com</span>
        </p>
      </div>

    </div>
  );
};
