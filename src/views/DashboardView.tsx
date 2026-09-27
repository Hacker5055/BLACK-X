import React from 'react';
import {
  Users,
  Clock,
  CreditCard,
  Award,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Sparkles,
  CheckSquare,
  Building,
  UserCheck,
  ShieldCheck,
  BellRing,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { ComplianceAlertsPanel } from '../components/ComplianceAlertsPanel';
import { ComplianceScoreboard } from '../components/ComplianceScoreboard';

export const DashboardView: React.FC = () => {
  const {
    employees,
    attendance,
    leaves,
    payrolls,
    evaluations,
    tasks,
    accessRequests,
    setActiveTab,
    checkIn,
    checkOut,
    setShowAdvisorModal,
    setShowMobileSimulator
  } = useHR();

  const pendingRequests = (accessRequests || []).filter((r) => r.status === 'pending');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const lateCount = todayAttendance.filter((a) => a.status === 'late').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0;

  const currentMonthPayrolls = payrolls.filter((p) => p.month === '2026-09');
  const totalPayrollAmount = currentMonthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  const avgPerformance = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length).toFixed(1)
    : '93.6';

  // Department counts
  const departmentCounts: { [key: string]: number } = {};
  employees.forEach((e) => {
    departmentCounts[e.department] = (departmentCounts[e.department] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-l from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منصة الموارد البشرية السحابية الموحدة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              أهلاً بك في نظام موارد HR الذكي
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              تحكم كامل في شؤون الموظفين، مسيرات الرواتب، تتبع الحضور بالبصمة الذكية، وتقييم الأداء المدعوم بالذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('egyptian-law')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>مرجع قانون العمل المصري (PDF)</span>
            </button>
            <button
              onClick={() => setShowAdvisorModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>استشارة المستشار الذكي</span>
            </button>
            <button
              onClick={() => setShowMobileSimulator(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur border border-white/20 transition-colors"
            >
              <span>بوابة الجوال للموظفين</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Pending Access Requests Alert for HR Staff */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                يوجد {pendingRequests.length} طلب انضمام موظف جديد بانتظار مراجعة واعتماد الموارد البشرية
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                أحدث طلب من: <strong>{pendingRequests[0].fullName}</strong> ({pendingRequests[0].jobTitle} - {pendingRequests[0].department})
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('employees')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            الانتقال لمراجعة واعتماد الطلبات ←
          </button>
        </div>
      )}

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Employees */}
        <div
          onClick={() => setActiveTab('employees')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الموظفين</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{employees.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{employees.filter((e) => e.status === 'active').length} على رأس العمل</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Today Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة حضور اليوم</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{attendanceRate}%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">{presentCount} حاضر</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{lateCount} تأخير</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Payroll */}
        <div
          onClick={() => setActiveTab('payroll')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مسير رواتب الشهر</span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-slate-900 truncate">
              {totalPayrollAmount.toLocaleString('ar-EG')} <span className="text-xs font-medium text-slate-500">ج.م</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <span>جاهز للتحويل البنكي والرواتب</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Average KPI */}
        <div
          onClick={() => setActiveTab('performance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط الأداء العام</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{avgPerformance}%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
              <span>تقييم ممتاز (A+)</span>
            </div>
          </div>
        </div>

        {/* Metric 5: Pending Leaves */}
        <div
          onClick={() => setActiveTab('leaves')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجازات بانتظار الاعتماد</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{pendingLeaves.length}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-rose-600 font-semibold">
              <span>يتطلب مراجعة الإدارة</span>
            </div>
          </div>
        </div>

      </div>

      {/* HR Compliance & Alerts Section: Contract Expiry & Social Insurance Renewals */}
      <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                نظام تنبيهات العقود والتأمينات الاجتماعية (HR Alerts & Compliance)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة آلية لمواعيد انتهاء عقود العمل وتجديدات استمارة 2 والمطابقة مع الهيئة القومية للتأمين الاجتماعي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('employees')}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>إدارة ملفات الموظفين</span>
            </button>
          </div>
        </div>

        {/* The full interactive alerts component */}
        <ComplianceAlertsPanel onNavigateToEmployees={() => setActiveTab('employees')} />

        {/* Labor Law & Diversity Compliance Scoreboard */}
        <div className="pt-2">
          <ComplianceScoreboard />
        </div>
      </div>

      {/* Main Content Grid: Attendance Today + Fast Action & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Activity & Geofence Simulation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">سجل الحضور والإنصراف المباشر</h3>
              <p className="text-xs text-slate-500 mt-0.5">تتبع البصمة الذكية والموقع الجغرافي للمقر الرئيسي</p>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>عرض السجل الكامل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {attendance.slice(0, 5).map((att) => (
              <div key={att.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                    {att.employeeName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{att.employeeName}</h4>
                    <span className="text-xs text-slate-400">{att.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-mono font-bold text-slate-700">{att.checkInTime || '--:--'}</span>
                    <span className="text-[10px] text-slate-400 block">وقت الحضور</span>
                  </div>

                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-mono font-bold text-slate-700">{att.checkOutTime || '--:--'}</span>
                    <span className="text-[10px] text-slate-400 block">وقت الإنصراف</span>
                  </div>

                  <div>
                    {att.status === 'present' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> حاضر
                      </span>
                    )}
                    {att.status === 'late' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                        <AlertCircle className="w-3 h-3" /> متأخر
                      </span>
                    )}
                    {att.status === 'leave' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                        إجازة رسمية
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>نطاق المكتب الجغرافي: مفعل (القاهرة، التجمع الخامس)</span>
            </div>
            <span className="font-medium">ساعات الدوام الرسمية: 08:00 ص - 05:00 م</span>
          </div>
        </div>

        {/* Side Panel: Action Items & Department Overview */}
        <div className="space-y-6">
          
          {/* Quick Pending Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">مهام Google Tasks العاجلة</h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-slate-500 hover:text-emerald-600"
              >
                الكل ({pendingTasks.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 leading-snug">{t.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800 shrink-0">
                      {t.priority === 'urgent' ? 'عاجل' : t.priority === 'high' ? 'مهم' : 'عادي'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>المسؤول: {t.assignedTo}</span>
                    <span className="font-mono">{t.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">توزيع الكوادر حسب الإدارات</h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {Object.entries(departmentCounts).map(([dept, count]) => {
                const percentage = Math.round((count / employees.length) * 100);
                return (
                  <div key={dept}>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{dept}</span>
                      <span>{count} موظف ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
