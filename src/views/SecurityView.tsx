import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  Key,
  Lock,
  FileCheck,
  Clock,
  User,
  Server,
  Filter,
  Search,
  Printer,
  QrCode,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { DocumentVerificationModal } from '../components/DocumentVerificationModal';
import { downloadFile } from '../services/storage';

export const SecurityView: React.FC = () => {
  const { auditLogs, backupSystemData, restoreSystemData, isOnline, companyBranding } = useHR();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'payroll' | 'contract' | 'insurance' | 'onboarding' | 'employee' | 'security'>('all');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) restoreSystemData(content);
    };
    reader.readAsText(file);
  };

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.performedBy.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const exportAuditLogsCsv = () => {
    const headers = ['المعرف', 'نوع الإجراء', 'التصنيف', 'المنفذ', 'التفاصيل', 'التاريخ والوقت'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.action}"`,
      l.category || 'عام',
      `"${l.performedBy}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.createdAt
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(
      csv,
      `Audit_Trail_Report_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>أمان البيانات، النسخ الاحتياطي وسجل التدقيق المؤسسي</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ضمان الشفافية، الحماية من التزوير، وتتبع سجل العمليات الإدارية والمالية غير القابل للتعديل
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowVerifyModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>التحقق من صحة المستندات (QR Verifier)</span>
        </button>
      </div>

      {/* Security Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">تشفير البيانات والوثائق</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">تشفير AES-256 وأختام رقمية موثقة</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">حالة قاعدة البيانات</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {isOnline ? 'Firestore متصل ونشط' : 'قاعدة البيانات السحابية جاهزة'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">امتثال قانون العمل والتأمينات</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">قانون 12/2003 والتأمينات 148/2019</span>
          </div>
        </div>
      </div>

      {/* Backup Operations Card */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base">النسخ الاحتياطي الدوري للنظام والوثائق</h3>
            <p className="text-slate-300 text-xs mt-1 max-w-xl leading-relaxed">
              قم بإنشاء وتنزيل نسخة احتياطية مشفرة وشاملة تتضمن جميع بيانات الموظفين، مسوغات التعيين، مسيرات الرواتب وسجلات الحضور لضمان استمرارية الأعمال.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={backupSystemData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل نسخة احتياطية فورية</span>
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>استعادة من ملف</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Enterprise Audit Trail Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden space-y-4 p-5">
        
        {/* Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>سجل تدقيق العمليات الأمني والمحاسبي (Enterprise Audit Trail)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              سجل تدقيق رقمي غير قابل للتعديل (Immutable) يسجل كل حركة إدارية أو تعديل مالي بالوقت والمنفذ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditLogsCsv}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>طباعة تقرير التدقيق</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              الكل ({auditLogs.length})
            </button>
            <button
              onClick={() => setSelectedCategory('payroll')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'payroll'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              الرواتب والمالية
            </button>
            <button
              onClick={() => setSelectedCategory('contract')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'contract'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
              }`}
            >
              العقود والتجديد
            </button>
            <button
              onClick={() => setSelectedCategory('insurance')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'insurance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
              }`}
            >
              التأمينات (س1 / س2)
            </button>
            <button
              onClick={() => setSelectedCategory('onboarding')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'onboarding'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
              }`}
            >
              مسوغات التعيين
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث في سجل التدقيق..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 font-bold">
              <tr>
                <th className="px-4 py-3">نوع الإجراء</th>
                <th className="px-4 py-3">المستخدم المنفذ</th>
                <th className="px-4 py-3">التفاصيل والبيان الإداري</th>
                <th className="px-4 py-3">التصنيف</th>
                <th className="px-4 py-3">الوقت والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{log.action}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-semibold">
                    {log.performedBy}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-md">
                    {log.details}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md">
                      {log.category || 'عام'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Document Verification Modal */}
      {showVerifyModal && (
        <DocumentVerificationModal onClose={() => setShowVerifyModal(false)} />
      )}

    </div>
  );
};
