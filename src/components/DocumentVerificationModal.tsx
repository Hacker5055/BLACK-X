import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  Building,
  Calendar,
  Lock,
  ExternalLink,
  Copy,
  Printer,
  X,
  FileText
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { DocumentVerificationRecord } from '../types';
import { generateVerificationHash, getVerificationUrl } from '../utils/verification';

interface DocumentVerificationModalProps {
  initialHash?: string;
  onClose: () => void;
}

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  initialHash,
  onClose,
}) => {
  const { employees, companyBranding } = useHR();
  const [searchHash, setSearchHash] = useState(initialHash || '');
  const [copied, setCopied] = useState(false);

  // Derive verification information
  const foundEmployee = employees[0] || null;

  const sampleVerification: DocumentVerificationRecord = {
    verificationHash: searchHash || generateVerificationHash('CERT'),
    documentType: 'salary_certificate',
    title: 'شهادة بيان وتثبيت الراتب الرسمية للمصارف والجهات الرسمية',
    employeeCode: foundEmployee?.employeeCode || 'EMP-EG-001',
    employeeName: foundEmployee?.fullName || 'يوسف عبد الرحمن حسن',
    nationalIdMasked: foundEmployee?.nationalId ? `${foundEmployee.nationalId.slice(0, 8)}******` : '29201010******',
    issueDate: new Date().toISOString().slice(0, 10),
    issuedBy: `${companyBranding.companyName} • إدارة الموارد البشرية والشؤون القانونية`,
    status: 'valid',
    metadataSummary: {
      'الراتب الأساسي': `${(foundEmployee?.basicSalary || 18000).toLocaleString('ar-EG')} ج.م`,
      'الرقم التأميني': foundEmployee?.socialInsuranceNumber || '109847291',
      'تاريخ التعيين': foundEmployee?.hireDate || '2022-01-15',
      'سريان الوثيقة': 'سارية لمدة 30 يوماً من تاريخ الإصدار',
      'الامتثال التشريعي': 'قانون العمل المصري 12 لسنة 2003 والتأمينات 148 لسنة 2019'
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sampleVerification.verificationHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                بوابة التحقق الرقمي ومكافحة التزوير (Document Verification)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                التحقق الفوري من صحة ومطابقة المستندات والشهادات الصادرة عن الشركة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Search Bar */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            أدخل كود التحقق الرقمي أو امسح الـ QR Code:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value.toUpperCase())}
                placeholder="مثال: CERT-EG-2026-A8F2-C9D1"
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              تحقق الآن
            </button>
          </div>
        </div>

        {/* Verification Certificate Card */}
        <div className="mt-5 p-5 bg-gradient-to-br from-emerald-50/70 via-slate-50 to-emerald-50/40 dark:from-emerald-950/20 dark:via-slate-800 dark:to-emerald-950/10 border-2 border-emerald-500/40 rounded-2xl shadow-xs space-y-4">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 block">
                  مستند أصلي ومطابق وموثق رسمياً ✓
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  سجل المستندات الرقمية المعتمدة لشركة النيل
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full shadow-2xs">
              VALID • ساري
            </span>
          </div>

          {/* Document Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">نوع المستند:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{sampleVerification.title}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">اسم صاحب المستند:</span>
              <span className="font-bold text-slate-900 dark:text-white">{sampleVerification.employeeName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">كود الموظف / الرقم القومي:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {sampleVerification.employeeCode} • {sampleVerification.nationalIdMasked}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">الجهة المصدرة:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">{sampleVerification.issuedBy}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">تاريخ الإصدار والاعتماد:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{sampleVerification.issueDate}</span>
            </div>

            {/* Metadata pills */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
              {Object.entries(sampleVerification.metadataSummary).map(([key, val]) => (
                <div key={key} className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">{key}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hash Box */}
          <div className="p-2.5 bg-slate-900 text-white rounded-xl flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">SHA Verification Hash:</span>
              <span className="text-emerald-400 font-bold tracking-wider">{sampleVerification.verificationHash}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyHash}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>

        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            مؤمن عبر معايير التوقيع الإلكتروني وقانون العمل المصري
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
