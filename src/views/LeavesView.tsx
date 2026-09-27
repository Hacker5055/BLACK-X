import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Calendar as CalendarIcon,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  CalendarRange,
  Users,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  Layers,
  Filter,
  CheckSquare
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { LeaveRequest } from '../types';
import {
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  GoogleCalendarEvent
} from '../services/workspace';

export const LeavesView: React.FC = () => {
  const {
    employees,
    leaves,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    googleToken,
    isGoogleConnected,
    signInWithGoogle,
    addNotification,
    companyBranding
  } = useHR();

  // Tab View Mode: 'calendar' (Visual availability) or 'requests' (Management table)
  const [viewMode, setViewMode] = useState<'calendar' | 'requests'>('calendar');

  // Calendar Date State (Defaulting to current date or active month)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 1)); // September 2026 default
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDayDetails, setSelectedDayDetails] = useState<string | null>(null);

  // Google Calendar Integration States
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState<boolean>(false);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);
  const [syncingLeaveId, setSyncingLeaveId] = useState<string | null>(null);
  const [confirmSyncModal, setConfirmSyncModal] = useState<{
    leave: LeaveRequest;
  } | null>(null);

  // Modal & Apply Form States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    leaveType: 'annual' as 'annual' | 'sick' | 'unpaid' | 'emergency' | 'maternity' | 'paternity',
    startDate: '2026-09-15',
    endDate: '2026-09-18',
    days: 4,
    reason: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Fetch Google Calendar events when token or month changes
  useEffect(() => {
    if (googleToken) {
      loadGoogleCalendarData();
    }
  }, [googleToken, year, month]);

  const loadGoogleCalendarData = async () => {
    if (!googleToken) return;
    setIsLoadingCalendar(true);
    setCalendarSyncError(null);
    try {
      const timeMin = new Date(year, month, 1).toISOString();
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const events = await fetchGoogleCalendarEvents(googleToken, timeMin, timeMax);
      setCalendarEvents(events);
    } catch (err: any) {
      console.warn('Could not load Google Calendar events:', err);
      setCalendarSyncError('تعذر جلب أحداث Google Calendar المباشرة، يرجى التحقق من اتصال الحساب.');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // Sync approved leave to Google Calendar with mandatory confirmation
  const handleSyncLeaveToCalendar = async () => {
    if (!confirmSyncModal || !googleToken) return;
    const { leave } = confirmSyncModal;
    setSyncingLeaveId(leave.id);

    try {
      await createGoogleCalendarEvent(googleToken, {
        summary: `إجازة رسمية: ${leave.employeeName} (${leave.department})`,
        description: `نوع الإجازة: ${leave.leaveType}\nالسبب: ${leave.reason}\nمعتمدة عبر منظومة موارد HR.`,
        startDate: leave.startDate,
        endDate: leave.endDate,
      });

      addNotification({
        title: 'تمت المزامنة مع Google Calendar',
        message: `تم إدراج إجازة «${leave.employeeName}» في تقويم Google بنجاح.`,
        type: 'success',
        read: false,
      });

      // Refresh calendar
      await loadGoogleCalendarData();
    } catch (err: any) {
      addNotification({
        title: 'فشل المزامنة',
        message: 'حدث خطأ أثناء إضافة الإجازة إلى Google Calendar.',
        type: 'warning',
        read: false,
      });
    } finally {
      setSyncingLeaveId(null);
      setConfirmSyncModal(null);
    }
  };

  // Form helpers
  const handleDateChange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.max(0, e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setFormData((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      days: diffDays > 0 ? diffDays : 1,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === formData.employeeId);
    if (!emp) return;

    if (!formData.reason.trim()) {
      addNotification({
        title: 'تنبيه',
        message: 'يرجى كتابة سبب طلب الإجازة.',
        type: 'warning',
        read: false,
      });
      return;
    }

    submitLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.fullName,
      department: emp.department,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: formData.days,
      reason: formData.reason,
    });

    addNotification({
      title: 'تم تقديم طلب الإجازة',
      message: `تم إرسال طلب إجازة (${formData.days} يوم) للموظف ${emp.fullName}.`,
      type: 'success',
      read: false,
    });

    setShowApplyModal(false);
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const pastLeaves = leaves.filter((l) => l.status !== 'pending');

  // Filter approved leaves
  const approvedLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const isApproved = l.status === 'approved';
      if (selectedDepartment === 'all') return isApproved;
      return isApproved && l.department === selectedDepartment;
    });
  }, [leaves, selectedDepartment]);

  // Calendar Grid Calculations
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Leading blanks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNumber: null,
        dateStr: null,
        leaves: [] as LeaveRequest[],
        events: [] as GoogleCalendarEvent[],
        totalTeamCount: 0,
        onLeaveCount: 0,
        availableCount: 0,
        availabilityPct: 100,
      });
    }

    // Month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      // Leaves on this date
      const leavesOnDate = approvedLeaves.filter((l) => {
        return dateStr >= l.startDate && dateStr <= l.endDate;
      });

      // Google Calendar events on this date
      const eventsOnDate = calendarEvents.filter((ev) => {
        const evStart = ev.start?.date || ev.start?.dateTime?.slice(0, 10);
        const evEnd = ev.end?.date || ev.end?.dateTime?.slice(0, 10) || evStart;
        return !!evStart && !!evEnd && dateStr >= evStart && dateStr <= evEnd;
      });

      // Filtered Employees count for team availability
      const totalTeamCount = selectedDepartment === 'all'
        ? employees.length
        : employees.filter((e) => e.department === selectedDepartment).length;

      const onLeaveCount = leavesOnDate.length;
      const availableCount = Math.max(0, totalTeamCount - onLeaveCount);
      const availabilityPct = totalTeamCount > 0 ? Math.round((availableCount / totalTeamCount) * 100) : 100;

      days.push({
        dayNumber: d,
        dateStr,
        leaves: leavesOnDate,
        events: eventsOnDate,
        totalTeamCount,
        onLeaveCount,
        availableCount,
        availabilityPct,
      });
    }

    return days;
  }, [year, month, approvedLeaves, calendarEvents, employees, selectedDepartment]);

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const leaveTypeColors: Record<string, { bg: string; text: string; label: string; border: string }> = {
    annual: { bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-800 dark:text-emerald-300', label: 'سنوية', border: 'border-emerald-300 dark:border-emerald-800' },
    sick: { bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-800 dark:text-rose-300', label: 'مرضية', border: 'border-rose-300 dark:border-rose-800' },
    casual: { bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-300', label: 'عارضة', border: 'border-amber-300 dark:border-amber-800' },
    emergency: { bg: 'bg-orange-100 dark:bg-orange-950/80', text: 'text-orange-800 dark:text-orange-300', label: 'طارئة', border: 'border-orange-300 dark:border-orange-800' },
    unpaid: { bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', label: 'بدون أجر', border: 'border-slate-300 dark:border-slate-700' },
    maternity: { bg: 'bg-purple-100 dark:bg-purple-950/80', text: 'text-purple-800 dark:text-purple-300', label: 'أمومة', border: 'border-purple-300 dark:border-purple-800' },
    paternity: { bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-800 dark:text-blue-300', label: 'أبوة', border: 'border-blue-300 dark:border-blue-800' },
  };

  // Day Selected Details
  const selectedDayObj = useMemo(() => {
    if (!selectedDayDetails) return null;
    return calendarDays.find((d) => d.dateStr === selectedDayDetails);
  }, [selectedDayDetails, calendarDays]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">إدارة الإجازات وجاهزية الفريق</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              متوافق مع تقويم Google
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            عرض بصري تفاعلي للإجازات المعتمدة، معدل جاهزية الفريق، وتكامل Google Calendar المباشر
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>التقويم البصري والجاهزية</span>
            </button>
            <button
              onClick={() => setViewMode('requests')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'requests'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>طلبات وسجلات الإجازات</span>
              {pendingLeaves.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">طلب إجازة جديد</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISUAL CALENDAR VIEW (Displaying Approved Leaves & Google Calendar API) */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          
          {/* Google Calendar Integration Status & Availability Summary */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Google Calendar Sync Controls */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    مزامنة تقويم Google Calendar
                  </h4>
                  {googleToken ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      متصل ومفعل
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      يتطلب ربط Google
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {calendarEvents.length > 0
                    ? `تم تحميل ${calendarEvents.length} حدث واجتماع من تقويم Google لشهر ${monthNames[month]}`
                    : 'يمكنك جلب أحداث ومواعيد الفريق لإظهار أوقات الانشغال والجاهزية بدقة'}
                </p>
              </div>
            </div>

            {/* Sync Button & Department Filter */}
            <div className="flex items-center gap-2">
              {googleToken ? (
                <button
                  onClick={loadGoogleCalendarData}
                  disabled={isLoadingCalendar}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                  <span>تحديث تقويم Google</span>
                </button>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ربط تقويم Google</span>
                </button>
              )}

              {/* Department Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">كافة الأقسام</option>
                  <option value="الهندسة والتقنية">الهندسة والتقنية</option>
                  <option value="الموارد البشرية والإدارة العليا">الموارد البشرية</option>
                  <option value="المالية والمحاسبة">المالية والمحاسبة</option>
                  <option value="التسويق والمبيعات">التسويق والمبيعات</option>
                  <option value="العمليات التشغيلية">العمليات التشغيلية</option>
                </select>
              </div>
            </div>

          </div>

          {calendarSyncError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 text-center">
              {calendarSyncError}
            </div>
          )}

          {/* Calendar Navigation Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {monthNames[month]} {year}
                </h3>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  (إجازات معتمدة: {approvedLeaves.length} طلب)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToday}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  اليوم
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="الشهر التالي"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 7-Days Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              
              {/* Day Headers */}
              {weekDays.map((dName, idx) => (
                <div
                  key={idx}
                  className="text-center py-2 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl"
                >
                  {dName}
                </div>
              ))}

              {/* Calendar Grid Cells */}
              {calendarDays.map((cell, idx) => {
                if (!cell.dayNumber || !cell.dateStr) {
                  return (
                    <div
                      key={idx}
                      className="min-h-[90px] sm:min-h-[110px] bg-slate-50/40 dark:bg-slate-800/10 rounded-2xl border border-transparent"
                    />
                  );
                }

                const isToday = new Date().toISOString().slice(0, 10) === cell.dateStr;
                const hasLeaves = cell.leaves.length > 0;
                const hasEvents = cell.events.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDayDetails(cell.dateStr)}
                    className={`min-h-[95px] sm:min-h-[115px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isToday
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : hasLeaves
                        ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 hover:border-emerald-300'
                        : 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Date Number & Team Availability Indicator */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold font-mono w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-800 dark:text-slate-200 group-hover:text-emerald-600'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Availability Pill */}
                      {cell.onLeaveCount > 0 ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                          {cell.onLeaveCount} في إجازة
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          جاهزية 100%
                        </span>
                      )}
                    </div>

                    {/* Chips for Approved Leaves */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {cell.leaves.slice(0, 2).map((leave) => {
                        const style = leaveTypeColors[leave.leaveType] || leaveTypeColors.annual;
                        return (
                          <div
                            key={leave.id}
                            className={`p-1 rounded-lg text-[10px] font-bold border truncate flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}
                            title={`${leave.employeeName} (${leave.department}) - ${style.label}: ${leave.reason}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                            <span className="truncate">{leave.employeeName.split(' ')[0]}</span>
                            <span className="text-[9px] opacity-75 font-normal">({style.label})</span>
                          </div>
                        );
                      })}

                      {cell.leaves.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold block text-center">
                          +{cell.leaves.length - 2} إجازات أخرى
                        </span>
                      )}

                      {/* Google Calendar Event Indicator */}
                      {hasEvents && (
                        <div className="p-0.5 px-1.5 rounded-md text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 truncate flex items-center gap-1">
                          <CalendarIcon className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{cell.events[0].summary}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Micro Availability Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          cell.availabilityPct > 80
                            ? 'bg-emerald-500'
                            : cell.availabilityPct > 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${cell.availabilityPct}%` }}
                      />
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* Quick Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800 dark:text-slate-200">دليل أنواع الإجازات:</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> سنوية
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> عارضة
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> مرضية
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> موعد Google Calendar
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              اضغط على أي يوم في التقويم لعرض تفاصيل الجاهزية ومزامنة الإجازات مع تقويم Google.
            </span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REQUESTS & APPROVAL WORKFLOW VIEW (Existing Table & Pending Actions) */}
      {/* ========================================================================= */}
      {viewMode === 'requests' && (
        <div className="space-y-6">
          
          {/* Pending Requests Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  طلبات الإجازات المعلقة بانتظار اعتماد الإدارة ({pendingLeaves.length})
                </h3>
              </div>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                لا توجد طلبات إجازة معلقة حالياً. جميع الطلبات تم اتخاذ إجراء بشأنها.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingLeaves.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.employeeName}</h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{req.department}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${leaveTypeColors[req.leaveType]?.bg} ${leaveTypeColors[req.leaveType]?.text}`}>
                          {leaveTypeColors[req.leaveType]?.label || req.leaveType}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            الفترة: من <strong className="font-mono text-slate-800 dark:text-slate-200">{req.startDate}</strong> إلى <strong className="font-mono text-slate-800 dark:text-slate-200">{req.endDate}</strong> ({req.days} أيام)
                          </span>
                        </div>
                        <div className="flex items-start gap-2 pt-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="italic">"{req.reason}"</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          const note = prompt('أدخل سبب أو ملاحظات الرفض:');
                          rejectLeaveRequest(req.id, note || undefined);
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        رفض الطلب
                      </button>
                      <button
                        onClick={() => {
                          approveLeaveRequest(req.id, 'تمت الموافقة من إدارة الموارد البشرية');
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        اعتماد وموافقة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Requests History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">سجل الإجازات السابق وتاريخ الموافقات</h3>
              <span className="text-xs text-slate-400">إجمالي {pastLeaves.length} طلب سابق</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="px-4 py-3">الموظف</th>
                    <th className="px-4 py-3">القسم</th>
                    <th className="px-4 py-3">نوع الإجازة</th>
                    <th className="px-4 py-3">من تاريخ</th>
                    <th className="px-4 py-3">إلى تاريخ</th>
                    <th className="px-4 py-3">الأيام</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3 text-center">مزامنة تقويم Google</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pastLeaves.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {req.employeeName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {req.department}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${leaveTypeColors[req.leaveType]?.bg} ${leaveTypeColors[req.leaveType]?.text}`}>
                          {leaveTypeColors[req.leaveType]?.label || req.leaveType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {req.startDate}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {req.endDate}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white font-mono">
                        {req.days}
                      </td>
                      <td className="px-4 py-3">
                        {req.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            معتمدة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            مرفوضة
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {req.status === 'approved' && (
                          <button
                            onClick={() => setConfirmSyncModal({ leave: req })}
                            disabled={!googleToken}
                            title={googleToken ? 'إضافة إلى تقويم Google' : 'يتطلب تسجيل الدخول عبر Google'}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-40"
                          >
                            <CalendarIcon className="w-3 h-3" />
                            <span>مزامنة لتقويم Google</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DAY DETAILS DRAWER / MODAL (Showing team on leave + Google events) */}
      {/* ========================================================================= */}
      {selectedDayObj && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    جاهزية الفريق ليوم {selectedDayObj.dateStr}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    معدل التوافر: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{selectedDayObj.availabilityPct}%</strong> ({selectedDayObj.availableCount} متاح من {selectedDayObj.totalTeamCount})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Colleagues on Leave Section */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>الموظفون في إجازة معتمدة ({selectedDayObj.leaves.length})</span>
                </h4>

                {selectedDayObj.leaves.length === 0 ? (
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 text-center font-medium">
                    🟢 لا توجد أي إجازات معتمدة في هذا اليوم. كامل أعضاء الفريق متاحون للعمل.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayObj.leaves.map((leave) => {
                      const style = leaveTypeColors[leave.leaveType] || leaveTypeColors.annual;
                      return (
                        <div
                          key={leave.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                                {leave.employeeName}
                              </h5>
                              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${style.bg} ${style.text}`}>
                                {style.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              {leave.department} • سبب: "{leave.reason}"
                            </span>
                          </div>

                          {/* Sync Button */}
                          {googleToken && (
                            <button
                              onClick={() => setConfirmSyncModal({ leave })}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <CalendarIcon className="w-3 h-3" />
                              <span>تقويم Google</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Google Calendar Events on This Day */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  <span>مواعيد واجتماعات Google Calendar المجدولة ({selectedDayObj.events.length})</span>
                </h4>

                {selectedDayObj.events.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                    لا توجد اجتماعات مسجلة في هذا اليوم.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayObj.events.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <h5 className="font-bold text-indigo-950 dark:text-indigo-200">{ev.summary}</h5>
                          {ev.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{ev.description}</p>
                          )}
                        </div>
                        {ev.htmlLink && (
                          <a
                            href={ev.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                            title="فتح في Google Calendar"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONFIRMATION DIALOG (Mandatory before Google Calendar Mutation)        */}
      {/* ========================================================================= */}
      {confirmSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800 mb-3 text-indigo-600 dark:text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                تأكيد إضافة الإجازة إلى تقويم Google
              </h3>
            </div>

            <p className="leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
              هل توافق على إضافة حدث الإجازة التالي إلى حساب Google Calendar الخاص بك لإظهار عدم توفر الموظف؟
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 mb-4">
              <div>
                <span className="text-slate-400 block text-[10px]">الموظف:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{confirmSyncModal.leave.employeeName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الفترة:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  من {confirmSyncModal.leave.startDate} إلى {confirmSyncModal.leave.endDate} ({confirmSyncModal.leave.days} أيام)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">النوع والسبب:</span>
                <span className="text-slate-700 dark:text-slate-300">{confirmSyncModal.leave.leaveType} - "{confirmSyncModal.leave.reason}"</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncLeaveToCalendar}
                disabled={!!syncingLeaveId}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {syncingLeaveId ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>تأكيد المزامنة والإضافة</span>
              </button>
              <button
                onClick={() => setConfirmSyncModal(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. APPLY NEW LEAVE MODAL                                                  */}
      {/* ========================================================================= */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">تقديم طلب إجازة رسمي جديد</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الموظف</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نوع الإجازة</label>
                <select
                  value={formData.leaveType}
                  onChange={(e: any) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="annual">إجازة سنوية اعتيادية (رصيد 21 يوماً)</option>
                  <option value="casual">إجازة عارضة (حد أقصى يومين بالمرة)</option>
                  <option value="sick">إجازة مرضية (بتقرير معتمد)</option>
                  <option value="emergency">إجازة طارئة</option>
                  <option value="unpaid">إجازة بدون مرتب</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => handleDateChange(e.target.value, formData.endDate)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => handleDateChange(formData.startDate, e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">سبب ومبررات الإجازة</label>
                <textarea
                  rows={3}
                  required
                  placeholder="اكتب سبب طلب الإجازة والشخص القائم بالعمل..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  إرسال الطلب للاعتماد
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
