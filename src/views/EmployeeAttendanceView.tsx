import React, { useState } from 'react';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MapPin,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import { useHR } from '../context/HRContext';

export const EmployeeAttendanceView: React.FC = () => {
  const {
    currentEmployee,
    currentUser,
    attendance,
    checkIn,
    checkOut,
    setEmployeeFullScreenView,
    addNotification
  } = useHR();

  const emp = currentEmployee || {
    id: 'emp-current',
    employeeCode: 'EMP-EG-001',
    fullName: currentUser?.displayName || 'موظف مسجل',
    department: 'الهندسة والتقنية',
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const myAttendance = attendance.filter((a) => a.employeeId === emp.id);
  const todayRecord = myAttendance.find((a) => a.date === todayStr);

  const totalDays = myAttendance.length;
  const presentDays = myAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const lateDays = myAttendance.filter((a) => a.status === 'late').length;
  const totalHours = myAttendance.reduce((sum, a) => sum + (a.workHours || 0), 0);
  const totalOvertime = myAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

  const handleClockIn = () => {
    checkIn(emp.id, 'المقر الرئيسي (القاهرة - التجمع الخامس)');
    addNotification({
      title: 'تم تسجيل الحضور بنجاح',
      message: 'تم تسجيل حضورك اليوم بنجاح، نتمنى لك يوماً موفقاً ومثمراً!',
      type: 'success',
      read: false,
    });
  };

  const handleClockOut = () => {
    checkOut(emp.id);
    addNotification({
      title: 'تم تسجيل الانصراف بنجاح',
      message: 'تم تسجيل انصرافك بنجاح، شكراً لجهودك وعملك المتميز اليوم!',
      type: 'info',
      read: false,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEmployeeFullScreenView('portal')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للبوابة</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>سجل الحضور والانصراف والدوام (Full Screen)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              متابعة مواعيد الحضور الذكي وساعات العمل الإضافية وسجلات البصمة
            </p>
          </div>
        </div>

        {/* Live Clock In/Out Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {!todayRecord ? (
            <button
              onClick={handleClockIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>تسجيل حضور الآن</span>
            </button>
          ) : !todayRecord.checkOutTime ? (
            <button
              onClick={handleClockOut}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>تسجيل انصراف</span>
            </button>
          ) : (
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>اكتمل يوم العمل بنجاح</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">أيام الحضور الفعلي</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{presentDays}</span>
            <span className="text-xs text-slate-400">يوم</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">خلال الشهر الحالي</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">إجمالي ساعات العمل</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{totalHours}</span>
            <span className="text-xs text-slate-400">ساعة</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">بمعدل 8 ساعات يومياً</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">ساعات العمل الإضافية</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">+{totalOvertime}</span>
            <span className="text-xs text-slate-400">ساعة Overtime</span>
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block font-medium">محتسبة في كشف الراتب</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">حالات التأخير</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">{lateDays}</span>
            <span className="text-xs text-slate-400">مرات</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">فترة سماح 15 دقيقة</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">سجل الدوام والحضور التفصيلي</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">سجلات البصمة المسجلة لـ {emp.fullName}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold font-mono">
            {myAttendance.length} تسجيلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">وقت الحضور</th>
                <th className="py-3 px-4">وقت الانصراف</th>
                <th className="py-3 px-4">ساعات العمل</th>
                <th className="py-3 px-4">الإضافي</th>
                <th className="py-3 px-4">الموقع</th>
                <th className="py-3 px-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myAttendance.length > 0 ? (
                myAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {rec.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {rec.checkInTime || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {rec.checkOutTime || (rec.checkInTime ? 'جاري العمل' : '-')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {rec.workHours} س
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-600">
                      {rec.overtimeHours > 0 ? `+${rec.overtimeHours} س` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[150px]">
                      {rec.location || 'المقر الرئيسي'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : rec.status === 'late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}>
                        {rec.status === 'present' ? 'حاضر في الموعد' : rec.status === 'late' ? 'متأخر' : 'غياب'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لا توجد سجلات حضور مسجلة لهذا الشهر حتى الآن.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
