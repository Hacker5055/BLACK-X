import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  X
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { HRTask } from '../types';

export const GoogleTasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTaskStatus,
    syncAllTasksWithGoogle,
    isGoogleConnected,
    signInWithGoogle
  } = useHR();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTaskToAdd, setPendingTaskToAdd] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: 'سارة القحطاني',
    dueDate: new Date().toISOString().slice(0, 10),
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    syncToGoogle: true,
  });

  const handleSyncAll = async () => {
    if (!isGoogleConnected) {
      alert('يرجى تسجيل الدخول بحساب Google أولاً لتفعيل المزامنة.');
      return;
    }
    setIsSyncing(true);
    try {
      await syncAllTasksWithGoogle();
      alert('تمت مزامنة المهام مع Google Tasks بنجاح!');
    } catch (err: any) {
      alert('فشل مزامنة المهام: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (formData.syncToGoogle && isGoogleConnected) {
      // Prompt confirmation dialog as mandated by Workspace guidelines
      setPendingTaskToAdd(formData);
      setShowConfirmModal(true);
    } else {
      addTask(formData, false);
      setShowAddModal(false);
      resetForm();
    }
  };

  const confirmAddAndSync = async () => {
    if (!pendingTaskToAdd) return;
    await addTask(pendingTaskToAdd, true);
    setShowConfirmModal(false);
    setShowAddModal(false);
    setPendingTaskToAdd(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: 'سارة القحطاني',
      dueDate: new Date().toISOString().slice(0, 10),
      priority: 'medium',
      status: 'pending',
      syncToGoogle: true,
    });
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">إدارة ومزامنة مهام Google Tasks</h2>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
              Google Tasks API
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">متابعة التكليفات الإدارية ومزامنتها لحظياً مع مهام جوجل لفرق الموارد البشرية</p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isGoogleConnected ? (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
            >
              <span>ربط حساب Google Tasks</span>
            </button>
          ) : (
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة مع Google'}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">معدل إنجاز المهام الإدارية</h4>
            <span className="text-xs text-slate-500">تم إنجاز {completedCount} من أصل {tasks.length} مهمة</span>
          </div>
        </div>

        <div className="w-full sm:w-64 bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDone
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-emerald-600'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600">
                      <User className="w-3.5 h-3.5" /> {task.assignedTo}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" /> {task.dueDate}
                    </span>
                    {task.syncedWithGoogle && (
                      <span className="flex items-center gap-1 text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                        <CheckSquare className="w-3 h-3" /> متزامن مع Google Tasks
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : task.priority === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority === 'urgent' ? 'عاجل جداً' : task.priority === 'high' ? 'أولوية عالية' : 'أولوية عادية'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">إضافة مهمة إدارية جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المهمة *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: مراجعة وثائق التأمين الطبي"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل وملاحظات المهمة:</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف تفصيلي للإجراءات المطلوبة..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسؤول عن التنفيذ:</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الاستحقاق:</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مستوى الأولوية:</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجل جداً</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="syncG"
                    checked={formData.syncToGoogle}
                    onChange={(e) => setFormData({ ...formData, syncToGoogle: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="syncG" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    مزامنة مع Google Tasks
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  حفظ المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Google Workspace API (MANDATORY per Workspace guidelines) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-indigo-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">تأكيد المزامنة مع Google Tasks</h4>
                <span className="text-[11px] text-slate-500">تفويض إجرائي مطلوب</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              هل تؤكد رغبتك في إنشاء المهمة <strong>"{pendingTaskToAdd?.title}"</strong> وإرسالها مباشرة إلى قائمة مهام حساب Google الخاص بك؟
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={confirmAddAndSync}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
              >
                تأكيد والمزامنة الآن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
