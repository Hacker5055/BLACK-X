import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator,
  FileCheck,
  Printer,
  Download,
  Building,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Scale,
  QrCode,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Employee, EOSCalculation } from '../types';
import { generateVerificationHash, generateQrCodeDataUrl } from '../utils/verification';

interface EOSCalculatorModalProps {
  initialEmployee?: Employee | null;
  onClose: () => void;
}

export const EOSCalculatorModal: React.FC<EOSCalculatorModalProps> = ({
  initialEmployee,
  onClose,
}) => {
  const {
    employees,
    companyBranding,
    addNotification,
    currentUser
  } = useHR();

  // Selected Employee
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialEmployee?.id || employees[0]?.id || ''
  );
  const employee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // EOS Form Inputs
  const [terminationDate, setTerminationDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [reason, setReason] = useState<'resignation' | 'contract_expiry' | 'dismissal' | 'retirement' | 'mutual_agreement'>('contract_expiry');
  const [unusedLeaveDays, setUnusedLeaveDays] = useState<number>(
    employee?.remainingLeaveDays || 14
  );
  const [noticePeriodPay, setNoticePeriodPay] = useState<number>(0);
  const [bonuses, setBonuses] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [notes, setNotes] = useState<string>('تم إنهاء الإجراءات القانونية واستلام كافة العهد والأجهزة المسلمة للموظف.');

  // View state: 'calc' or 'print_sheet'
  const [activeTab, setActiveTab] = useState<'calc' | 'print_sheet'>('calc');

  // Compute Service Duration & Egyptian Labor Law EOS (Article 126)
  const calculation: EOSCalculation = useMemo(() => {
    const hire = employee?.hireDate ? new Date(employee.hireDate) : new Date('2022-01-01');
    const term = new Date(terminationDate);
    
    // Total months calculation
    let totalMonths = (term.getFullYear() - hire.getFullYear()) * 12 + (term.getMonth() - hire.getMonth());
    if (term.getDate() < hire.getDate()) {
      totalMonths = Math.max(0, totalMonths - 1);
    }
    const years = Math.max(0, Math.floor(totalMonths / 12));
    const months = Math.max(0, totalMonths % 12);
    const days = 15; // approximate remainder days

    const basicSalary = employee?.basicSalary || 15000;
    const grossSalary = basicSalary + (employee?.housingAllowance || 0) + (employee?.transportAllowance || 0) + (employee?.otherAllowances || 0);

    // Article 126 of Law 12/2003:
    // Half month basic wage for each of the first 5 years
    // Full month basic wage for each subsequent year
    let eosGratuity = 0;
    const effectiveYears = years + (months / 12);

    if (effectiveYears <= 5) {
      eosGratuity = effectiveYears * (basicSalary * 0.5);
    } else {
      const first5Years = 5 * (basicSalary * 0.5);
      const remainingYears = (effectiveYears - 5) * basicSalary;
      eosGratuity = first5Years + remainingYears;
    }

    // Resignation penalty adjustment per standard labor practice if resigned before 5 years (optional standard: 1/3 or 2/3)
    if (reason === 'resignation') {
      if (effectiveYears < 2) {
        eosGratuity = 0; // لا يستحق مكافأة إذا استقال قبل سنتين
      } else if (effectiveYears <= 5) {
        eosGratuity = eosGratuity * (1 / 3); // يستحق ثلث المكافأة
      } else if (effectiveYears < 10) {
        eosGratuity = eosGratuity * (2 / 3); // يستحق ثلثي المكافأة
      }
      // إذا بلغت خدمته 10 سنوات يستحق المكافأة كاملة
    }

    // Unused leave balance compensation: (Basic Salary / 30) * Days
    const leaveCompensation = Math.round((basicSalary / 30) * unusedLeaveDays);

    const netSettlement = Math.round(
      eosGratuity + leaveCompensation + noticePeriodPay + bonuses - deductions
    );

    const verificationHash = generateVerificationHash('EOS');

    return {
      id: `eos-${employee?.id}-${new Date().getTime()}`,
      employeeId: employee?.id || '',
      employeeName: employee?.fullName || '',
      employeeCode: employee?.employeeCode || '',
      department: employee?.department || '',
      jobTitle: employee?.jobTitle || '',
      hireDate: employee?.hireDate || '',
      terminationDate,
      reason,
      serviceYears: years,
      serviceMonths: months,
      serviceDays: days,
      lastBasicSalary: basicSalary,
      lastGrossSalary: grossSalary,
      eosGratuityAmount: Math.round(eosGratuity),
      unusedLeaveDays,
      unusedLeaveCompensation: leaveCompensation,
      noticePeriodCompensation: noticePeriodPay,
      bonusesAndRewards: bonuses,
      deductionsAndCustody: deductions,
      netSettlementAmount: netSettlement,
      verificationHash,
      status: 'approved',
      notes,
      createdAt: new Date().toISOString().slice(0, 10),
      clearedBy: currentUser?.displayName || 'محمد زكريا (المدير الإداري)'
    };
  }, [employee, terminationDate, reason, unusedLeaveDays, noticePeriodPay, bonuses, deductions, notes, currentUser]);

  const qrCodeUrl = useMemo(() => {
    return generateQrCodeDataUrl(`https://hrms.nile.eg/verify?hash=${calculation.verificationHash}&type=EOS&emp=${calculation.employeeCode}&amount=${calculation.netSettlementAmount}`);
  }, [calculation]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                حاسبة مكافأة نهاية الخدمة والتسوية القانونية (المادة 126 - قانون العمل المصري)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                احتساب مستحقات نهاية الخدمة، رصيد الإجازات، وإصدار المخالصة الرسمية
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

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl my-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('calc')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'calc'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>بيانات ومعادلة الحساب</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('print_sheet')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'print_sheet'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>المخالصة المالية الرسمية (B&W Settlement Sheet)</span>
          </button>
        </div>

        {/* TAB 1: Calculation Parameters & Real-time breakdown */}
        {activeTab === 'calc' && (
          <div className="space-y-4">
            
            {/* Employee Selector & Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الموظف المعني *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سبب انتهاء العلاقة التعاقدية *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="contract_expiry">انتهاء مدة العقد المحدد دون تجديد</option>
                  <option value="mutual_agreement">اتفاق رضائي بين الطرفين</option>
                  <option value="resignation">استقالة الموظف</option>
                  <option value="retirement">بلوغ سن التقاعد والمعاش (60 عاماً)</option>
                  <option value="dismissal">إنهاء التعاقد من جانب الإدارة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ انتهاء الخدمة الفعلي *
                </label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Service & Salary Summary */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">تاريخ التعيين:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{employee?.hireDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">مدة الخدمة المحتسبة:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {calculation.serviceYears} سنة و {calculation.serviceMonths} شهر
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الراتب الأساسي الأخير:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {employee?.basicSalary?.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الراتب الشامل:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {calculation.lastGrossSalary?.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            {/* Financial Adjustments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  أيام الإجازات المستحقة (رصيد)
                </label>
                <input
                  type="number"
                  min="0"
                  value={unusedLeaveDays}
                  onChange={(e) => setUnusedLeaveDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  بدل مهلة الإخطار (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  value={noticePeriodPay}
                  onChange={(e) => setNoticePeriodPay(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مكافآت / مستحقات أخرى (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  value={bonuses}
                  onChange={(e) => setBonuses(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                  استقطاعات عهد / سلف (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deductions}
                  onChange={(e) => setDeductions(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Final Settlement Total Highlight Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block font-bold">صافي مستحقات نهاية الخدمة والتصفية:</span>
                <span className="text-2xl font-black text-emerald-400">
                  {calculation.netSettlementAmount.toLocaleString('ar-EG')} جنيه مصري
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  يشمل مكافأة المادة 126 ({calculation.eosGratuityAmount.toLocaleString('ar-EG')} ج.م) + مقابل الإجازات ({calculation.unusedLeaveCompensation.toLocaleString('ar-EG')} ج.م)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('print_sheet')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>إصدار المخالصة الرسمية</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: Formal Black & White Settlement Clearance Form (B&W) */}
        {activeTab === 'print_sheet' && (
          <div className="space-y-4">
            
            {/* Printable Container */}
            <div className="p-6 bg-white border-2 border-black rounded-xl text-black font-serif text-xs space-y-4 text-right shadow-xs">
              
              {/* Official Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-black">{companyBranding.companyName}</h4>
                  <p className="text-[10px] text-black">{companyBranding.subtitle}</p>
                  <p className="text-[10px] text-black">السجل التجاري: {companyBranding.commercialRecord || '1029384'}</p>
                </div>
                
                {/* QR Code & Hash */}
                <div className="flex items-center gap-3">
                  <div className="text-left font-mono text-[9px] leading-tight">
                    <p className="font-bold">رقم المخالصة: {calculation.verificationHash}</p>
                    <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                    <p>المطابقة: معتمد وموثق رقمياً ✓</p>
                  </div>
                  <img src={qrCodeUrl} alt="Verification QR" className="w-14 h-14 border border-black p-0.5" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h3 className="font-black text-sm underline decoration-2 underline-offset-4">
                  مخالصة مالية وإدارية نهائية وإبراء ذمة شامل
                </h3>
                <p className="text-[10px] mt-0.5">طبقاً للمادة (126) من قانون العمل المصري رقم 12 لسنة 2003</p>
              </div>

              {/* Employee & Service Details */}
              <div className="grid grid-cols-2 gap-2 border border-black p-3 rounded-lg text-[11px]">
                <p><strong>اسم الموظف:</strong> {calculation.employeeName}</p>
                <p><strong>الرقم القومي:</strong> {employee?.nationalId || '29201010101234'}</p>
                <p><strong>الوظيفة والقسم:</strong> {calculation.jobTitle} • {calculation.department}</p>
                <p><strong>الرقم التأميني:</strong> {employee?.socialInsuranceNumber || '109847291'}</p>
                <p><strong>تاريخ بدء الخدمة:</strong> {calculation.hireDate}</p>
                <p><strong>تاريخ انتهاء الخدمة:</strong> {calculation.terminationDate}</p>
                <p><strong>مدة الخدمة المحتسبة:</strong> {calculation.serviceYears} سنة و {calculation.serviceMonths} شهر</p>
                <p><strong>سبب انتهاء الخدمة:</strong> {
                  reason === 'contract_expiry' ? 'انتهاء مدة العقد' :
                  reason === 'resignation' ? 'استقالة' :
                  reason === 'retirement' ? 'بلوغ سن التقاعد' : 'اتفاق رضائي'
                }</p>
              </div>

              {/* Breakdown Financial Table */}
              <table className="w-full border-collapse border border-black text-[11px] text-right">
                <thead>
                  <tr className="bg-slate-100 border-b border-black">
                    <th className="border-l border-black p-2 font-bold">بيان البند والمستحق القانوني</th>
                    <th className="p-2 font-bold w-36 text-center">المبلغ المستحق (ج.م)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border-l border-black p-2">
                      مكافأة نهاية الخدمة (المادة 126: نصف شهر عن كل سنة من الـ 5 الأولى + شهر عن كل سنة تالية)
                    </td>
                    <td className="p-2 text-center font-bold font-mono">{calculation.eosGratuityAmount.toLocaleString('ar-EG')}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-l border-black p-2">
                      المقابل المادي لرصيد الإجازات السنوية غير المستنفذة ({calculation.unusedLeaveDays} يوم)
                    </td>
                    <td className="p-2 text-center font-bold font-mono">{calculation.unusedLeaveCompensation.toLocaleString('ar-EG')}</td>
                  </tr>
                  {calculation.noticePeriodCompensation > 0 && (
                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2">بدل مهلة الإخطار القانونية</td>
                      <td className="p-2 text-center font-bold font-mono">{calculation.noticePeriodCompensation.toLocaleString('ar-EG')}</td>
                    </tr>
                  )}
                  {calculation.bonusesAndRewards > 0 && (
                    <tr className="border-b border-black">
                      <td className="border-l border-black p-2">مكافآت وأرباح ومستحقات إضافية</td>
                      <td className="p-2 text-center font-bold font-mono">{calculation.bonusesAndRewards.toLocaleString('ar-EG')}</td>
                    </tr>
                  )}
                  {calculation.deductionsAndCustody > 0 && (
                    <tr className="border-b border-black text-rose-900">
                      <td className="border-l border-black p-2">استقطاعات عهد مادية أو سلفيات</td>
                      <td className="p-2 text-center font-bold font-mono">- {calculation.deductionsAndCustody.toLocaleString('ar-EG')}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold border-t-2 border-black">
                    <td className="border-l border-black p-2">صافي المبلغ المسدد للموظف (المستحقات النهائية)</td>
                    <td className="p-2 text-center font-black font-mono text-xs">{calculation.netSettlementAmount.toLocaleString('ar-EG')} ج.م</td>
                  </tr>
                </tbody>
              </table>

              {/* Legal Acknowledgment Statement */}
              <div className="border border-black p-3 rounded-lg text-[10px] leading-relaxed bg-slate-50/50">
                <strong>إقرار وتعهد الموظف:</strong> أقر أنا الموقع أدناه / ({calculation.employeeName}) بأنني استلمت كافة مستحقاتي المالية والقانونية والعمالية الناشئة عن عقد عملي وفترة خدمتي بالشركة كاملة دون أي انتقاص، وأبرئ ذمة الشركة إبراءً شاملاً ومانعاً من أي دعوى أو مطالبة حالية أو مستقبلية، كما أقر بتسليم كافة العهد والأجهزة والمستندات المسندة إلي بحالة سليمة.
              </div>

              {/* Signatures & Seal */}
              <div className="border-t border-black pt-4 grid grid-cols-2 text-center gap-6 mt-4">
                <div>
                  <p className="font-bold text-[11px]">المقر بما فيه (الموظف المستلم):</p>
                  <p className="text-[10px] mt-1">الاسم: {calculation.employeeName}</p>
                  <div className="h-10"></div>
                  <p className="text-[9px]">التوقيع: _______________________</p>
                </div>

                <div>
                  <p className="font-bold text-[11px]">إدارة الموارد البشرية والمدير المفوض:</p>
                  <div className="h-10 flex items-center justify-center font-serif italic text-xs">
                    [خاتم الشركة الرسمي والاعتماد]
                  </div>
                  <p className="text-[9px]">المدير الإداري: محمد زكريا</p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('calc')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                العودة للتعديل
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة المخالصة الرسمية (B&W)</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
