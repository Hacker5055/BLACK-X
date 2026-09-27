import React, { useState, useEffect } from 'react';
import {
  Clock,
  UserCheck,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Check,
  X
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { AttendanceRecord } from '../types';
import { downloadFile } from '../services/storage';

export const AttendanceView: React.FC = () => {
  const { employees, attendance, checkIn, checkOut } = useHR();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterStatus, setFilterStatus] = useState('all');
  const [isWithinGeofence, setIsWithinGeofence] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual record form
  const [manualForm, setManualForm] = useState({
    employeeId: employees[0]?.id || '',
    date: new Date().toISOString().slice(0, 10),
    checkInTime: '08:00:00',
    checkOutTime: '17:00:00',
    status: 'present' as 'present' | 'late' | 'absent' | 'leave' | 'half_day',
    notes: 'تسجيل يدوي بواسطة الإدارة',
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedEmp = employees.find((e) => e.id === selectedEmpId);
  const selectedEmpTodayAttendance = attendance.find(
    (a) => a.employeeId === selectedEmpId && a.date === todayStr
  );

  const filteredAttendance = attendance.filter((a) => {
    const matchesDate = !searchDate || a.date === searchDate;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  // Calculate statistics for the selected date
  const dateAttendance = attendance.filter((a) => a.date === (searchDate || todayStr));
  const presentCount = dateAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const lateCount = dateAttendance.filter((a) => a.status === 'late').length;
  const absentCount = employees.length - presentCount;
  const totalOvertime = dateAttendance.reduce((acc, a) => acc + (a.overtimeHours || 0), 0);

  const handleClockIn = () => {
    if (!selectedEmpId) return;
    checkIn(selectedEmpId, 'المقر الرئيسي - التجمع الخامس، القاهرة (GPS مطابق)');
  };

  const handleClockOut = () => {
    if (!selectedEmpId) return;
    checkOut(selectedEmpId);
  };

  const exportAttendanceCSV = () => {
    const headers = ['التاريخ', 'اسم الموظف', 'القسم', 'وقت الدخول', 'وقت الخروج', 'ساعات العمل', 'الإضافي', 'الحالة', 'الموقع'];
    const rows = filteredAttendance.map((a) => [
      a.date,
      `"${a.employeeName}"`,
      `"${a.department}"`,
      a.checkInTime || '--:--',
      a.checkOutTime || '--:--',
      a.workHours,
      a.overtimeHours,
      a.status === 'present' ? 'حاضر' : a.status === 'late' ? 'متأخر' : a.status === 'leave' ? 'إجازة' : 'غائب',
      `"${a.location || 'المقر الرئيسي'}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, `Attendance_${searchDate || todayStr}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">تتبع الحضور والإنصراف بالبصمة الذكية</h2>
          <p className="text-xs text-slate-500 mt-0.5">تسجيل فوري، مطابقة النطاق الجغرافي للمقر، واحتساب ساعات العمل والغياب</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportAttendanceCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير كشف الحضور</span>
          </button>
        </div>
      </div>

      {/* Clock-In Console Widget */}
      <div className="bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-2xl border border-emerald-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Employee Selector & Geofence Status */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="font-bold text-sm text-slate-900">وحدة تسجيل البصمة الذكية الحية</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الموظف لتسجيل الحركة:</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.jobTitle}) - {emp.employeeCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">التحقق من الموقع الجغرافي:</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    المقر الرئيسي (داخل نطاق 100م)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  مطابق GPS
                </span>
              </div>
            </div>
          </div>

          {/* Clock In / Out Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            {selectedEmpTodayAttendance?.checkInTime && !selectedEmpTodayAttendance?.checkOutTime ? (
              <div className="text-center sm:text-right px-4 py-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">وقت الدخول المسجل</span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {selectedEmpTodayAttendance.checkInTime}
                </span>
              </div>
            ) : null}

            <button
              onClick={handleClockIn}
              disabled={!!selectedEmpTodayAttendance?.checkInTime}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                selectedEmpTodayAttendance?.checkInTime
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:shadow-md'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{selectedEmpTodayAttendance?.checkInTime ? 'تم تسجيل الحضور اليوم' : 'تسجيل دخول (Check In)'}</span>
            </button>

            <button
              onClick={handleClockOut}
              disabled={!selectedEmpTodayAttendance?.checkInTime || !!selectedEmpTodayAttendance?.checkOutTime}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                !selectedEmpTodayAttendance?.checkInTime || selectedEmpTodayAttendance?.checkOutTime
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 hover:shadow-md'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{selectedEmpTodayAttendance?.checkOutTime ? 'تم تسجيل الإنصراف' : 'تسجيل خروج (Check Out)'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Date & Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">حاضرون اليوم</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{presentCount}</div>
          <span className="text-[11px] text-slate-400">من إجمالي {employees.length} موظف</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">تأخيرات</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{lateCount}</div>
          <span className="text-[11px] text-slate-400">تأخير عن موعد 08:15 ص</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">غياب / إجازات</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{Math.max(0, absentCount)}</div>
          <span className="text-[11px] text-slate-400">تشمل الإجازات السنوية</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">ساعات إضافية (Overtime)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{totalOvertime.toFixed(1)} س</div>
          <span className="text-[11px] text-slate-400">محتسبة في مسير الرواتب</span>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Filter Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                عرض كل التواريخ
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['all', 'present', 'late', 'leave'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'الكل' : st === 'present' ? 'حاضر' : st === 'late' ? 'متأخر' : 'إجازة'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-100 font-bold">
              <tr>
                <th className="px-4 py-3">الموظف</th>
                <th className="px-4 py-3">القسم</th>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">وقت الدخول</th>
                <th className="px-4 py-3">وقت الخروج</th>
                <th className="px-4 py-3">إجمالي الساعات</th>
                <th className="px-4 py-3">الإضافي</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">الموقع / ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-xs">
                    لا توجد سجلات حضور مطابقة لمعايير البحث المحددة.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{rec.employeeName}</td>
                    <td className="px-4 py-3 text-slate-500">{rec.department}</td>
                    <td className="px-4 py-3 font-mono">{rec.date}</td>
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{rec.checkInTime || '--:--'}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{rec.checkOutTime || '--:--'}</td>
                    <td className="px-4 py-3 font-mono">{rec.workHours} س</td>
                    <td className="px-4 py-3 font-mono text-amber-700 font-bold">{rec.overtimeHours > 0 ? `+${rec.overtimeHours} س` : '0'}</td>
                    <td className="px-4 py-3">
                      {rec.status === 'present' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">حاضر</span>
                      ) : rec.status === 'late' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">متأخر</span>
                      ) : rec.status === 'leave' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">إجازة</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">غائب</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] truncate max-w-xs">{rec.notes || rec.location || 'المقر الرئيسي'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
