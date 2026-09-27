import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Calendar,
  ShieldCheck,
  UserCheck,
  Printer,
  X,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Employee, OnboardingDocRecord } from '../types';

interface OnboardingAuditModalProps {
  employee: Employee;
  onClose: () => void;
}

const DEFAULT_EGYPTIAN_DOCUMENTS: Array<{ id: string; name: string; isRequired: boolean }> = [
  { id: 'doc-qual', name: 'أصل المؤهل الدراسي معتمد أو مستخرج رسمي', isRequired: true },
  { id: 'doc-mil', name: 'شهادة الموقف من الخدمة العسكرية (أدى الخدمة / إعفاء نهائي)', isRequired: true },
  { id: 'doc-crim', name: 'صحيفة الحالة الجنائية سارية موجهة للمنشأة (فيش وتشبيه)', isRequired: true },
  { id: 'doc-labor', name: 'شهادة القيد بمكتب العمل التابع (كعب العمل)', isRequired: true },
  { id: 'doc-ins1', name: 'برنت تأميني حديث / استمارة (1) تأمينات اجتماعية معتمدة', isRequired: true },
  { id: 'doc-med111', name: 'الكشف الطبي الابتدائي المعتمد (نموذج 111 تأمين صحي)', isRequired: true },
  { id: 'doc-nid', name: 'صورة بطاقة الرقم القومي سارية (14 رقماً)', isRequired: true },
  { id: 'doc-birth', name: 'شهادة الميلاد مميكنة (كمبيوتر)', isRequired: true },
  { id: 'doc-commence', name: 'إقرار استلام العمل ومحضر تسليم العهدة الوظيفية', isRequired: false },
  { id: 'doc-license', name: 'رخصة القيادة المهنية أو كارنيه النقابة المهنية (إن وجد)', isRequired: false },
];

export const OnboardingAuditModal: React.FC<OnboardingAuditModalProps> = ({
  employee,
  onClose,
}) => {
  const { updateEmployee, addNotification, companyBranding } = useHR();

  // Initialize docs from employee or defaults
  const [docs, setDocs] = useState<OnboardingDocRecord[]>(() => {
    if (employee.onboardingDocuments && employee.onboardingDocuments.length > 0) {
      return employee.onboardingDocuments;
    }
    return DEFAULT_EGYPTIAN_DOCUMENTS.map((d, index) => ({
      id: d.id,
      name: d.name,
      isRequired: d.isRequired,
      isSubmitted: index < 7, // sample initial state: first 7 docs submitted
      submittedAt: index < 7 ? employee.hireDate : undefined,
      notes: index < 7 ? 'مستند أصلي محفوظ بملف الموظف' : '',
    }));
  });

  const submittedCount = docs.filter((d) => d.isSubmitted).length;
  const totalRequired = docs.filter((d) => d.isRequired).length;
  const requiredSubmitted = docs.filter((d) => d.isRequired && d.isSubmitted).length;
  const completionPercentage = Math.round((submittedCount / docs.length) * 100);

  const handleToggleDoc = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextState = !d.isSubmitted;
          return {
            ...d,
            isSubmitted: nextState,
            submittedAt: nextState ? new Date().toISOString().slice(0, 10) : undefined,
          };
        }
        return d;
      })
    );
  };

  const handleSave = () => {
    updateEmployee(employee.id, {
      onboardingDocuments: docs,
    });

    addNotification({
      title: 'تم تحديث مسوغات التعيين',
      message: `تم تحديث ومراجعة ملف الأوراق الرسمية للموظف ${employee.fullName} بنسبة اكتمال ${completionPercentage}%.`,
      type: 'success',
      read: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                مدقق مسوغات التعيين والأوراق القانونية (Onboarding File Audit)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {employee.fullName} ({employee.employeeCode}) • {employee.jobTitle}
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

        {/* Progress & Compliance Status Banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                مؤشر اكتمال الملف القانوني للموظف
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                تم استيفاء {submittedCount} من أصل {docs.length} مستند ({requiredSubmitted} من {totalRequired} مسوغ إلزامي)
              </span>
            </div>
            <span className={`text-lg font-black ${completionPercentage === 100 ? 'text-emerald-600' : completionPercentage >= 70 ? 'text-blue-600' : 'text-amber-600'}`}>
              {completionPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completionPercentage === 100
                  ? 'bg-emerald-500'
                  : completionPercentage >= 70
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {completionPercentage === 100 && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>الملف القانوني مكتمل 100% ومطابق لاشتراطات تفتيش مكتب العمل والتأمينات الاجتماعية.</span>
            </div>
          )}
        </div>

        {/* Checklist List */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {docs.map((doc, idx) => (
            <div
              key={doc.id}
              onClick={() => handleToggleDoc(doc.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                doc.isSubmitted
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    doc.isSubmitted
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 dark:border-slate-600 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {doc.name}
                    </span>
                    {doc.isRequired ? (
                      <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold rounded">
                        إلزامي
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold rounded">
                        اختياري
                      </span>
                    )}
                  </div>
                  {doc.isSubmitted && doc.submittedAt && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono block mt-0.5">
                      تم الاستلام والتسجيل بتاريخ: {doc.submittedAt}
                    </span>
                  )}
                </div>
              </div>

              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${doc.isSubmitted ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {doc.isSubmitted ? 'مستوفى ومحفوظ' : 'معلق / غير مستلم'}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة بطاقة مراجعة الملف</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              حفظ واعتماد المسوغات
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
