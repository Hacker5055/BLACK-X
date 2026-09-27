import React, { useState, useRef } from 'react';
import {
  CreditCard,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Printer,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building,
  QrCode,
  X,
  FileCheck,
  Scale,
  Loader2
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Payroll } from '../types';
import { generateWPSContent, exportPayrollToCSV, downloadFile } from '../services/storage';
import { downloadElementAsPdf } from '../utils/pdfExport';

export const PayrollView: React.FC = () => {
  const { payrolls, employees, generateMonthlyPayroll, markPayrollPaid, companyBranding } = useHR();

  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [activePayslip, setActivePayslip] = useState<Payroll | null>(null);

  const monthPayrolls = payrolls.filter((p) => p.month === selectedMonth);

  // Financial totals in EGP
  const totalBasic = monthPayrolls.reduce((sum, p) => sum + p.basicSalary, 0);
  const totalHousing = monthPayrolls.reduce((sum, p) => sum + p.housingAllowance, 0);
  const totalTransport = monthPayrolls.reduce((sum, p) => sum + p.transportAllowance, 0);
  const totalInsurance = monthPayrolls.reduce((sum, p) => sum + (p.socialInsuranceEmployee || p.gosiDeduction || 0), 0);
  const totalTax = monthPayrolls.reduce((sum, p) => sum + (p.incomeTaxDeduction || 0), 0);
  const totalOvertime = monthPayrolls.reduce((sum, p) => sum + p.overtimePay + p.bonus, 0);
  const totalNet = monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const handleGenerate = () => {
    generateMonthlyPayroll(selectedMonth);
  };

  const handleDownloadWPS = () => {
    const wpsContent = generateWPSContent(monthPayrolls, employees);
    downloadFile(wpsContent, `Bank_Payroll_ACH_${selectedMonth.replace('-', '')}.txt`, 'text/plain;charset=utf-8;');
  };

  const handleExportCSV = () => {
    const csv = exportPayrollToCSV(monthPayrolls);
    downloadFile(csv, `Payroll_${selectedMonth}_EGP.csv`, 'text/csv;charset=utf-8;');
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const payslipModalRef = useRef<HTMLDivElement>(null);

  const handlePrintPayslip = () => {
    window.print();
  };

  const handleDownloadPayslipPdf = async () => {
    if (!payslipModalRef.current || !activePayslip) return;
    setIsDownloadingPdf(true);
    try {
      const cleanMonth = (activePayslip.month || 'statement').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
      const emp = employees.find((e) => e.id === activePayslip.employeeId);
      const code = emp?.employeeCode || activePayslip.employeeId;
      const fileName = `مفردات_مرتب_${code}_${cleanMonth}.pdf`;
      await downloadElementAsPdf(payslipModalRef.current, {
        fileName,
        orientation: 'portrait',
        marginMm: 6,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">مسيرات الرواتب والأجور (بالجنيه المصري EGP)</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              قانون التأمينات 148 لسنة 2019
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            احتساب التأمينات الاجتماعية (11%)، ضريبة كسب العمل، الأوفر تايم (المادة 85)، وإصدار قسائم الرواتب
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            توليد واحتساب مسير الشهر
          </button>

          <button
            onClick={handleDownloadWPS}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            title="تنزيل ملف صرف المرتبات البنكي المعتمد للبنوك المصرية (CIB / الأهلي / بنك مصر)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ملف الصرف البنكي (ACH)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            title="تصدير جدول الرواتب بصيغة CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">إجمالي الأساسي</span>
          <span className="text-base font-extrabold text-slate-900 font-mono mt-1 block">
            {totalBasic.toLocaleString('ar-EG')} <small className="text-[10px] text-slate-500">ج.م</small>
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">بدلات السكن والانتقال</span>
          <span className="text-base font-extrabold text-slate-900 font-mono mt-1 block">
            {(totalHousing + totalTransport).toLocaleString('ar-EG')} <small className="text-[10px] text-slate-500">ج.م</small>
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">إضافي ومكافآت (Overtime)</span>
          <span className="text-base font-extrabold text-emerald-600 font-mono mt-1 block">
            +{totalOvertime.toLocaleString('ar-EG')} <small className="text-[10px] text-emerald-700">ج.م</small>
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">تأمينات اجتماعية (11%)</span>
          <span className="text-base font-extrabold text-rose-600 font-mono mt-1 block">
            -{totalInsurance.toLocaleString('ar-EG')} <small className="text-[10px] text-rose-700">ج.م</small>
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block">ضريبة كسب العمل</span>
          <span className="text-base font-extrabold text-rose-700 font-mono mt-1 block">
            -{totalTax.toLocaleString('ar-EG')} <small className="text-[10px] text-rose-600">ج.م</small>
          </span>
        </div>

        <div className="bg-emerald-900 text-white p-3.5 rounded-xl border border-emerald-800 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-300 block">صافي الرواتب واجبة الصرف</span>
          <span className="text-lg font-black font-mono mt-0.5 block truncate">
            {totalNet.toLocaleString('ar-EG')} <small className="text-[10px] text-emerald-300">ج.م</small>
          </span>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            كشف مسير رواتب شهر ({selectedMonth}) - عدد {monthPayrolls.length} موظف
          </h3>
          <span className="text-xs text-slate-500 font-medium">الحد الأدنى للأجور 6,000 ج.م • مطابقة ضريبية وتأمينية</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
              <tr>
                <th className="px-4 py-3">الموظف</th>
                <th className="px-4 py-3">القسم / المسمى</th>
                <th className="px-4 py-3">الأساسي</th>
                <th className="px-4 py-3">بدل السكن</th>
                <th className="px-4 py-3">بدل الانتقال</th>
                <th className="px-4 py-3">إضافي ومكافأة</th>
                <th className="px-4 py-3">تأمينات 11%</th>
                <th className="px-4 py-3">ضريبة الدخل</th>
                <th className="px-4 py-3">صافي المرتب</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {monthPayrolls.map((p) => {
                const insuranceAmount = p.socialInsuranceEmployee || p.gosiDeduction || 0;
                const taxAmount = p.incomeTaxDeduction || 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{p.employeeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.employeeId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-800 block">{p.jobTitle}</span>
                      <span className="text-[10px] text-slate-400">{p.department}</span>
                    </td>
                    <td className="px-4 py-3 font-mono">{p.basicSalary.toLocaleString('ar-EG')} ج.م</td>
                    <td className="px-4 py-3 font-mono">{p.housingAllowance.toLocaleString('ar-EG')} ج.م</td>
                    <td className="px-4 py-3 font-mono">{p.transportAllowance.toLocaleString('ar-EG')} ج.م</td>
                    <td className="px-4 py-3 font-mono text-emerald-700">
                      {p.overtimePay + p.bonus > 0 ? `+${(p.overtimePay + p.bonus).toLocaleString('ar-EG')}` : '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-rose-600">
                      -{insuranceAmount.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="px-4 py-3 font-mono text-rose-700">
                      -{taxAmount.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="px-4 py-3 font-mono font-black text-slate-900 text-sm">
                      {p.netSalary.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> تم التحويل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                          معتمد للصرف
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActivePayslip(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                          title="عرض مفردات المرتب الرقمية الرسمية"
                        >
                          قسيمة الراتب
                        </button>

                        {p.status !== 'paid' && (
                          <button
                            onClick={() => markPayrollPaid(p.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                            title="تأكيد التحويل البنكي والصرف"
                          >
                            صرف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Payslip Modal (Ready for print/export in Egypt) */}
      {activePayslip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            ref={payslipModalRef}
            data-pdf-content="admin-payslip-sheet"
            className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border-2 border-neutral-800 text-neutral-900 print:p-0 print:border-none print:shadow-none"
          >
            
            {/* Header with Company Identity */}
            <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  {companyBranding.logoUrl ? (
                    <img
                      src={companyBranding.logoUrl}
                      alt={companyBranding.companyName}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-400 grayscale"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xl">
                      {companyBranding.companyName ? companyBranding.companyName.trim()[0] : 'م'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-black text-neutral-950">{companyBranding.companyName}</h3>
                    <span className="text-[11px] text-neutral-600 font-mono">
                      سجل تجاري: {companyBranding.commercialRecord || '194820'} • بطاقة ضريبية: {companyBranding.taxNumber || '100-293-847'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <span className="text-xs font-black bg-neutral-100 border border-neutral-300 px-3 py-1 rounded-full text-neutral-900 font-mono block">
                  بيان مفردات مرتب شهر: {activePayslip.month}
                </span>
                <span className="block text-[10px] text-neutral-500 mt-1 font-mono">
                  رقم المستند: PAY-EG-{activePayslip.id.slice(-6)}
                </span>
              </div>
            </div>

            {/* Official Watermark & Classification */}
            <div className="flex items-center justify-between text-[10px] text-neutral-500 border-b border-neutral-200 py-1.5 font-mono">
              <span>طراز الوثيقة: إشعار تحويل بنكي رسمي ومفردات أجر</span>
              <span className="font-bold text-neutral-800">نسخة معتمدة للطباعة (أبيض وأسود)</span>
            </div>

            {/* Employee Details Strip */}
            <div className="my-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-300 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px]">اسم الموظف:</span>
                <strong className="text-neutral-950 font-black">{activePayslip.employeeName}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">كود الموظف:</span>
                <strong className="text-neutral-900 font-mono font-bold">{activePayslip.employeeId}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">القسم / الإدارة:</span>
                <span className="text-neutral-800 font-medium">{activePayslip.department}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">المسمى الوظيفي:</span>
                <span className="text-neutral-800 font-medium">{activePayslip.jobTitle}</span>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              
              {/* Earnings */}
              <div className="space-y-2 border border-neutral-200 rounded-xl p-3 bg-white">
                <h4 className="font-black text-neutral-900 pb-1.5 border-b-2 border-neutral-900 flex justify-between">
                  <span>الاستحقاقات والبدلات (+)</span>
                  <span className="font-mono text-[10px]">الأجر</span>
                </h4>
                <div className="flex justify-between text-neutral-800">
                  <span>المرتب الأساسي:</span>
                  <span className="font-mono font-bold">{activePayslip.basicSalary.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-neutral-800">
                  <span>بدل السكن:</span>
                  <span className="font-mono">{activePayslip.housingAllowance.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-neutral-800">
                  <span>بدل الانتقال:</span>
                  <span className="font-mono">{activePayslip.transportAllowance.toLocaleString('ar-EG')} ج.م</span>
                </div>
                {activePayslip.bonus + activePayslip.overtimePay > 0 && (
                  <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-200 pt-1">
                    <span>مكافآت وإضافي:</span>
                    <span className="font-mono">+{(activePayslip.bonus + activePayslip.overtimePay).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}
              </div>

              {/* Deductions */}
              <div className="space-y-2 border border-neutral-200 rounded-xl p-3 bg-white">
                <h4 className="font-black text-neutral-900 pb-1.5 border-b-2 border-neutral-900 flex justify-between">
                  <span>الاستقطاعات القانونية (-)</span>
                  <span className="font-mono text-[10px]">الخصم</span>
                </h4>
                <div className="flex justify-between text-neutral-800">
                  <span>تأمينات اجتماعية (11%):</span>
                  <span className="font-mono font-bold text-neutral-900">
                    -{(activePayslip.socialInsuranceEmployee || activePayslip.gosiDeduction).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div className="flex justify-between text-neutral-800">
                  <span>ضريبة كسب العمل:</span>
                  <span className="font-mono font-bold text-neutral-900">
                    -{(activePayslip.incomeTaxDeduction || 0).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                {activePayslip.absenceDeduction > 0 && (
                  <div className="flex justify-between text-neutral-900 border-t border-neutral-200 pt-1 font-semibold">
                    <span>خصم الغياب والتأخير:</span>
                    <span className="font-mono">-{activePayslip.absenceDeduction.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Net Banner */}
            <div className="mt-5 p-4 rounded-2xl bg-neutral-100 border-2 border-neutral-900 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-700 font-bold block">صافي المبلغ المستحق للتحويل البنكي:</span>
                <span className="text-2xl font-black text-neutral-950 font-mono tracking-tight">
                  {activePayslip.netSalary.toLocaleString('ar-EG')} جنيه مصري
                </span>
                <span className="block text-[10px] text-neutral-500 mt-0.5">طريقة التحويل: {activePayslip.paymentMethod}</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-neutral-300 text-center">
                <QrCode className="w-10 h-10 text-neutral-900" />
                <span className="text-[8px] text-neutral-500 font-mono block mt-0.5">رمز التحقق</span>
              </div>
            </div>

            {/* Official Seal and Signatures Strip */}
            <div className="mt-5 pt-4 border-t-2 border-neutral-900 flex items-center justify-between text-[11px] text-neutral-700">
              <div className="space-y-1">
                <span className="block font-bold text-neutral-900">اعتماد إدارة الموارد البشرية</span>
                <span className="font-serif italic text-neutral-600 block">تم التدقيق والمطابقة إلكترونياً</span>
                <div className="text-[10px] font-mono text-neutral-400">[ توقيع معتمد ]</div>
              </div>

              {/* Official HR Seal */}
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-neutral-900 flex flex-col items-center justify-center text-center p-1 text-neutral-900 transform -rotate-3 select-none">
                <span className="text-[8px] font-black leading-tight">معتمد HR</span>
                <span className="text-[7px] font-mono mt-0.5">SEAL & APPROVED</span>
                <span className="text-[7px] font-mono">{activePayslip.month}</span>
              </div>

              <div className="text-left space-y-1">
                <span className="block font-bold text-neutral-900">المدير المالي العام</span>
                <span className="font-serif italic text-neutral-600 block">محمد زكريا</span>
                <div className="text-[10px] font-mono text-neutral-400">[ اعتماد الصرف ]</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5 print:hidden">
              <button
                onClick={() => setActivePayslip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
              <button
                onClick={handleDownloadPayslipPdf}
                disabled={isDownloadingPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-70 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isDownloadingPdf ? 'جارٍ التحميل...' : 'تحميل PDF (أبيض وأسود)'}</span>
              </button>
              <button
                onClick={handlePrintPayslip}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة رسمية</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
