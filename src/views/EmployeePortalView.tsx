import React, { useState, useRef } from 'react';
import {
  Calendar,
  Clock,
  CreditCard,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  FileText,
  MessageSquare,
  Building,
  UserCheck,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Send,
  X,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { downloadElementAsPdf } from '../utils/pdfExport';

export const EmployeePortalView: React.FC = () => {
  const {
    currentUser,
    currentEmployee,
    attendance,
    leaves,
    payrolls,
    submitLeaveRequest,
    checkIn,
    checkOut,
    setActiveTab,
    setEmployeeFullScreenView,
    setSelectedPayslipForView,
    companyBranding,
    addNotification,
    employees
  } = useHR();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState<any | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateDestination, setCertificateDestination] = useState('البنك الأهلي المصري (لطلب تمويل)');

  // Form states for leave request
  const [leaveType, setLeaveType] = useState<'annual' | 'casual' | 'sick' | 'unpaid'>('annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');

  // Fallback employee object if not found
  const emp = currentEmployee || {
    id: 'emp-current',
    employeeCode: 'EMP-EG-001',
    fullName: currentUser?.displayName || 'موظف مسجل',
    email: currentUser?.email || 'employee@company.eg',
    phone: '+20 10 1234 5678',
    department: 'الهندسة والتقنية',
    jobTitle: 'أخصائي تطوير ونظم',
    basicSalary: 18000,
    housingAllowance: 3000,
    transportAllowance: 1500,
    otherAllowances: 1000,
    hireDate: '2023-01-01',
    status: 'active' as const,
    nationalId: '29301010101234',
    socialInsuranceNumber: '109847291',
    remainingLeaveDays: 21,
    casualLeaveDays: 6,
  };

  // Today's attendance record
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = attendance.find(
    (a) => a.employeeId === emp.id && a.date === todayStr
  );

  // My leaves
  const myLeaves = leaves.filter((l) => l.employeeId === emp.id);

  // My payrolls
  const myPayrolls = payrolls.filter(
    (p) => p.employeeId === emp.id || p.employeeName.includes(emp.fullName)
  );
  const latestPayroll = myPayrolls[0] || payrolls[0] || null;

  // Department teammates
  const teamMembers = employees.filter(
    (e) => e.department === emp.department && e.id !== emp.id
  );

  const handleClockIn = () => {
    checkIn(emp.id, 'بوابة الموظف الذاتية (المقر الرئيسي - القاهرة)');
    addNotification({
      title: 'تم تسجيل الحضور',
      message: 'تم تسجيل حضورك بنجاح لليوم، نتمنى لك يوماً مثمراً وموفقاً!',
      type: 'success',
      read: false,
    });
  };

  const handleClockOut = () => {
    checkOut(emp.id);
    addNotification({
      title: 'تم تسجيل الانصراف',
      message: 'تم تسجيل انصرافك بنجاح، شكراً لجهودك اليوم!',
      type: 'info',
      read: false,
    });
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      addNotification({
        title: 'تنبيه',
        message: 'يرجى كتابة سبب طلب الإجازة.',
        type: 'warning',
        read: false,
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    submitLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.fullName,
      department: emp.department,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
    });

    addNotification({
      title: 'تم تقديم طلب الإجازة',
      message: `تم إرسال طلب إجازة (${days} يوم) إلى إدارة الموارد البشرية للمراجعة.`,
      type: 'success',
      read: false,
    });

    setShowLeaveModal(false);
    setReason('');
  };

  const [isDownloadingPayslipPdf, setIsDownloadingPayslipPdf] = useState(false);
  const [isDownloadingCertPdf, setIsDownloadingCertPdf] = useState(false);
  const payslipModalRef = useRef<HTMLDivElement>(null);
  const certificateModalRef = useRef<HTMLDivElement>(null);

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleDownloadPayslipPdf = async () => {
    if (!payslipModalRef.current || !showPayslipModal) return;
    setIsDownloadingPayslipPdf(true);
    try {
      const cleanMonth = (showPayslipModal.month || 'statement').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
      const fileName = `مفردات_مرتب_${emp.employeeCode}_${cleanMonth}.pdf`;
      await downloadElementAsPdf(payslipModalRef.current, {
        fileName,
        orientation: 'portrait',
        marginMm: 6,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingPayslipPdf(false);
    }
  };

  const handleDownloadCertPdf = async () => {
    if (!certificateModalRef.current) return;
    setIsDownloadingCertPdf(true);
    try {
      const fileName = `شهادة_راتب_${emp.employeeCode}.pdf`;
      await downloadElementAsPdf(certificateModalRef.current, {
        fileName,
        orientation: 'portrait',
        marginMm: 8,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingCertPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* 1. Welcome & Employee Identity Card */}
      <div className="bg-gradient-to-l from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Employee Basic Info */}
          <div className="flex items-center gap-4 sm:gap-6">
            {emp.avatar ? (
              <img
                src={emp.avatar}
                alt={emp.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/40 shadow-md shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 text-white flex items-center justify-center font-black text-3xl shrink-0 shadow-md">
                {emp.fullName ? emp.fullName.trim()[0] : 'م'}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black">{emp.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold">
                  {emp.employeeCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-[11px] font-bold">
                  {emp.department}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                {emp.jobTitle}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 mt-2 font-mono">
                <span>الرقم القومي: {emp.nationalId || '29301010101234'}</span>
                <span>•</span>
                <span>الرقم التأميني: {emp.socialInsuranceNumber || '109847291'}</span>
              </div>
            </div>
          </div>

          {/* Clock In / Out Quick Punch Action */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[220px] text-center shrink-0">
            <span className="text-[11px] font-medium text-emerald-100 mb-1">
              تسجيل الحضور اليومي الذكي
            </span>
            <span className="text-lg font-bold font-mono text-white mb-2">
              {todayRecord ? (
                todayRecord.checkOutTime ? (
                  <span className="text-emerald-300">تم الانصراف ({todayRecord.checkOutTime})</span>
                ) : (
                  <span className="text-emerald-300">حاضر منذ ({todayRecord.checkInTime})</span>
                )
              ) : (
                'لم يتم الحضور بعد'
              )}
            </span>

            {!todayRecord ? (
              <button
                onClick={handleClockIn}
                className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>تسجيل حضور الآن</span>
              </button>
            ) : !todayRecord.checkOutTime ? (
              <button
                onClick={handleClockOut}
                className="w-full py-2 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>تسجيل انصراف</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-200 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>اكتمل يوم العمل بنجاح</span>
              </span>
            )}
          </div>

        </div>
      </div>

      {/* 2. Key Employee Metrics (Simple & Visual) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Annual Leave Balance */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الإجازات السنوية</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {emp.remainingLeaveDays ?? 21}
            </span>
            <span className="text-xs text-slate-400 font-medium">يوم متبقي</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">من أصل 21 يوم قانوني</p>
        </div>

        {/* Casual Leave Balance */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الإجازة العارضة</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {emp.casualLeaveDays ?? 6}
            </span>
            <span className="text-xs text-slate-400 font-medium">أيام</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">وفق قانون العمل المصري (بحد أقصى يومين بالمرة)</p>
        </div>

        {/* Next Salary Date */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">موعد صرف المرتب</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              27 الشهر
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">تحويل بنكي مباشر (CIB/NBE)</p>
        </div>

        {/* Current Net Package */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المرتب الإجمالي</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {(emp.basicSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">تأمينات 11% مقتطعة</p>
        </div>

      </div>

      {/* 3. Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setEmployeeFullScreenView('leaves')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs text-right transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">إجازاتي والتقويم</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تقديم إجازة والتقويم</p>
          </div>
        </button>

        <button
          onClick={() => setEmployeeFullScreenView('certificate')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs text-right transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">شهادة تعريف بالراتب</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">رسمية معتمدة بالشعار</p>
          </div>
        </button>

        <button
          onClick={() => setEmployeeFullScreenView('payslips')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs text-right transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">كشف مفردات المرتب</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مفردات الأجر والتأمينات</p>
          </div>
        </button>

        <button
          onClick={() => setEmployeeFullScreenView('chat')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs text-right transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">شات فريق القسم</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">التواصل الفوري الداخلي</p>
          </div>
        </button>

        <button
          onClick={() => setEmployeeFullScreenView('attendance')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs text-right transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">سجل الدوام والحضور</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ساعات العمل والغياب</p>
          </div>
        </button>

        <button
          onClick={() => setEmployeeFullScreenView('profile')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs text-right transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">ملفي وبياناتي</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">العقد والرقم القومي</p>
          </div>
        </button>
      </div>

      {/* 4. Main Two Column Section: Payslips & Leave History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): My Salary Slips & History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">كشوف مفردات المرتب الخاصة بي</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">متوافقة مع التأمينات المصرية (قانون 148) وضريبة كسب العمل</p>
            </div>
            <button
              onClick={() => setEmployeeFullScreenView('payslips')}
              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              عرض الكشف الكامل (Full Screen) ←
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">الشهر</th>
                  <th className="py-2.5 px-3">الأساسي والبدلات</th>
                  <th className="py-2.5 px-3">تأمينات الموظف (11%)</th>
                  <th className="py-2.5 px-3">الضريبة</th>
                  <th className="py-2.5 px-3">صافي الراتب</th>
                  <th className="py-2.5 px-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myPayrolls.length > 0 ? (
                  myPayrolls.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {pay.month}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono">
                        {(pay.basicSalary + pay.housingAllowance + pay.transportAllowance).toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-mono">
                        -{(pay.socialInsuranceEmployee || pay.gosiDeduction || 0).toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        -{(pay.incomeTaxDeduction || 0).toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {pay.netSalary.toLocaleString('ar-EG')} ج.م
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedPayslipForView(pay);
                            setEmployeeFullScreenView('payslips');
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>عرض وطباعة (Full Screen)</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      لا توجد كشوف رواتب سابقة مسجلة لهذا الحساب حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming Official Holidays in Egypt */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">الإجازات الرسمية القادمة</h3>
            <span className="text-xs text-slate-400 font-medium">مصر 2026</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'عيد القوات المسلحة (ذكرى 6 أكتوبر)', date: '6 أكتوبر 2026', days: 'يوم واحد', status: 'عطلة رسمية' },
              { title: 'المولد النبوي الشريف', date: 'سبتمبر 2026', days: 'يوم واحد', status: 'عطلة رسمية' },
              { title: 'عيد رأس السنة الميلادية', date: '1 يناير 2027', days: 'يوم واحد', status: 'عطلة رسمية' },
              { title: 'عيد الميلاد المجيد', date: '7 يناير 2027', days: 'يوم واحد', status: 'عطلة رسمية' },
            ].map((hol, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{hol.title}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">{hol.date}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-md shrink-0">
                  {hol.days}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
            💡 <strong>تنبيه قانوني:</strong> الإجازات الرسمية مدفوعة الأجر بالكامل لكافة العاملين وفق أحكام المادة 52 من قانون العمل رقم 12 لسنة 2003.
          </div>
        </div>

      </div>

      {/* 5. Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">تقديم طلب إجازة جديد</h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نوع الإجازة</label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="annual">إجازة اعتيادية سنوية (رصيدك: {emp.remainingLeaveDays ?? 21} يوم)</option>
                  <option value="casual">إجازة عارضة (رصيدك: {emp.casualLeaveDays ?? 6} أيام)</option>
                  <option value="sick">إجازة مرضية (بتقرير طبي معتمد)</option>
                  <option value="unpaid">إجازة بدون مرتب</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">سبب الإجازة وملاحظات الموظف</label>
                <textarea
                  rows={3}
                  required
                  placeholder="يرجى كتابة سبب الإجازة والشخص القائم بالعمل أثناء فترة الغياب..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  إرسال الطلب للاعتماد
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Payslip Printable Modal (Branded with custom company logo & company name) */}
      {showPayslipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 print:hidden">
              <span className="text-xs font-bold text-slate-500">معاينة مفردات المرتب المعتمدة</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPayslipPdf}
                  disabled={isDownloadingPayslipPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isDownloadingPayslipPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingPayslipPdf ? 'جارٍ التحميل...' : 'تحميل PDF'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
                <button
                  onClick={() => setShowPayslipModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Branded Paper Header (Monochrome Official Black & White) */}
            <div
              ref={payslipModalRef}
              data-pdf-content="employee-portal-payslip"
              className="p-6 bg-white rounded-2xl border-2 border-neutral-900 space-y-6 text-neutral-950 printable-official-doc"
            >
              
              {/* Company Logo & Title Header */}
              <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4">
                <div className="flex items-center gap-3">
                  {companyBranding.logoUrl ? (
                    <img
                      src={companyBranding.logoUrl}
                      alt={companyBranding.companyName}
                      className="w-14 h-14 rounded-xl object-cover border border-neutral-400 grayscale"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                      {companyBranding.companyName ? companyBranding.companyName.trim()[0] : 'م'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-neutral-950">
                      {companyBranding.companyName}
                    </h2>
                    <p className="text-[11px] text-neutral-600">
                      {companyBranding.subtitle}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      س.ت: {companyBranding.commercialRecord || '194820'} | ب.ض: {companyBranding.taxNumber || '100-293-847'}
                    </p>
                  </div>
                </div>

                <div className="text-left font-mono text-xs">
                  <span className="block font-black text-neutral-950 bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded">كشف مفردات مرتب</span>
                  <span className="text-[11px] text-neutral-600 block mt-1">شهر: {showPayslipModal.month}</span>
                  <span className="text-[9px] text-neutral-500 block">طراز رسمي أبيض وأسود</span>
                </div>
              </div>

              {/* Employee Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-300">
                <div>
                  <span className="text-neutral-500 block text-[11px]">اسم الموظف:</span>
                  <span className="font-black text-neutral-950">{showPayslipModal.employeeName || emp.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">الرقم القومي (مصر):</span>
                  <span className="font-bold text-neutral-900 font-mono">{emp.nationalId || '29301010101234'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">الرقم التأميني:</span>
                  <span className="font-bold text-neutral-900 font-mono">{emp.socialInsuranceNumber || '109847291'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">القسم:</span>
                  <span className="font-bold text-neutral-900">{emp.department}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">المسمى الوظيفي:</span>
                  <span className="font-bold text-neutral-900">{emp.jobTitle}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">طريقة التحويل:</span>
                  <span className="font-bold text-neutral-900">حساب بنكي CIB/NBE</span>
                </div>
              </div>

              {/* Salary Breakdown Table */}
              <div className="border-2 border-neutral-900 rounded-xl overflow-hidden text-xs bg-white">
                <div className="grid grid-cols-2 bg-neutral-100 font-black p-2.5 border-b-2 border-neutral-900 text-neutral-950">
                  <span>الاستحقاقات (الأجر والبدلات)</span>
                  <span>الاستقطاعات (التأمينات والضرائب)</span>
                </div>
                <div className="grid grid-cols-2 p-3 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-700">المرتب الأساسي:</span>
                      <span className="font-bold font-mono text-neutral-950">{showPayslipModal.basicSalary?.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-700">بدل السكن:</span>
                      <span className="font-bold font-mono text-neutral-950">{showPayslipModal.housingAllowance?.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-700">بدل الانتقال:</span>
                      <span className="font-bold font-mono text-neutral-950">{showPayslipModal.transportAllowance?.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-700">حوافز وإنتاج:</span>
                      <span className="font-bold font-mono text-neutral-950">{(showPayslipModal.bonus || 0).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-r border-neutral-300 pr-4">
                    <div className="flex justify-between text-neutral-900 font-bold">
                      <span>تأمينات اجتماعية (11%):</span>
                      <span className="font-bold font-mono">-{(showPayslipModal.socialInsuranceEmployee || showPayslipModal.gosiDeduction || 0).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>ضريبة كسب العمل:</span>
                      <span className="font-bold font-mono text-neutral-900">-{(showPayslipModal.incomeTaxDeduction || 0).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>غياب / جزاءات:</span>
                      <span className="font-bold font-mono text-neutral-900">-{(showPayslipModal.absenceDeduction || 0).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-100 border-t-2 border-neutral-900 flex items-center justify-between text-sm font-black text-neutral-950">
                  <span>صافي المرتب واجب الصرف:</span>
                  <span className="font-mono text-base">{showPayslipModal.netSalary?.toLocaleString('ar-EG')} جنيه مصري</span>
                </div>
              </div>

              {/* Legal Signatures */}
              <div className="grid grid-cols-2 pt-6 text-center text-xs">
                <div>
                  <span className="block text-neutral-500 mb-6">مسؤول الموارد البشرية والرواتب</span>
                  <span className="font-bold text-neutral-950">محمد زكريا (معتمد إلكترونياً)</span>
                </div>
                <div>
                  <span className="block text-neutral-500 mb-4">خاتم المنشأة الرسمي</span>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-900 mx-auto flex items-center justify-center text-[10px] text-neutral-950 font-bold rotate-12">
                    معتمد HR
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 7. Salary Certificate Official Printable Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 print:hidden">
              <span className="text-xs font-bold text-slate-500">شهادة مفردات مرتب وتعيين موجهة</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCertPdf}
                  disabled={isDownloadingCertPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isDownloadingCertPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isDownloadingCertPdf ? 'جارٍ التحميل...' : 'تحميل PDF'}</span>
                </button>
                <button
                  onClick={handlePrintCertificate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Destination chooser */}
            <div className="mb-4 print:hidden">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الجهة الموجه إليها الخطاب:</label>
              <input
                type="text"
                value={certificateDestination}
                onChange={(e) => setCertificateDestination(e.target.value)}
                placeholder="إلى من يهمه الأمر / بنك مصر / السفارة..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            {/* Printable Document Sheet (Official Black & White Design) */}
            <div
              ref={certificateModalRef}
              data-pdf-content="employee-portal-certificate"
              className="p-8 bg-white text-neutral-950 rounded-2xl border-2 border-neutral-900 space-y-6 text-sm font-['Cairo',sans-serif] printable-official-doc"
            >
              
              {/* Company Logo Header */}
              <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4">
                <div className="flex items-center gap-3">
                  {companyBranding.logoUrl ? (
                    <img
                      src={companyBranding.logoUrl}
                      alt={companyBranding.companyName}
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-400 grayscale"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-black text-2xl">
                      {companyBranding.companyName ? companyBranding.companyName.trim()[0] : 'م'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-black text-neutral-950">{companyBranding.companyName}</h2>
                    <p className="text-xs text-neutral-600">{companyBranding.subtitle}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      س.ت: {companyBranding.commercialRecord || '194820'} | ب.ض: {companyBranding.taxNumber || '100-293-847'}
                    </p>
                  </div>
                </div>

                <div className="text-left text-xs font-mono">
                  <span className="block text-neutral-900 font-bold">التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
                  <span className="block text-neutral-600">الرقم المرجعي: HR/CERT/{Date.now().toString().slice(-6)}</span>
                  <span className="text-[9px] text-neutral-500 block">طراز رسمي أبيض وأسود</span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1 my-6">
                <h3 className="text-lg font-black underline underline-offset-8 text-neutral-950">شهادة تعريف بمفردات المرتب والعمل</h3>
                <p className="text-xs font-black text-neutral-900 border-b border-neutral-300 pb-1 inline-block">موجهة إلى السادة / {certificateDestination}</p>
              </div>

              {/* Text body */}
              <div className="text-xs sm:text-sm leading-relaxed text-justify space-y-3 text-neutral-900">
                <p className="font-bold">تحية طيبة وبعد،،،</p>
                <p>
                  تشهد إدارة شركة <strong>{companyBranding.companyName}</strong> بأن السيد/ <strong>{emp.fullName}</strong>، 
                  يحمل الرقم القومي <strong>({emp.nationalId || '29301010101234'})</strong>، مقيد بسجلات الشركة التأمينية برقم <strong>({emp.socialInsuranceNumber || '109847291'})</strong>، 
                  ويعمل لدينا بوظيفة <strong>{emp.jobTitle}</strong> بقسم <strong>{emp.department}</strong> منذ تاريخ تعيينه في <strong>{emp.hireDate}</strong>، وما زال على رأس عمله حتى تاريخه.
                </p>
                <p>
                  ويتقاضى سيادته مرتباً شهرياً إجمالياً قدره <strong>{(emp.basicSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances).toLocaleString('ar-EG')} جنيه مصري</strong>، 
                  مفصل كالتالي: (أجر أساسي: {emp.basicSalary.toLocaleString('ar-EG')} ج.م، بدل سكن: {emp.housingAllowance.toLocaleString('ar-EG')} ج.م، بدل انتقال: {emp.transportAllowance.toLocaleString('ar-EG')} ج.م).
                </p>
                <p>
                  وقد أعطيت له هذه الشهادة بناءً على طلبه لتقديمها إلى <strong>{certificateDestination}</strong> دون أدنى مسؤولية مالية أو قانونية على الشركة تجاه حقوق الغير.
                </p>
                <p className="font-black pt-2">وتفضلوا بقبول فائق الاحترام والتقدير،،،</p>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs border-t-2 border-neutral-900">
                <div>
                  <span className="block text-neutral-500 mb-6 font-semibold">المدير الإداري ومسؤول الموارد البشرية</span>
                  <span className="font-black text-neutral-950">محمد زكريا</span>
                  <div className="text-[10px] text-neutral-400 font-mono mt-1">[ توقيع معتمد ]</div>
                </div>
                <div>
                  <span className="block text-neutral-500 mb-4 font-semibold">خاتم الشركة المعتمد</span>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-neutral-900 mx-auto flex flex-col items-center justify-center text-[10px] font-black rotate-12 select-none text-neutral-950">
                    <span>خاتم الإدارة</span>
                    <span className="text-[8px] font-mono">SEAL 2026</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
