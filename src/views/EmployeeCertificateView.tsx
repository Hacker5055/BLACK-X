import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  ArrowRight,
  Building2,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Calendar,
  UserCheck,
  Loader2,
  Copy
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { downloadElementAsPdf } from '../utils/pdfExport';
import { generateVerificationHash, generateQrCodeDataUrl } from '../utils/verification';

export const EmployeeCertificateView: React.FC = () => {
  const {
    currentEmployee,
    currentUser,
    companyBranding,
    setEmployeeFullScreenView
  } = useHR();

  const emp = currentEmployee || {
    id: 'emp-current',
    employeeCode: 'EMP-EG-001',
    fullName: currentUser?.displayName || 'يوسف عبد الرحمن إبراهيم',
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
  };

  const [destination, setDestination] = useState('البنك الأهلي المصري (NBE) - لطلب تمويل شخصي');
  const [includeAllowances, setIncludeAllowances] = useState(true);

  // Dynamic Verification Hash & QR Code
  const verificationHash = useMemo(() => generateVerificationHash('CERT'), [emp.employeeCode]);
  const qrCodeUrl = useMemo(() => generateQrCodeDataUrl(`https://hrms.nile.eg/verify?hash=${verificationHash}&emp=${emp.employeeCode}&type=salary_cert`), [verificationHash, emp.employeeCode]);

  const grossSalary = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances;
  const netSalary = Math.round(grossSalary - (emp.basicSalary * 0.11) - 1200);

  const todayStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const fileName = `شهادة_راتب_معتمدة_${emp.employeeCode}.pdf`;
      await downloadElementAsPdf(certificateRef.current, {
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
      
      {/* Top Breadcrumb & Actions Bar */}
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
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>شهادة تعريف وتثبيت الراتب الرسمية (Full Screen)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              خطاب رسمي موجه ومعتمد ومختوم بالشعار لتقديمه للبنوك والسفارات والجهات الحكومية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloadingPdf ? 'جارٍ تجهيز الـ PDF...' : 'تحميل الشهادة (PDF)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الشهادة</span>
          </button>
        </div>
      </div>

      {/* Destination Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
          تخصيص الجهة الموجه إليها الخطاب:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            'البنك الأهلي المصري (NBE) - لطلب تمويل شخصي',
            'بنك مصر (Banque Misr) - لطلب بطاقة ائتمان',
            'البنك التجاري الدولي (CIB) - لفتح حساب مصرفي',
            'السفارة والقنصلية العامة - لطلب تأشيرة سفر',
            'الهيئة القومية للتأمين الاجتماعي',
            'إلى من يهمه الأمر (To Whom It May Concern)',
          ].map((dest) => (
            <button
              key={dest}
              onClick={() => setDestination(dest)}
              className={`p-3 rounded-2xl text-right text-xs font-bold border transition-all cursor-pointer ${
                destination === dest
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Official A4-Style Printable Letterhead Certificate (Formal Black & White Design) */}
      <div
        ref={certificateRef}
        data-pdf-content="salary-certificate-sheet"
        className="bg-white rounded-3xl border-2 border-neutral-900 p-8 sm:p-14 shadow-2xl max-w-4xl mx-auto text-neutral-950 space-y-8 relative overflow-hidden printable-official-doc"
      >
        
        {/* Subtle Watermark Stamp */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none text-center">
          <div className="w-80 h-80 rounded-full border-8 border-neutral-950 flex items-center justify-center font-black text-4xl">
            {companyBranding.companyName}
          </div>
        </div>

        {/* Company Header */}
        <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-6">
          <div className="flex items-center gap-4">
            {companyBranding.logoUrl ? (
              <img
                src={companyBranding.logoUrl}
                alt={companyBranding.companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-neutral-400 grayscale shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-neutral-950 text-white font-black text-2xl flex items-center justify-center">
                {companyBranding.companyName ? companyBranding.companyName.trim()[0] : 'ش'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-950">
                  {companyBranding.companyName}
                </h2>
                <span className="text-[10px] font-bold border border-neutral-800 px-2 py-0.5 rounded font-mono">
                  إدارة الموارد البشرية
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-medium">
                {companyBranding.subtitle}
              </p>
              <div className="text-[11px] text-neutral-500 font-mono mt-1">
                سجل تجاري: {companyBranding.commercialRecord || '194820'} • بطاقة ضريبية: {companyBranding.taxNumber || '100-293-847'}
              </div>
            </div>
          </div>

          <div className="text-left font-mono text-xs text-neutral-600">
            <div>التاريخ: {todayStr}</div>
            <div>رقم الإشارة: HR-CERT-{Date.now().toString().slice(-6)}</div>
            <div className="text-neutral-900 font-bold mt-1">طراز: شهادة معتمدة موجهة</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 py-2">
          <h2 className="text-2xl font-black text-neutral-950 underline underline-offset-8 decoration-neutral-900">
            شهادة بيان وتثبيت راتب
          </h2>
          <p className="text-sm font-black text-neutral-900 border-b border-neutral-300 pb-2 inline-block">
            عناية السادة / {destination}
          </p>
        </div>

        {/* Legal Body Statement */}
        <div className="text-sm sm:text-base leading-loose text-neutral-900 space-y-4 text-justify font-['Cairo']">
          <p className="font-bold">
            تحية طيبة وبعد ،،،
          </p>
          <p>
            تشهد إدارة الموارد البشرية بشركة <strong>{companyBranding.companyName}</strong> بأن السيد / 
            <span className="font-black text-neutral-950 mx-1.5 text-lg underline">{emp.fullName}</span> 
            مصري الجنسية، ويحمل بطاقة رقم قومي رقم (<span className="font-mono font-black">{emp.nationalId || '29301010101234'}</span>)، 
            ورقماً تأمينياً (<span className="font-mono font-bold">{emp.socialInsuranceNumber || '109847291'}</span>)، يعمل طرفنا بالشركة وتحت كفالتها 
            بوظيفة (<strong>{emp.jobTitle}</strong>) في قسم (<strong>{emp.department}</strong>)، وذلك اعتباراً من تاريخ تعيينه في 
            <span className="font-mono font-bold mx-1">({emp.hireDate})</span> وحتى تاريخه، وما زال على رأس العمل بعقد عمل سارٍ ومستمر.
          </p>
          
          <p>
            ونفيد سيادتكم بأن إجمالي الراتب الشهري والبدلات المقررة لسيادته مفصلة كالتالي:
          </p>
        </div>

        {/* Financial Table in Certificate */}
        <div className="border-2 border-neutral-900 rounded-2xl overflow-hidden my-6">
          <table className="w-full text-xs sm:text-sm text-right">
            <thead className="bg-neutral-100 text-neutral-950 font-black border-b-2 border-neutral-900">
              <tr>
                <th className="p-3">بيان مفردات الراتب</th>
                <th className="p-3">المبلغ بالأرقام</th>
                <th className="p-3">المبلغ كتابة بالجنيه المصري</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="p-3 font-semibold text-neutral-800">الراتب الأساسي التأميني</td>
                <td className="p-3 font-mono font-bold text-neutral-950">{emp.basicSalary.toLocaleString('ar-EG')} ج.م</td>
                <td className="p-3 text-neutral-600">فقط ثمانية عشر ألف جنيه مصري لا غير</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-neutral-800">بدل سكن وبدل انتقال</td>
                <td className="p-3 font-mono font-bold text-neutral-950">{(emp.housingAllowance + emp.transportAllowance).toLocaleString('ar-EG')} ج.م</td>
                <td className="p-3 text-neutral-600">فقط أربعة آلاف وخمسمائة جنيه مصري لا غير</td>
              </tr>
              <tr className="bg-neutral-100 font-black border-t-2 border-neutral-900">
                <td className="p-3 text-neutral-950">صافي الراتب الشهري المحول بنكياً</td>
                <td className="p-3 font-mono text-base text-neutral-950">{netSalary.toLocaleString('ar-EG')} ج.م</td>
                <td className="p-3 text-neutral-900 font-medium">محول بحساب رقم ({emp.iban || 'EG380002000100000099999999999'})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Disclaimer Paragraph */}
        <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-2">
          <p>
            وقد أُعطيت له هذه الشهادة بناءً على طلبه لتقديمها إلى <strong>{destination}</strong> دون أدنى مسؤولية مالية أو قانونية على الشركة في مواجهة الغير أو أي التزامات قد تنشأ عن ذلك.
          </p>
          <p className="font-black text-neutral-950 pt-2">
            وتفضلوا بقبول فائق الاحترام والتقدير ،،،
          </p>
        </div>

        {/* Official Signatures & Seal */}
        <div className="pt-8 border-t-2 border-neutral-900 flex items-center justify-between gap-6">
          <div className="text-center space-y-1">
            <span className="block text-xs font-bold text-neutral-500">مسؤول شؤون الموظفين (HR)</span>
            <span className="font-serif italic text-sm font-bold text-neutral-900">سارة أحمد الشريف</span>
            <div className="text-[10px] text-neutral-400 mt-2 font-mono">[ توقيع معتمد ]</div>
          </div>

          {/* Official Stamp in Black Ink */}
          <div className="relative w-28 h-28 rounded-full border-4 border-dashed border-neutral-900 flex flex-col items-center justify-center text-center p-2 text-neutral-950 transform -rotate-3 select-none">
            <Building2 className="w-5 h-5 mb-0.5 text-neutral-950" />
            <span className="text-[8px] font-black leading-tight uppercase">{companyBranding.companyName}</span>
            <span className="text-[7px] font-mono mt-0.5">SEAL & APPROVED</span>
            <span className="text-[7px] font-mono font-bold">2026</span>
          </div>

          <div className="text-center space-y-1">
            <span className="block text-xs font-bold text-neutral-500">المدير العام المفوض</span>
            <span className="font-serif italic text-sm font-bold text-neutral-900">محمد زكريا</span>
            <div className="text-[10px] text-neutral-400 mt-2 font-mono">[ اعتماد الإدارة ]</div>
          </div>
        </div>

        {/* QR Code Validation Footer */}
        <div className="pt-4 border-t border-neutral-300 flex items-center justify-between text-[11px] text-neutral-700">
          <div className="flex items-center gap-3">
            <img src={qrCodeUrl} alt="QR Verification" className="w-12 h-12 border border-neutral-900 p-0.5" />
            <div>
              <p className="font-mono font-bold text-neutral-950">كود التحقق الرقمي: {verificationHash}</p>
              <span className="text-[10px] text-neutral-600 block">يمكن للمصارف والسفارات مسح الرمز للتحقق الفوري من صحة هذه الشهادة إلكترونياً</span>
            </div>
          </div>
          <span className="font-mono text-[10px]">المقر: {companyBranding.address || 'القاهرة - التجمع الخامس'}</span>
        </div>

      </div>

    </div>
  );
};
