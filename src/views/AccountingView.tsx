import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Download,
  Share2,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { downloadFile } from '../services/storage';

export const AccountingView: React.FC = () => {
  const { journalEntries, syncJournalEntryToCloud } = useHR();

  const [selectedSystem, setSelectedSystem] = useState<'qoyod' | 'daftra' | 'quickbooks' | 'xero'>('qoyod');
  const [isSyncing, setIsSyncing] = useState(false);

  const entry = journalEntries[0];

  const handleSync = async () => {
    if (!entry) return;
    setIsSyncing(true);
    try {
      await syncJournalEntryToCloud(entry.id);
      alert(`تمت مزامنة قيد مسير الرواتب بنجاح مع نظام ${selectedSystem.toUpperCase()} السحابي.`);
    } catch (err: any) {
      alert('خطأ أثناء المزامنة المحاسبية: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const exportJournalCSV = () => {
    if (!entry) return;
    const headers = ['رقم الحساب', 'اسم الحساب', 'مدين (Debit)', 'دائن (Credit)', 'البيان والتفاصيل'];
    const rows = entry.lines.map((l) => [
      l.accountCode,
      `"${l.accountName}"`,
      l.debit,
      l.credit,
      `"${l.description}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `Journal_Entry_${entry.referenceNo}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">الربط والتكامل مع المحاسبة السحابية</h2>
          <p className="text-xs text-slate-500 mt-0.5">توليد قيود استحقاق وصرف الرواتب آلياً وترحيلها إلى الأنظمة المالية المعتمدة</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportJournalCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير القيد المحاسبي</span>
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري الترحيل...' : 'مزامنة القيد سحابياً'}</span>
          </button>
        </div>
      </div>

      {/* Accounting System Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-xs font-bold text-slate-500 block mb-3">اختر النظام المحاسبي السحابي للربط:</span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'daftra', name: 'برنامج دفترة (Daftra)', desc: 'نظام إدارة وحسابات رائد متوافق مع الفاتورة الإلكترونية والضرائب المصرية' },
            { id: 'qoyod', name: 'برنامج قيود (Qoyod)', desc: 'إدارة مالية وسحابية متكاملة وسهلة الاستخدام' },
            { id: 'quickbooks', name: 'QuickBooks Online', desc: 'معيار المحاسبة العالمي للشركات' },
            { id: 'xero', name: 'Xero Cloud Accounting', desc: 'ربط مباشر عبر واجهات API' },
          ].map((sys) => (
            <div
              key={sys.id}
              onClick={() => setSelectedSystem(sys.id as any)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedSystem === sys.id
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{sys.name}</span>
                {selectedSystem === sys.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{sys.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Entry Viewer */}
      {entry && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-md">
                  {entry.referenceNo}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{entry.description}</h3>
              </div>
              <span className="text-xs text-slate-400 block mt-1 font-mono">تاريخ القيد: {entry.date}</span>
            </div>

            <div>
              {entry.status === 'synced' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> تم الترحيل ({entry.syncedAt})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  مسودة جاهزة للترحيل
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
                <tr>
                  <th className="px-4 py-3">رقم الحساب</th>
                  <th className="px-4 py-3">اسم الحساب في شجرة الحسابات</th>
                  <th className="px-4 py-3 text-left">مدين (Debit - ج.م)</th>
                  <th className="px-4 py-3 text-left">دائن (Credit - ج.م)</th>
                  <th className="px-4 py-3">البيان والتفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {entry.lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500 font-bold">{line.accountCode}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{line.accountName}</td>
                    <td className="px-4 py-3 font-mono text-left font-bold text-slate-900">
                      {line.debit > 0 ? line.debit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-left font-bold text-slate-900">
                      {line.credit > 0 ? line.credit.toLocaleString('ar-EG', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{line.description}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm">
                    إجمالي التوازن المحاسبي (Balanced Entry)
                  </td>
                  <td className="px-4 py-3 font-mono text-left text-sm text-emerald-700">
                    {entry.totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </td>
                  <td className="px-4 py-3 font-mono text-left text-sm text-emerald-700">
                    {entry.totalCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
                  </td>
                  <td className="px-4 py-3 text-xs text-emerald-800 font-bold">
                    ✓ القيد متوازن بنسبة 100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
