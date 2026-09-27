import React from 'react';
import {
  ShieldCheck,
  Scale,
  Users,
  CheckCircle2,
  AlertCircle,
  Building,
  HeartHandshake,
  CreditCard,
  FileCheck2,
  TrendingUp
} from 'lucide-react';
import { useHR } from '../context/HRContext';

export const ComplianceScoreboard: React.FC = () => {
  const { employees } = useHR();

  const totalEmployees = employees.length || 1;
  const specialNeedsCount = employees.filter((e) => e.isSpecialNeeds).length;
  const specialNeedsPercent = Math.round((specialNeedsCount / totalEmployees) * 100);

  // 6000 EGP Private Sector Minimum Wage compliance check
  const belowMinWageCount = employees.filter((e) => e.basicSalary < 6000).length;
  const minWageCompliance = belowMinWageCount === 0;

  // Social Insurance registration check (Form 1 / Form 2)
  const insuredCount = employees.filter((e) => e.socialInsuranceNumber && e.socialInsuranceNumber.length >= 8).length;
  const insuredPercent = Math.round((insuredCount / totalEmployees) * 100);

  // Fixed vs Unlimited contracts ratio
  const unlimitedContractsCount = employees.filter((e) => e.contractType === 'unlimited').length;
  const fixedContractsCount = employees.filter((e) => e.contractType === 'fixed').length;

  // Overall Score Calculation (out of 100)
  const overallScore = Math.min(
    100,
    Math.round(
      (insuredPercent * 0.4) +
      (minWageCompliance ? 30 : 10) +
      (specialNeedsPercent >= 5 ? 20 : 10) +
      10
    )
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              لوحة قياس الامتثال المؤسسي المصري (Compliance Scoreboard)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              متابعة الالتزام بقانون العمل 12/2003، قانون التأمينات 148/2019 وقانون ذوي الإعاقة 10/2018
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">درجة الامتثال الكلية:</span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-sm rounded-xl border border-emerald-300 dark:border-emerald-800">
            {overallScore} / 100
          </span>
        </div>
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* 1. Special Needs 5% Quota */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-violet-600" />
              نسبة الـ 5% ذوي الهمم
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${specialNeedsPercent >= 5 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
              {specialNeedsPercent >= 5 ? 'مستوفى' : 'قيد الاستيفاء'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">{specialNeedsPercent}%</span>
            <span className="text-[10px] text-slate-500">({specialNeedsCount} من {totalEmployees} موظف)</span>
          </div>
          <p className="text-[10px] text-slate-400">القانون 10 لسنة 2018 للمنشآت الأكثر من 20 عاملاً</p>
        </div>

        {/* 2. Minimum Wage Compliance */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              الحد الأدنى للأجور
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {minWageCompliance ? 'مطابق 100%' : 'تنبيه'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">6,000 ج.م</span>
            <span className="text-[10px] text-emerald-600 font-semibold">مطبق على كافة الكوادر</span>
          </div>
          <p className="text-[10px] text-slate-400">قرار المجلس القومي للأجور لعام 2024/2025/2026</p>
        </div>

        {/* 3. Social Insurance Coverage */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              التغطية التأمينية (NOSI)
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {insuredPercent}% مسجلين
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">{insuredCount} / {totalEmployees}</span>
            <span className="text-[10px] text-slate-500">مؤمن عليهم</span>
          </div>
          <p className="text-[10px] text-slate-400">القانون 148 لسنة 2019 (س1 وس2 مستوفاة)</p>
        </div>

        {/* 4. Contract Stability */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
              توازن واستقرار العقود
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              عقود مقننة
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">{fixedContractsCount} محدد / {unlimitedContractsCount} دائم</span>
          </div>
          <p className="text-[10px] text-slate-400">تحديث إشعارات التجديد قبل 30 يوماً</p>
        </div>

      </div>

    </div>
  );
};
