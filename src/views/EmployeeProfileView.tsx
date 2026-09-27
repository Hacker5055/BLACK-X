import React, { useState, useRef } from 'react';
import {
  User,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  Mail,
  Phone,
  Calendar,
  FileText,
  Briefcase,
  CheckCircle2,
  Lock,
  Printer,
  Download,
  Loader2,
  Camera
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { downloadElementAsPdf } from '../utils/pdfExport';
import { PhotoUploadModal } from '../components/PhotoUploadModal';

export const EmployeeProfileView: React.FC = () => {
  const {
    currentEmployee,
    currentUser,
    companyBranding,
    updateEmployee,
    setEmployeeFullScreenView
  } = useHR();

  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const emp = currentEmployee || {
    id: 'emp-current',
    employeeCode: 'EMP-EG-001',
    fullName: currentUser?.displayName || 'يوسف عبد الرحمن حسن',
    email: currentUser?.email || 'employee@company.eg',
    phone: '+20 10 1234 5678',
    department: 'الهندسة والتقنية',
    jobTitle: 'أخصائي تطوير ونظم أول',
    basicSalary: 18000,
    housingAllowance: 3000,
    transportAllowance: 1500,
    otherAllowances: 1000,
    hireDate: '2023-01-15',
    status: 'active' as const,
    nationalId: '29301010101234',
    socialInsuranceNumber: '109847291',
    iban: 'EG380002000100000099999999999',
    remainingLeaveDays: 21,
    casualLeaveDays: 6,
  };

  const grossSalary = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances;

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!profileRef.current) return;
    setIsDownloadingPdf(true);
    try {
      await downloadElementAsPdf(profileRef.current, {
        fileName: `الملف_الوظيفي_${emp.employeeCode}.pdf`,
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
              <User className="w-5 h-5 text-emerald-600" />
              <span>ملفي وبياناتي الوظيفية المسجلة (Full Screen)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              البيانات الرسمية المعتمدة لدى إدارة الموارد البشرية ومكتب التأمينات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloadingPdf ? 'جارٍ التحميل...' : 'تحميل الملف (PDF)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      <div ref={profileRef} data-pdf-content="employee-profile" className="space-y-6 printable-official-doc">

      {/* Official Black & White Header for PDF & Print */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-neutral-900 pb-4 text-neutral-950 font-mono text-xs">
        <div>
          <h2 className="text-base font-black">بيان السيرة الوظيفية وبيانات العامل الرسمية</h2>
          <span className="text-[10px] text-neutral-600">منظومة الموارد البشرية • كود الموظف: {emp.employeeCode}</span>
        </div>
        <div className="text-left">
          <span>التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
          <span className="block font-bold">نسخة معتمدة (أبيض وأسود)</span>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group/avatar">
          {emp.avatar ? (
            <img
              src={emp.avatar}
              alt={emp.fullName}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur border-4 border-white/20 flex items-center justify-center font-black text-4xl shadow-md">
              {emp.fullName ? emp.fullName.trim()[0] : 'م'}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPhotoModal(true)}
            className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-white transition-opacity cursor-pointer"
            title="تحديث أو رفع صورة جديدة"
          >
            <Camera className="w-5 h-5" />
            <span>تغيير الصورة</span>
          </button>
        </div>

        <div className="text-center sm:text-right space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-2xl font-black">{emp.fullName}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono font-bold">
              {emp.employeeCode}
            </span>
          </div>
          <p className="text-emerald-200 text-sm font-medium">
            {emp.jobTitle} • {emp.department}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-emerald-300/80 pt-2 font-mono">
            <span>البريد: {emp.email}</span>
            <span>•</span>
            <span>الهاتف: {emp.phone}</span>
          </div>
        </div>
      </div>

      {/* Grid of Official Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal & Legal Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>البيانات الشخصية والرقم القومي</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">الاسم الرباعي الرسمي:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{emp.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">الرقم القومي المصري (14 رقم):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{emp.nationalId || '29301010101234'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">الرقم التأميني (مكتب التأمينات):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{emp.socialInsuranceNumber || '109847291'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">رقم الهاتف المسجل:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{emp.phone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">البريد الإلكتروني للعمل:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{emp.email}</span>
            </div>
          </div>
        </div>

        {/* Contract & Employment Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>بيانات العقد والتعيين</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">القسم / الإدارة:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{emp.department}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">المسمى الوظيفي:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{emp.jobTitle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">تاريخ استلام العمل (التعيين):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{emp.hireDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">نوع العقد:</span>
              <span className="font-bold text-emerald-600">عقد عمل محدد/غير محدد المدة سارٍ</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">حالة الموظف:</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-md font-bold text-[10px]">
                على رأس العمل (نشط)
              </span>
            </div>
          </div>
        </div>

        {/* Financial & Banking Information */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>البيانات المالية والحساب البنكي لتحويل المرتب</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 block">الراتب الأساسي</span>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1 block">
                {emp.basicSalary.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 block">إجمالي البدلات (سكن + انتقال)</span>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1 block">
                {(emp.housingAllowance + emp.transportAllowance).toLocaleString('ar-EG')} ج.م
              </span>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-bold">الراتب الإجمالي</span>
              <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
                {grossSalary.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">رقم الحساب المصرفي الدولي (IBAN) للتحويل الآلي:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{emp.iban || 'EG380002000100000099999999999'}</span>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-xl font-bold text-[11px] self-start sm:self-center">
              تحويل بنكي مباشر (CIB/NBE)
            </span>
          </div>
        </div>

      </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <PhotoUploadModal
          currentAvatar={emp.avatar}
          employeeName={emp.fullName}
          onSaveAvatar={(avatarUrl) => {
            updateEmployee(emp.id, { avatar: avatarUrl });
            setShowPhotoModal(false);
          }}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

    </div>
  );
};
