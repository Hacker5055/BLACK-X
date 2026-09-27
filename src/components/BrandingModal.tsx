import React, { useState } from 'react';
import {
  Building2,
  Upload,
  X,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Image,
  RotateCcw
} from 'lucide-react';
import { useHR } from '../context/HRContext';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandingModal: React.FC<BrandingModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    companyBranding,
    updateCompanyBranding,
    canEditBranding,
    addNotification
  } = useHR();

  const [companyName, setCompanyName] = useState(companyBranding.companyName);
  const [subtitle, setSubtitle] = useState(companyBranding.subtitle);
  const [logoUrl, setLogoUrl] = useState(companyBranding.logoUrl);
  const [taxNumber, setTaxNumber] = useState(companyBranding.taxNumber || '100-293-847');
  const [commercialRecord, setCommercialRecord] = useState(companyBranding.commercialRecord || '194820');
  const [logoPreview, setLogoPreview] = useState<string>(companyBranding.logoUrl);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addNotification({
        title: 'حجم الصورة كبير',
        message: 'يرجى اختيار صورة بحجم أقل من 2 ميجابايت لضمان سرعة التحميل.',
        type: 'warning',
        read: false,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoPreview(result);
        setLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditBranding) {
      addNotification({
        title: 'رفض الصلاحية',
        message: 'تعديل الشعار والهوية الرسمية محصور حصرياً بحساب المدير العام (mz0970mmz@gmail.com).',
        type: 'warning',
        read: false,
      });
      return;
    }

    const res = updateCompanyBranding({
      companyName: companyName.trim() || 'شركة النيل للحلول والتطوير',
      subtitle: subtitle.trim(),
      logoUrl: logoUrl.trim(),
      taxNumber: taxNumber.trim(),
      commercialRecord: commercialRecord.trim(),
    });

    if (res.success) {
      onClose();
    }
  };

  const handleResetToDefault = () => {
    setCompanyName('شركة النيل للحلول والتطوير (ش.م.م)');
    setSubtitle('منظومة إدارة الموارد البشرية والرواتب - جمهورية مصر العربية');
    setLogoUrl('');
    setLogoPreview('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Cairo',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تخصيص هوية وشعار المنشأة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يطبق الشعار على واجهة النظام وكافة الأوراق والمستندات المطبوعة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Permission Status */}
        {canEditBranding ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">صلاحية المدير العام مفعلة:</strong>
              <span>أنت مسجل بحساب المدير العام المعتمد ({currentUser?.email}). يمكنك تعديل الشعار والاسم.</span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-xs text-rose-900 dark:text-rose-300 flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">تنبيه الحماية والصلاحيات:</strong>
              <span>تغيير الشعار والهوية محصور حصرياً بحساب المدير العام (mz0970mmz@gmail.com). حسابك الحالي للعرض فقط.</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Logo Upload & Preview */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">
              شعار المنشأة (Logo)
            </label>
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="شعار الشركة"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
                  {companyName ? companyName.trim()[0] : 'م'}
                </div>
              )}

              <div className="flex-1 space-y-2">
                <label className={`inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs ${
                  !canEditBranding ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  <Upload className="w-4 h-4" />
                  <span>رفع صورة شعار من جهازك</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!canEditBranding}
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                {logoPreview && canEditBranding && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview('');
                      setLogoUrl('');
                    }}
                    className="block text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                  >
                    إزالة الشعار والعودة للرمز المعتمد
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              اسم المنشأة / المنصة الرسمي
            </label>
            <input
              type="text"
              required
              disabled={!canEditBranding}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="مثال: شركة النيل للحلول والتطوير (ش.م.م)"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold disabled:opacity-60"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              الوصف والنشاط الرئيسي
            </label>
            <input
              type="text"
              disabled={!canEditBranding}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="مثال: منظومة إدارة الموارد البشرية والرواتب - جمهورية مصر العربية"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>

          {/* Commercial Record & Tax Number for Official Prints */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                رقم السجل التجاري (س.ت)
              </label>
              <input
                type="text"
                disabled={!canEditBranding}
                value={commercialRecord}
                onChange={(e) => setCommercialRecord(e.target.value)}
                placeholder="194820"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                رقم البطاقة الضريبية (ب.ض)
              </label>
              <input
                type="text"
                disabled={!canEditBranding}
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="100-293-847"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            {canEditBranding ? (
              <>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  حفظ وتطبيق الشعار على جميع الأوراق
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-xl cursor-pointer"
                  title="استعادة الافتراضي"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                إغلاق (تعديل الهوية خاص بـ mz0970mmz@gmail.com)
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
