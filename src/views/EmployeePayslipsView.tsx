import React, { useState, useRef } from 'react';
import {
  CreditCard,
  Printer,
  Download,
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  QrCode,
  DollarSign,
  Loader2
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Payroll } from '../types';
import { downloadElementAsPdf } from '../utils/pdfExport';

export const EmployeePayslipsView: React.FC = () => {
  const {
    currentEmployee,
    currentUser,
    payrolls,
    companyBranding,
    setEmployeeFullScreenView,
    selectedPayslipForView,
    setSelectedPayslipForView
  } = useHR();

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
    iban: 'EG380002000100000099999999999',
    remainingLeaveDays: 21,
    casualLeaveDays: 6,
  };

  // Find all payslips belonging to this employee
  const myPayrolls = payrolls.filter(
    (p) => p.employeeId === emp.id || p.employeeName.toLowerCase().trim() === emp.fullName.toLowerCase().trim()
  );

  const [activePayslip, setActivePayslip] = useState<Payroll>(() => {
    if (selectedPayslipForView) return selectedPayslipForView;
    if (myPayrolls.length > 0) return myPayrolls[0];
    return {
      id: 'pay-sample',
      month: '2026-09',
      employeeId: emp.id,
      employeeName: emp.fullName,
      department: emp.department,
      jobTitle: emp.jobTitle,
      basicSalary: emp.basicSalary,
      housingAllowance: emp.housingAllowance,
      transportAllowance: emp.transportAllowance,
      overtimePay: 800,
      bonus: 1200,
      socialInsuranceEmployee: Math.round(emp.basicSalary * 0.11),
      socialInsuranceEmployer: Math.round(emp.basicSalary * 0.1875),
      gosiDeduction: Math.round(emp.basicSalary * 0.11),
      incomeTaxDeduction: 1250,
      martyrsFundDeduction: 15,
      absenceDeduction: 0,
      otherDeductions: 0,
      netSalary: Math.round(
        emp.basicSalary +
        emp.housingAllowance +
        emp.transportAllowance +
        800 +
        1200 -
        (emp.basicSalary * 0.11) -
        1250 -
        15
      ),
      status: 'paid',
      paymentMethod: 'تحويل بنكي مباشر (CIB/NBE)',
      createdAt: '2026-09-25',
      paidAt: '2026-09-27',
    };
  });

  const grossSalary =
    activePayslip.basicSalary +
    activePayslip.housingAllowance +
    activePayslip.transportAllowance +
    (activePayslip.overtimePay || 0) +
    (activePayslip.bonus || 0);

  const totalDeductions =
    (activePayslip.socialInsuranceEmployee || activePayslip.gosiDeduction || 0) +
    (activePayslip.incomeTaxDeduction || 0) +
    (activePayslip.martyrsFundDeduction || 0) +
    (activePayslip.absenceDeduction || 0) +
    (activePayslip.otherDeductions || 0);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!payslipRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const cleanMonth = (activePayslip.month || 'statement').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
      const fileName = `كشف_مرتب_${emp.employeeCode}_${cleanMonth}.pdf`;
      await downloadElementAsPdf(payslipRef.current, {
        fileName,
        orientation: 'portrait',
        marginMm: 8,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEmployeeFullScreenView('portal')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للبوابة</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>كشف مفردات المرتب الرسمي (Full Screen)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              بيان تفصيلي معتمد للأجر الأساسي والبدلات والاستقطاعات القانونية وفقاً للقانون المصري
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloadingPdf ? 'جارٍ تجهيز الـ PDF...' : 'تحميل كشف الراتب (PDF)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Net Salary */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md">
          <span className="text-xs font-medium text-emerald-100 block">صافي الراتب المحول</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black font-mono">
              {activePayslip.netSalary.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-emerald-100">ج.م</span>
          </div>
          <span className="text-[10px] text-emerald-200 mt-2 block font-medium">
            {activePayslip.paymentMethod || 'تحويل بنكي مباشر'}
          </span>
        </div>

        {/* Gross Salary */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">إجمالي الاستحقاقات</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {grossSalary.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block">
            الأساسي + البدلات + الحوافز
          </span>
        </div>

        {/* Social Insurance 11% */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">تأمينات الموظف (11%)</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
              -{(activePayslip.socialInsuranceEmployee || activePayslip.gosiDeduction || 0).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block">
            قانون التأمينات 148 لسنة 2019
          </span>
        </div>

        {/* Income Tax */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">ضريبة كسب العمل</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300 font-mono">
              -{(activePayslip.incomeTaxDeduction || 0).toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-slate-500">ج.م</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block">
            مصلحة الضرائب المصرية
          </span>
        </div>

      </div>

      {/* Main Official Payslip Certificate Sheet (Print Ready - Black & White Official Design) */}
      <div
        ref={payslipRef}
        data-pdf-content="payslip-sheet"
        className="bg-white rounded-3xl border-2 border-neutral-900 p-6 sm:p-10 shadow-lg text-neutral-950 space-y-6 printable-official-doc"
      >
        
        {/* Printable Official Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-neutral-900 gap-4">
          <div className="flex items-center gap-3.5">
            {companyBranding.logoUrl ? (
              <img
                src={companyBranding.logoUrl}
                alt={companyBranding.companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-neutral-400 grayscale"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-neutral-950 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {companyBranding.companyName ? companyBranding.companyName.trim()[0] : 'ش'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-950">
                  {companyBranding.companyName}
                </h2>
                <span className="text-[10px] font-bold border border-neutral-800 px-2 py-0.5 rounded font-mono">
                  وثيقة رسمية
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-medium">
                {companyBranding.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-600 mt-1 font-mono">
                {companyBranding.taxNumber && <span>رقم التسجيل الضريبي: {companyBranding.taxNumber}</span>}
                {companyBranding.commercialRecord && <span>• س.ت: {companyBranding.commercialRecord}</span>}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-neutral-100 p-3 rounded-2xl border border-neutral-300 font-mono text-xs">
            <span className="block text-neutral-500 text-[10px]">بيان مفردات مرتب شهر:</span>
            <span className="font-black text-neutral-950 text-base">{activePayslip.month}</span>
            <span className="block text-[10px] text-neutral-500 mt-1">تاريخ الإصدار: {activePayslip.createdAt}</span>
            <span className="block text-[9px] text-neutral-700 font-bold mt-0.5">معتمد للأغراض الرسمية والبنوك</span>
          </div>
        </div>

        {/* Employee Bio Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-300 text-xs">
          <div>
            <span className="text-neutral-500 block text-[11px]">اسم الموظف:</span>
            <span className="font-black text-neutral-950 text-sm">{emp.fullName}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[11px]">كود الموظف:</span>
            <span className="font-mono font-bold text-neutral-900">{emp.employeeCode}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[11px]">المسمى الوظيفي:</span>
            <span className="font-bold text-neutral-900">{emp.jobTitle}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[11px]">القسم / الإدارة:</span>
            <span className="font-bold text-neutral-900">{emp.department}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[11px]">الرقم القومي:</span>
            <span className="font-mono font-bold text-neutral-900">{emp.nationalId || '29301010101234'}</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[11px]">الرقم التأميني:</span>
            <span className="font-mono font-bold text-neutral-900">{emp.socialInsuranceNumber || '109847291'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-neutral-500 block text-[11px]">الحساب البنكي (IBAN):</span>
            <span className="font-mono text-[11px] font-bold text-neutral-900">{emp.iban || 'EG380002000100000099999999999'}</span>
          </div>
        </div>

        {/* Itemized Columns: Earnings vs Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Earnings (الاستحقاقات) */}
          <div className="border border-neutral-300 rounded-2xl overflow-hidden bg-white">
            <div className="bg-neutral-100 p-3 font-black text-neutral-950 border-b-2 border-neutral-900 flex justify-between">
              <span>البند (الاستحقاقات والأجر)</span>
              <span>المبلغ (ج.م)</span>
            </div>
            <div className="divide-y divide-neutral-200 p-3 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-neutral-800">الراتب الأساسي التأميني</span>
                <span className="font-mono font-bold text-neutral-950">{activePayslip.basicSalary.toLocaleString('ar-EG')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-800">بدل السكن</span>
                <span className="font-mono font-bold text-neutral-950">{activePayslip.housingAllowance.toLocaleString('ar-EG')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-800">بدل الانتقال والمواصلات</span>
                <span className="font-mono font-bold text-neutral-950">{activePayslip.transportAllowance.toLocaleString('ar-EG')}</span>
              </div>
              {activePayslip.overtimePay > 0 && (
                <div className="flex justify-between py-1 text-neutral-950 font-bold">
                  <span>أجر ساعات عمل إضافية (Overtime)</span>
                  <span className="font-mono font-bold">+{activePayslip.overtimePay.toLocaleString('ar-EG')}</span>
                </div>
              )}
              {activePayslip.bonus > 0 && (
                <div className="flex justify-between py-1 text-neutral-950 font-bold">
                  <span>حوافز ومكافأة تميز</span>
                  <span className="font-mono font-bold">+{activePayslip.bonus.toLocaleString('ar-EG')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-neutral-900 font-black text-neutral-950">
                <span>إجمالي الاستحقاقات:</span>
                <span className="font-mono">{grossSalary.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          </div>

          {/* Deductions (الاستقطاعات) */}
          <div className="border border-neutral-300 rounded-2xl overflow-hidden bg-white">
            <div className="bg-neutral-100 p-3 font-black text-neutral-950 border-b-2 border-neutral-900 flex justify-between">
              <span>البند (الاستقطاعات القانونية)</span>
              <span>المبلغ (ج.م)</span>
            </div>
            <div className="divide-y divide-neutral-200 p-3 space-y-2">
              <div className="flex justify-between py-1 text-neutral-900">
                <span>تأمينات اجتماعية - حصة العامل (11%)</span>
                <span className="font-mono font-bold">-{(activePayslip.socialInsuranceEmployee || activePayslip.gosiDeduction || 0).toLocaleString('ar-EG')}</span>
              </div>
              <div className="flex justify-between py-1 text-neutral-800">
                <span>ضريبة كسب العمل المستقطعة</span>
                <span className="font-mono font-bold">-{(activePayslip.incomeTaxDeduction || 0).toLocaleString('ar-EG')}</span>
              </div>
              <div className="flex justify-between py-1 text-neutral-700">
                <span>صندوق تكريم الشهداء والضحايا (قانون 4/2021)</span>
                <span className="font-mono font-bold">-{(activePayslip.martyrsFundDeduction || 10).toLocaleString('ar-EG')}</span>
              </div>
              {activePayslip.absenceDeduction > 0 && (
                <div className="flex justify-between py-1 text-neutral-900 font-semibold">
                  <span>خصومات غياب أو تأخير</span>
                  <span className="font-mono font-bold">-{activePayslip.absenceDeduction.toLocaleString('ar-EG')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-neutral-900 font-black text-neutral-950">
                <span>إجمالي الاستقطاعات:</span>
                <span className="font-mono">-{totalDeductions.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          </div>

        </div>

        {/* Net Salary Callout Box in Black and White */}
        <div className="p-4 sm:p-5 bg-neutral-100 rounded-2xl border-2 border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-neutral-700 block">صافي المبلغ المستحق صرفه بحسابكم البنكي:</span>
            <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono mt-0.5">
              {activePayslip.netSalary.toLocaleString('ar-EG')} جنيه مصري
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block mt-1">طريقة الصرف: {activePayslip.paymentMethod || 'تحويل بنكي مباشر'}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl border border-neutral-300 text-center">
              <QrCode className="w-10 h-10 text-neutral-950 mx-auto" />
              <span className="text-[8px] text-neutral-500 font-mono block mt-0.5">رمز التحقق الإلكتروني</span>
            </div>

            {/* Official Circular Seal */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-neutral-900 flex flex-col items-center justify-center text-center p-1 text-neutral-900 transform rotate-3 select-none">
              <span className="text-[8px] font-black leading-tight">معتمد رسمياً</span>
              <span className="text-[7px] font-mono mt-0.5">PAYROLL EG</span>
              <span className="text-[7px] font-mono">2026</span>
            </div>

            <div className="text-left text-xs font-serif italic text-neutral-600 border-l border-neutral-300 pl-3">
              <p className="font-bold text-neutral-900">إدارة الموارد البشرية والرواتب</p>
              <p className="text-[10px]">{companyBranding.companyName}</p>
              <p className="text-[9px] text-neutral-800 font-bold">وثيقة إلكترونية معتمدة</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
