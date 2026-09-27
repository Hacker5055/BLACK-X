import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  X,
  Sparkles,
  User,
  Trash2
} from 'lucide-react';

interface PhotoUploadModalProps {
  currentAvatar?: string;
  employeeName: string;
  onSaveAvatar: (avatarUrl: string) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=250&auto=format&fit=crop&q=80',
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  currentAvatar,
  employeeName,
  onSaveAvatar,
  onClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [tab, setTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload & compress to data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 400x400 for optimal local persistence
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedAvatar(compressedDataUrl);
          setPreviewError(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    setSelectedAvatar(customUrl.trim());
    setPreviewError(false);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                تحديث الصورة الشخصية
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{employeeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {selectedAvatar && !previewError ? (
                <img
                  src={selectedAvatar}
                  alt={employeeName}
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>

            {selectedAvatar && (
              <button
                type="button"
                onClick={() => setSelectedAvatar('')}
                className="absolute -top-1 -right-1 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-xs cursor-pointer"
                title="إزالة الصورة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">معاينة الصورة الحالية</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              tab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع من الجهاز</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('presets')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              tab === 'presets'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>نماذج جاهزة</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              tab === 'url'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>رابط مباشر</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[120px]">
          {tab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50/30"
            >
              <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                انقر لاختيار صورة من جهازك
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                يدعم صيغ JPG، PNG، WebP (يتم ضغط الصورة تلقائياً)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {tab === 'presets' && (
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                اختر صورة رسمية مناسبة للملف الوظيفي:
              </p>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(url);
                      setPreviewError(false);
                    }}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedAvatar === url
                        ? 'border-emerald-600 ring-2 ring-emerald-400 scale-105'
                        : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                أدخل رابط الصورة المباشر (Direct Image URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  معاينة
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وتطبيق الصورة</span>
          </button>
        </div>

      </div>
    </div>
  );
};
