import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Clock,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Bell,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  FileText,
  Home,
  User
} from 'lucide-react';
import { useHR } from '../context/HRContext';

export const MobileSimulatorModal: React.FC = () => {
  const {
    showMobileSimulator,
    setShowMobileSimulator,
    employees,
    attendance,
    leaves,
    payrolls,
    checkIn,
    checkOut,
    submitLeaveRequest
  } = useHR();

  const [mobileTab, setMobileTab] = useState<'home' | 'attendance' | 'leaves' | 'payroll'>('home');
  const [currentEmpIndex, setCurrentEmpIndex] = useState(0);
  const [showApplyLeave, setShowApplyLeave] = useState(false);

  // Leave form in mobile
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'emergency'>('annual');
  const [daysCount, setDaysCount] = useState(2);
  const [leaveReason, setLeaveReason] = useState('ظرف عائلي خاص');

  if (!showMobileSimulator) return null;

  const currentEmp = employees[currentEmpIndex] || employees[0];
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAtt = attendance.find((a) => a.employeeId === currentEmp?.id && a.date === todayStr);
  const myLeaves = leaves.filter((l) => l.employeeId === currentEmp?.id);
  const myPayroll = payrolls.find((p) => p.employeeId === currentEmp?.id && p.month === '2026-09');

  const handleMobileCheckIn = () => {
    checkIn(currentEmp.id, 'المقر الرئيسي - التجمع الخامس، القاهرة (تطبيق الجوال - GPS)');
  };

  const handleMobileCheckOut = () => {
    checkOut(currentEmp.id);
  };

  const handleMobileLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeaveRequest({
      employeeId: currentEmp.id,
      employeeName: currentEmp.fullName,
      department: currentEmp.department,
      leaveType,
      startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() + daysCount * 86400000).toISOString().slice(0, 10),
      days: daysCount,
      reason: leaveReason,
    });
    setShowApplyLeave(false);
    alert('تم تقديم طلب الإجازة بنجاح من خلال تطبيق الجوال!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center">
        
        {/* Close Button Top Right */}
        <button
          onClick={() => setShowMobileSimulator(false)}
          className="absolute -top-12 left-0 sm:left-auto sm:-left-12 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
          title="إغلاق محاكي الجوال"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Smartphone Hardware Frame */}
        <div className="w-[360px] h-[720px] bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 flex flex-col relative overflow-hidden">
          
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 bg-slate-50 rounded-[36px] overflow-hidden flex flex-col relative font-sans">
            
            {/* Top Status Bar */}
            <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 z-20 shrink-0">
              <span className="font-mono" dir="ltr">09:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">5G</span>
                <span className="w-4 h-2 rounded-xs border border-slate-800 flex items-center p-0.5">
                  <span className="bg-emerald-600 h-full w-3/4 rounded-2xs"></span>
                </span>
              </div>
            </div>

            {/* Switch Employee Helper inside Mobile for testing */}
            <div className="px-4 py-1.5 bg-emerald-700 text-white text-[10px] flex items-center justify-between shrink-0">
              <span>المستخدم النشط: <strong>{currentEmp?.fullName.split(' ')[0]}</strong></span>
              <button
                onClick={() => setCurrentEmpIndex((prev) => (prev + 1) % employees.length)}
                className="underline hover:text-emerald-200"
              >
                تبديل الموظف
              </button>
            </div>

            {/* Scrollable Screen Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Profile Card Header */}
              <div className="bg-white p-4 rounded-2xl shadow-2xs border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentEmp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentEmp?.fullName}
                    className="w-11 h-11 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{currentEmp?.fullName}</h3>
                    <span className="text-[10px] text-emerald-600 block">{currentEmp?.jobTitle}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{currentEmp?.employeeCode}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Bell className="w-4 h-4" />
                </div>
              </div>

              {/* View 1: Home Dashboard on Mobile */}
              {mobileTab === 'home' && (
                <div className="space-y-3">
                  
                  {/* Smart Attendance Fingerprint Card */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-100 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> المقر الرئيسي (نطاق GPS مطابق)
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                        {todayStr}
                      </span>
                    </div>

                    <div className="text-center py-2">
                      {todayAtt?.checkInTime && !todayAtt?.checkOutTime ? (
                        <div>
                          <span className="text-[10px] text-emerald-200 block">وقت الحضور المسجل</span>
                          <span className="text-xl font-bold font-mono text-white">{todayAtt.checkInTime}</span>
                          <span className="text-[10px] text-emerald-100 block mt-1">الدوام جاري حالياً</span>
                        </div>
                      ) : todayAtt?.checkOutTime ? (
                        <div>
                          <span className="text-[10px] text-emerald-200 block">تم تسجيل الإنصراف بنجاح</span>
                          <span className="text-lg font-bold font-mono text-white">{todayAtt.checkOutTime}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-bold text-white block">لم يتم تسجيل حضورك بعد</span>
                          <span className="text-[10px] text-emerald-200">اضغط على البصمة الذكية للتسجيل</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleMobileCheckIn}
                        disabled={!!todayAtt?.checkInTime}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                          todayAtt?.checkInTime
                            ? 'bg-white/20 text-white/50 cursor-not-allowed'
                            : 'bg-white text-emerald-800 shadow-sm hover:bg-emerald-50'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{todayAtt?.checkInTime ? 'حاضر' : 'تسجيل حضور'}</span>
                      </button>

                      <button
                        onClick={handleMobileCheckOut}
                        disabled={!todayAtt?.checkInTime || !!todayAtt?.checkOutTime}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                          !todayAtt?.checkInTime || todayAtt?.checkOutTime
                            ? 'bg-white/20 text-white/50 cursor-not-allowed'
                            : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>انصراف</span>
                      </button>
                    </div>
                  </div>

                  {/* Fast Action Shortcuts */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMobileTab('leaves');
                        setShowApplyLeave(true);
                      }}
                      className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs text-right hover:border-emerald-300 transition-colors"
                    >
                      <CalendarCheck className="w-5 h-5 text-indigo-600 mb-1" />
                      <span className="text-xs font-bold text-slate-800 block">طلب إجازة</span>
                      <span className="text-[10px] text-slate-400">رصيدك: {currentEmp?.remainingLeaveDays || 21} يوم</span>
                    </button>

                    <button
                      onClick={() => setMobileTab('payroll')}
                      className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs text-right hover:border-emerald-300 transition-colors"
                    >
                      <CreditCard className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-slate-800 block">قسيمة الراتب</span>
                      <span className="text-[10px] text-slate-400">شهر سبتمبر 2026</span>
                    </button>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">حالة طلباتي الأخيرة</h4>
                    {myLeaves.length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-2">لا توجد طلبات إجازة سابقة.</p>
                    ) : (
                      myLeaves.slice(0, 2).map((l) => (
                        <div key={l.id} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{l.reason}</span>
                            <span className="text-[10px] text-slate-400">{l.days} أيام • {l.startDate}</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              l.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : l.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {l.status === 'approved' ? 'معتمد' : l.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

              {/* View 2: Mobile Leaves */}
              {mobileTab === 'leaves' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">إدارة إجازاتي</h3>
                    <button
                      onClick={() => setShowApplyLeave(!showApplyLeave)}
                      className="text-xs font-bold text-emerald-600"
                    >
                      {showApplyLeave ? 'عرض السجل' : '+ طلب جديد'}
                    </button>
                  </div>

                  {showApplyLeave ? (
                    <form onSubmit={handleMobileLeaveSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع الإجازة:</label>
                        <select
                          value={leaveType}
                          onChange={(e) => setLeaveType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="annual">إجازة سنوية اعتيادية</option>
                          <option value="sick">إجازة مرضية</option>
                          <option value="emergency">إجازة طارئة</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">عدد الأيام المطلوبة:</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={daysCount}
                          onChange={(e) => setDaysCount(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">السبب:</label>
                        <input
                          type="text"
                          required
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        إرسال الطلب للاعتماد
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      {myLeaves.map((l) => (
                        <div key={l.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900">{l.leaveType === 'annual' ? 'إجازة سنوية' : 'إجازة طارئة'}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {l.status === 'approved' ? 'معتمد' : 'معلق'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic">"{l.reason}"</p>
                          <span className="text-[10px] text-slate-400 block mt-1 font-mono">{l.startDate} إلى {l.endDate} ({l.days} أيام)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View 3: Mobile Payslip */}
              {mobileTab === 'payroll' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <span className="font-bold text-slate-900 block">قسيمة الراتب الرقمية</span>
                        <span className="text-[10px] text-slate-400">شهر سبتمبر 2026</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        تم الصرف
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>المرتب الأساسي:</span>
                        <span className="font-mono font-bold">{myPayroll?.basicSalary.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>بدل السكن:</span>
                        <span className="font-mono">{myPayroll?.housingAllowance.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span>بدل الانتقال:</span>
                        <span className="font-mono">{myPayroll?.transportAllowance.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>تأمينات اجتماعية (11%):</span>
                        <span className="font-mono">-{(myPayroll?.socialInsuranceEmployee || myPayroll?.gosiDeduction || 0).toLocaleString('ar-EG')} ج.م</span>
                      </div>
                      <div className="flex justify-between text-rose-700">
                        <span>ضريبة كسب العمل:</span>
                        <span className="font-mono">-{(myPayroll?.incomeTaxDeduction || 0).toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-emerald-800">
                      <span>صافي الراتب:</span>
                      <span className="font-mono text-base">{myPayroll?.netSalary.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom App Navigation Bar */}
            <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-slate-400 shrink-0">
              <button
                onClick={() => setMobileTab('home')}
                className={`flex flex-col items-center gap-0.5 ${mobileTab === 'home' ? 'text-emerald-600' : ''}`}
              >
                <Home className="w-4 h-4" />
                <span className="text-[9px] font-bold">الرئيسية</span>
              </button>

              <button
                onClick={() => setMobileTab('leaves')}
                className={`flex flex-col items-center gap-0.5 ${mobileTab === 'leaves' ? 'text-emerald-600' : ''}`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span className="text-[9px] font-bold">الإجازات</span>
              </button>

              <button
                onClick={() => setMobileTab('payroll')}
                className={`flex flex-col items-center gap-0.5 ${mobileTab === 'payroll' ? 'text-emerald-600' : ''}`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[9px] font-bold">الرواتب</span>
              </button>
            </div>

            {/* Home Indicator Bar */}
            <div className="pb-1 pt-0.5 flex justify-center bg-white shrink-0">
              <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
