import React, { useState } from 'react';
import {
  UserCheck,
  Building2,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  LogOut,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Mail,
  Briefcase,
  Hash,
  RefreshCw
} from 'lucide-react';
import { useHR } from '../context/HRContext';

export const OnboardingRequestView: React.FC = () => {
  const {
    currentUser,
    signOut,
    companyBranding,
    accessRequests,
    submitAccessRequest,
    darkMode
  } = useHR();

  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const existingRequest = accessRequests.find((r) => r.email.toLowerCase().trim() === userEmail);

  // Form states
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('+20 10 ');
  const [nationalId, setNationalId] = useState('');
  const [department, setDepartment] = useState('الهندسة والتقنية');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [socialInsuranceNumber, setSocialInsuranceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reapplyMode, setReapplyMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !nationalId.trim() || !jobTitle.trim()) {
      return;
    }

    setIsSubmitting(true);
    submitAccessRequest({
      fullName: fullName.trim(),
      email: userEmail,
      phone: phone.trim(),
      nationalId: nationalId.trim(),
      department,
      jobTitle: jobTitle.trim(),
      employeeCode: employeeCode.trim() || undefined,
      socialInsuranceNumber: socialInsuranceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);
    setReapplyMode(false);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 font-['Cairo',sans-serif] transition-colors ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-slate-900'
    }`}>
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Company Branding */}
        <div className="text-center space-y-3 mb-6">
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
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {companyBranding.companyName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              بوابة تسجيل واعتماد حسابات منسوبي الشركة الجدد
            </p>
          </div>
        </div>

        {/* Status Mode 1: Request is already Pending */}
        {existingRequest && existingRequest.status === 'pending' && !reapplyMode ? (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border-2 border-amber-200 dark:border-amber-800/80 shadow-md">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold">
                طلبك قيد المراجعة والتدقيق
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                تم إرسال بياناتك إلى إدارة الموارد البشرية (HR)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                شكراً لك يا <strong>{existingRequest.fullName}</strong>. حسابك مسجل بالبريد ({existingRequest.email}). سيقوم مسؤول الموارد البشرية بمراجعة الرقم القومي وبيانات عقد العمل لاعتماد تفعيل حسابك للدخول لبوابة الموظف فورياً.
              </p>
            </div>

            {/* Submitted Info Snapshot */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-right text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500">القسم:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{existingRequest.department}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500">المسمى الوظيفي:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{existingRequest.jobTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500">الرقم القومي:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{existingRequest.nationalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ تقديم الطلب:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">{existingRequest.requestedAt}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>يتم إشعار مسؤول الموارد البشرية (mz0970mmz@gmail.com) بالطلب تلقائياً.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>التحقق من حالة الاعتماد الآن</span>
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        ) : existingRequest && existingRequest.status === 'rejected' && !reapplyMode ? (
          /* Status Mode 2: Request was Rejected */
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border-2 border-rose-200 dark:border-rose-800 shadow-md">
              <XCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs font-bold">
                تم رفض طلب الدخول
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                تعذر اعتماد تفعيل الحساب
              </h2>
              {existingRequest.rejectionReason && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 text-xs text-rose-800 dark:text-rose-300 text-right">
                  <strong>ملاحظة إدارة الموارد البشرية:</strong> {existingRequest.rejectionReason}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يرجى التأكد من كتابة الرقم القومي الصحيح والاسم المطابق للعقد، ثم إعادة إرسال الطلب.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setReapplyMode(true)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                إعادة ملء البيانات وإرسال طلب جديد
              </button>
              <button
                onClick={signOut}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        ) : (
          /* Form Mode: Fill Out Employment Information */
          <div className="space-y-5 animate-in fade-in">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">طلب اعتماد موظف جديد:</strong>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  حسابك البريدي ({userEmail}) ليس مسجلاً بعد في قاعدة بيانات الموظفين النشطين. يرجى استكمال بياناتك الوظيفية المسجلة لدى الشركة ليقوم مسؤول الموارد البشرية بتدقيقها واعتماد دخولك لبوابة الموظف.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  الاسم بالكامل (رباعي كما في بطاقة الرقم القومي) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: يوسف عبد الرحمن حسن إبراهيم"
                    className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* National ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    الرقم القومي المصري (14 رقم) *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                      placeholder="29505120101987"
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    رقم الهاتف المحمول *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20 10 1234 5678"
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Department & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    القسم التابع له بالشركة *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="الهندسة والتقنية">الهندسة والتقنية</option>
                    <option value="الموارد البشرية والإدارة العليا">الموارد البشرية والإدارة</option>
                    <option value="المالية والمحاسبة">المالية والمحاسبة</option>
                    <option value="التسويق والمبيعات">التسويق والمبيعات</option>
                    <option value="العمليات التشغيلية">العمليات التشغيلية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    المسمى الوظيفي بالعقد *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="مثال: مهندس برمجيات / محاسب أول..."
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Employee Code & Social Insurance No (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    كود الموظف (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="EMP-EG-..."
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    الرقم التأميني (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={socialInsuranceNumber}
                    onChange={(e) => setSocialInsuranceNumber(e.target.value)}
                    placeholder="11983021"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes to HR */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  رسالة أو ملاحظات لمسؤول الموارد البشرية
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تاريخ استلام العمل أو أي تفاصيل إضافية..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال طلب الدخول والاعتماد للـ HR</span>
                </button>

                <button
                  type="button"
                  onClick={signOut}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* Footer Legal Note */}
      <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        يتم تدقيق البيانات بواسطة إدارة الموارد البشرية وفقاً لقانون العمل المصري رقم 12 لسنة 2003
      </div>

    </div>
  );
};
