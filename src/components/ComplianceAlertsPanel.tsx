import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Calendar,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  Send,
  FileText,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  Download,
  Building,
  UserCheck,
  CalendarDays,
  ShieldCheck,
  X,
  Printer,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Employee, ComplianceAlert } from '../types';
import { downloadFile } from '../services/storage';

interface ComplianceAlertsPanelProps {
  onNavigateToEmployees?: () => void;
  compact?: boolean;
}

export const ComplianceAlertsPanel: React.FC<ComplianceAlertsPanelProps> = ({
  onNavigateToEmployees,
  compact = false,
}) => {
  const {
    employees,
    updateEmployee,
    addNotification,
    companyBranding,
    setActiveTab,
    setShowAdvisorModal
  } = useHR();

  // Filters & View State
  const [filterType, setFilterType] = useState<'all' | 'contracts' | 'insurance' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [renewingEmp, setRenewingEmp] = useState<Employee | null>(null);
  const [renewalPeriod, setRenewalPeriod] = useState<'1year' | '2years' | 'unlimited' | 'custom'>('1year');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [renewalNotes, setRenewalNotes] = useState<string>('');

  const [noticeEmp, setNoticeEmp] = useState<{ emp: Employee; type: 'contract' | 'insurance' } | null>(null);
  const [formPreviewEmp, setFormPreviewEmp] = useState<{ emp: Employee; form: 'form1' | 'form2' } | null>(null);

  // Compute Alerts dynamically
  const alerts: ComplianceAlert[] = useMemo(() => {
    const list: ComplianceAlert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    employees.forEach((emp) => {
      // 1. Contract Expiration Checks
      if (emp.contractType === 'fixed' && emp.contractEndDate) {
        const endDate = new Date(emp.contractEndDate);
        endDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 90) {
          let severity: 'critical' | 'warning' | 'info' = 'info';
          let title = '';
          let description = '';

          if (diffDays <= 0) {
            severity = 'critical';
            title = `انتهى عقد العمل (${emp.fullName})`;
            description = `انتهى سريان عقد العمل في تاريخ ${emp.contractEndDate}. يتطلب تجديد فوري أو اتخاذ إجراء تسوية قانونية.`;
          } else if (diffDays <= 30) {
            severity = 'critical';
            title = `اقتراب شديد لانتهاء عقد العمل (${diffDays} يوماً متبقية)`;
            description = `عقد العمل المحدد للموظف ${emp.fullName} ينتهي في ${emp.contractEndDate}. طبقاً لقانون العمل المصري يجب إخطار الموظف قبل 30 يوماً على الأقل.`;
          } else if (diffDays <= 60) {
            severity = 'warning';
            title = `موعد انتهاء العقد يقترب (${diffDays} يوماً)`;
            description = `ينتهي عقد العمل في ${emp.contractEndDate}. يُرجى دراسة قرار التجديد أو إنهاء التعاقد مع الإدارة المعنية.`;
          } else {
            severity = 'info';
            title = `إشعار مبكر: انتهاء العقد خلال ${diffDays} يوماً`;
            description = `تاريخ انتهاء العقد: ${emp.contractEndDate}. تم إدراج الموظف في قائمة مراجعات العقود الدورية.`;
          }

          list.push({
            id: `alert-contract-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.fullName,
            department: emp.department,
            jobTitle: emp.jobTitle,
            type: 'contract_expiry',
            severity,
            title,
            description,
            targetDate: emp.contractEndDate,
            daysRemaining: diffDays,
            status: 'active',
            actionType: 'renew_contract',
          });
        }
      }

      // 2. Social Insurance Renewals & Form 2 Checks
      if (emp.insuranceRenewalDate) {
        const renewalDate = new Date(emp.insuranceRenewalDate);
        renewalDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 60 || emp.insuranceFormStatus === 'form2_pending_annual') {
          const isCritical = diffDays <= 20 || emp.insuranceFormStatus === 'form2_pending_annual';
          list.push({
            id: `alert-ins-renewal-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.fullName,
            department: emp.department,
            jobTitle: emp.jobTitle,
            type: 'insurance_renewal',
            severity: isCritical ? 'critical' : 'warning',
            title: `استحقاق التجديد التأميني السنوي (استمارة 2)`,
            description: `استحقاق موعد تحديث أجر الاشتراك التأميني الشامل وتقديم استمارة 2 لمكتب التأمينات التابع في موعد أقصاه ${emp.insuranceRenewalDate}.`,
            targetDate: emp.insuranceRenewalDate,
            daysRemaining: diffDays,
            status: 'active',
            actionType: 'renew_insurance',
          });
        }
      }

      // 3. New Hire Form 1 Submission Compliance Check (Within 30 days of hireDate)
      if (emp.hireDate && emp.insuranceFormStatus === 'form1_pending') {
        const hireDate = new Date(emp.hireDate);
        const deadlineDate = new Date(hireDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        list.push({
          id: `alert-ins-form1-${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          department: emp.department,
          jobTitle: emp.jobTitle,
          type: 'insurance_form1_due',
          severity: diffDays <= 10 ? 'critical' : 'warning',
          title: `استحقاق تسليم استمارة (1) تأمينات اجتماعية`,
          description: `الموظف ملتحق جديد بتاريخ ${emp.hireDate}، والمهلة القانونية لتسليم استمارة 1 بمكتب التأمينات تنتهي خلال ${diffDays} يوماً (الحد الأقصى شهر من التعيين).`,
          targetDate: deadlineDate.toISOString().slice(0, 10),
          daysRemaining: diffDays,
          status: 'active',
          actionType: 'submit_form1',
        });
      }
    });

    // Sort by urgency: least days remaining first
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [employees]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Type filter
      if (filterType === 'contracts' && alert.type !== 'contract_expiry') return false;
      if (filterType === 'insurance' && !alert.type.startsWith('insurance')) return false;
      if (filterType === 'critical' && alert.severity !== 'critical') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          alert.employeeName.toLowerCase().includes(q) ||
          alert.department.toLowerCase().includes(q) ||
          alert.title.toLowerCase().includes(q) ||
          alert.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, filterType, searchQuery]);

  // Metric counts
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const contractsExpiringCount = alerts.filter((a) => a.type === 'contract_expiry').length;
  const insuranceRenewalsCount = alerts.filter((a) => a.type.startsWith('insurance')).length;
  const activeEmployeesCount = employees.filter((e) => e.status === 'active').length;

  // Actions
  const handleExecuteContractRenewal = () => {
    if (!renewingEmp) return;

    let newEndDate = '';
    const baseDate = renewingEmp.contractEndDate ? new Date(renewingEmp.contractEndDate) : new Date();
    
    if (renewalPeriod === '1year') {
      const d = new Date(baseDate);
      d.setFullYear(d.getFullYear() + 1);
      newEndDate = d.toISOString().slice(0, 10);
    } else if (renewalPeriod === '2years') {
      const d = new Date(baseDate);
      d.setFullYear(d.getFullYear() + 2);
      newEndDate = d.toISOString().slice(0, 10);
    } else if (renewalPeriod === 'custom') {
      if (!customEndDate) {
        alert('يرجى تحديد تاريخ انتهاء العقد الجديد');
        return;
      }
      newEndDate = customEndDate;
    } else if (renewalPeriod === 'unlimited') {
      newEndDate = '';
    }

    updateEmployee(renewingEmp.id, {
      contractType: renewalPeriod === 'unlimited' ? 'unlimited' : 'fixed',
      contractEndDate: newEndDate || undefined,
      contractStartDate: renewingEmp.contractEndDate || new Date().toISOString().slice(0, 10),
    });

    addNotification({
      title: 'تم تجديد عقد العمل بنجاح',
      message: `تم تجديد عقد الموظف ${renewingEmp.fullName} بنجاح ${renewalPeriod === 'unlimited' ? 'كعقد غير محدد المدة' : `حتى تاريخ ${newEndDate}`}.`,
      type: 'success',
      read: false,
    });

    setRenewingEmp(null);
    setRenewalNotes('');
  };

  const handleExecuteInsuranceRenewal = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    // Advance insurance renewal date to next year (2027-01-01 or 1 year ahead)
    const currentRenewal = emp.insuranceRenewalDate ? new Date(emp.insuranceRenewalDate) : new Date();
    const nextYear = new Date(currentRenewal);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextRenewalDate = nextYear.toISOString().slice(0, 10);

    updateEmployee(emp.id, {
      insuranceRenewalDate: nextRenewalDate,
      insuranceFormStatus: 'form2_submitted',
    });

    addNotification({
      title: 'تم اعتماد التجديد التأميني السنوي',
      message: `تم اعتماد وتحديث استمارة 2 والمطابقة التأمينية للموظف ${emp.fullName} وضبط موعد التجديد القادم في ${nextRenewalDate}.`,
      type: 'success',
      read: false,
    });
  };

  const exportAlertsReport = () => {
    const headers = ['الموظف', 'القسم', 'المسمى الوظيفي', 'نوع التنبيه', 'درجة الأهمية', 'التاريخ المستهدف', 'الأيام المتبقية', 'التفاصيل'];
    const rows = filteredAlerts.map((a) => [
      `"${a.employeeName}"`,
      `"${a.department}"`,
      `"${a.jobTitle}"`,
      a.type === 'contract_expiry' ? 'انتهاء عقد العمل' : 'تجديد التأمينات الاجتماعية',
      a.severity === 'critical' ? 'حرج وعاجل' : a.severity === 'warning' ? 'مهم' : 'إشعار',
      a.targetDate,
      `${a.daysRemaining} يوم`,
      `"${a.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(
      csvContent,
      `HR_Compliance_Alerts_Report_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  return (
    <div className="space-y-5">
      
      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Critical Alerts Counter */}
        <div
          onClick={() => setFilterType(filterType === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            criticalCount > 0
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 hover:shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">إجراءات عاجلة (أقل من 30 يوم)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-900 dark:text-rose-100">{criticalCount}</span>
            <span className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold">تتطلب قراراً فورياً</span>
          </div>
        </div>

        {/* Contract Expiry Counter */}
        <div
          onClick={() => setFilterType(filterType === 'contracts' ? 'all' : 'contracts')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'contracts'
              ? 'bg-amber-100/70 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 shadow-xs'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">عقود تقترب من الانتهاء</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{contractsExpiringCount}</span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">عقد قيد المتابعة</span>
          </div>
        </div>

        {/* Insurance Renewals Counter */}
        <div
          onClick={() => setFilterType(filterType === 'insurance' ? 'all' : 'insurance')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'insurance'
              ? 'bg-blue-100/70 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-xs'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تجديدات التأمينات (س2 / س1)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{insuranceRenewalsCount}</span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">استحقاقات سارية</span>
          </div>
        </div>

        {/* Compliance Rate Counter */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">نسبة الامتثال المؤسسي</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {activeEmployeesCount > 0 ? Math.round(((activeEmployeesCount - criticalCount) / activeEmployeesCount) * 100) : 100}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">مطابقة قانون العمل 12</span>
          </div>
        </div>

      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            جميع التنبيهات ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>عاجل وحرج ({criticalCount})</span>
          </button>
          <button
            onClick={() => setFilterType('contracts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'contracts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>انتهاء العقود ({contractsExpiringCount})</span>
          </button>
          <button
            onClick={() => setFilterType('insurance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'insurance'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>التجديد التأميني ({insuranceRenewalsCount})</span>
          </button>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث بالموظف أو القسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={exportAlertsReport}
            className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold shadow-2xs flex items-center gap-1.5 shrink-0 transition-colors"
            title="تصدير جدول التنبيهات إلى CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">تصدير التقرير</span>
          </button>
        </div>

      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">جميع العقود والتأمينات في حالة مطابقة تامة</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              لا توجد أي عقود منتهية أو استحقاقات تأمينية متأخرة تتطلب إجراءً عاجلاً في الوقت الحالي.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const emp = employees.find((e) => e.id === alert.employeeId);
            const isContract = alert.type === 'contract_expiry';
            const isCritical = alert.severity === 'critical';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isCritical
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-2xs'
                    : alert.severity === 'warning'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Right / Content Area */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm shadow-xs ${
                      isCritical
                        ? 'bg-rose-600 text-white animate-pulse'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isContract ? <Clock className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                      
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                            : alert.severity === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {alert.daysRemaining <= 0
                          ? 'منتهي الصلاحية'
                          : alert.daysRemaining <= 30
                          ? `متبقي ${alert.daysRemaining} يوم`
                          : `خلال ${alert.daysRemaining} يوماً`}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-md">
                        {alert.department}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {alert.employeeName} ({alert.jobTitle})
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        التاريخ المستهدف: <strong>{alert.targetDate}</strong>
                      </span>
                      {emp?.socialInsuranceNumber && (
                        <span className="font-mono">
                          الرقم التأميني: {emp.socialInsuranceNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left / Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                  {isContract ? (
                    <>
                      <button
                        onClick={() => {
                          if (emp) {
                            setRenewingEmp(emp);
                            setRenewalPeriod('1year');
                          }
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>تجديد العقد</span>
                      </button>

                      <button
                        onClick={() => {
                          if (emp) {
                            setNoticeEmp({ emp, type: 'contract' });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="إصدار خطاب إخطار رسمي للموظف وفقاً لقانون العمل"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>إخطار رسمي</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleExecuteInsuranceRenewal(alert.employeeId)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>تأكيد التجديد التأميني</span>
                      </button>

                      <button
                        onClick={() => {
                          if (emp) {
                            setFormPreviewEmp({
                              emp,
                              form: alert.type === 'insurance_form1_due' ? 'form1' : 'form2',
                            });
                          }
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="معاينة وطباعة استمارة التأمينات الاجتماعية (س1 / س2)"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-600" />
                        <span>معاينة استمارة التأمينات</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contract Renewal Modal */}
      {renewingEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  تجديد عقد العمل: {renewingEmp.fullName}
                </h3>
              </div>
              <button
                onClick={() => setRenewingEmp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>المسمى الوظيفي:</strong> {renewingEmp.jobTitle} • {renewingEmp.department}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>تاريخ الانتهاء الحالي:</strong> {renewingEmp.contractEndDate || 'غير محدد'}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>الراتب الأساسي:</strong> {renewingEmp.basicSalary.toLocaleString('ar-EG')} ج.م
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  فترة التجديد المطلوبة *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRenewalPeriod('1year')}
                    className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                      renewalPeriod === '1year'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    تجديد لمدة سنة واحدة (+1 سنة)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalPeriod('2years')}
                    className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                      renewalPeriod === '2years'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    تجديد لمدة سنتين (+2 سنة)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalPeriod('unlimited')}
                    className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                      renewalPeriod === 'unlimited'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    تحويل لعقد غير محدد المدة (دائم)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRenewalPeriod('custom')}
                    className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                      renewalPeriod === 'custom'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    تاريخ انتهاء مخصص...
                  </button>
                </div>
              </div>

              {renewalPeriod === 'custom' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ انتهاء العقد الجديد *
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات أو تعديلات على شروط التجديد (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  placeholder="مثال: تم التجديد بناءً على تقييم الأداء المتميز مع زيادة دورية معتمدة..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenewingEmp(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleExecuteContractRenewal}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  اعتماد وتثبيت التجديد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Notice Modal (B&W Formal Letter) */}
      {noticeEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                إخطار رسمي بموجب قانون العمل المصري 12 لسنة 2003
              </h3>
              <button
                onClick={() => setNoticeEmp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body */}
            <div className="mt-4 p-6 bg-white border-2 border-black rounded-xl text-black font-serif text-xs space-y-4 text-right">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-black">{companyBranding.companyName}</h4>
                  <p className="text-[10px] text-black">{companyBranding.subtitle}</p>
                </div>
                <div className="text-left font-mono text-[10px]">
                  <p>الرقم الإشاري: HR/NOTIF/{new Date().getFullYear()}/{noticeEmp.emp.employeeCode}</p>
                  <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div className="text-center py-2">
                <h3 className="font-extrabold text-sm underline decoration-2 underline-offset-4">
                  إخطار رسمي بشأن عقد العمل محدد المدة
                </h3>
              </div>

              <p className="font-bold">
                السيد الزميل / {noticeEmp.emp.fullName} المحترم،
              </p>
              <p className="leading-relaxed">
                تحية طيبة وبعد،،،<br />
                بالإشارة إلى عقد العمل المبرم بينكم وبين الشركة بصفتكم ({noticeEmp.emp.jobTitle}) بقسم ({noticeEmp.emp.department})، والذي ينتهي سريانه بتاريخ ({noticeEmp.emp.contractEndDate})؛
              </p>

              <p className="leading-relaxed">
                نود إحاطتكم علماً بأنه إعمالاً لأحكام قانون العمل المصري رقم 12 لسنة 2003، يسر إدارة الموارد البشرية إخطاركم ببدء الإجراءات الإدارية الخاصة ببحث تجديد العقد لمدد لاحقة. يرجى التكرم بمراجعة إدارة الموارد البشرية لاستكمال التوقيعات اللازمة وتحديث الملف التأميني.
              </p>

              <div className="border-t border-black pt-4 flex items-center justify-between mt-6 text-center">
                <div>
                  <p className="font-bold">توقيع المستلم (الموظف):</p>
                  <div className="h-10"></div>
                  <p className="text-[10px]">التاريخ: ____ / ____ / ________</p>
                </div>
                <div>
                  <p className="font-bold">إدارة الموارد البشرية والشؤون الإدارية:</p>
                  <div className="h-10 flex items-center justify-center font-serif italic text-xs">
                    [خاتم الشركة الرسمي]
                  </div>
                  <p className="text-[10px]">المدير الإداري: محمد زكريا</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setNoticeEmp(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الإخطار الرسمي (B&W)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Insurance Form Preview Modal */}
      {formPreviewEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                الهيئة القومية للتأمين الاجتماعي - {formPreviewEmp.form === 'form1' ? 'استمارة (1) التحاق بالعمل' : 'استمارة (2) تعديل وتجديد الأجور التأمينية'}
              </h3>
              <button
                onClick={() => setFormPreviewEmp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-5 bg-white border-2 border-black rounded-xl text-black font-serif text-xs space-y-3 text-right">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <div>
                  <h4 className="font-black text-xs">جمهورية مصر العربية</h4>
                  <p className="text-[10px]">الهيئة القومية للتأمين الاجتماعي (NOSI)</p>
                  <p className="text-[10px]">قانون التأمينات الاجتماعية والمعاشات 148 لسنة 2019</p>
                </div>
                <div className="text-left font-mono text-[10px]">
                  <p className="font-bold border border-black px-2 py-0.5 inline-block">
                    {formPreviewEmp.form === 'form1' ? 'نموذج رقم (1) تأمينات' : 'نموذج رقم (2) تأمينات'}
                  </p>
                  <p className="mt-1">الرقم التأميني للمنشأة: 19482010</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-black p-3 rounded-lg text-[11px]">
                <p><strong>اسم المؤمن عليه:</strong> {formPreviewEmp.emp.fullName}</p>
                <p><strong>الرقم القومي (14 رقم):</strong> {formPreviewEmp.emp.nationalId || '29201010101234'}</p>
                <p><strong>الرقم التأميني:</strong> {formPreviewEmp.emp.socialInsuranceNumber || '109847291'}</p>
                <p><strong>الوظيفة / المهنة:</strong> {formPreviewEmp.emp.jobTitle}</p>
                <p><strong>تاريخ بدء العمل:</strong> {formPreviewEmp.emp.hireDate}</p>
                <p><strong>أجر الاشتراك التأميني الشامل:</strong> {formPreviewEmp.emp.insuranceSalary || 14500} ج.م</p>
                <p><strong>حصة العامل (11%):</strong> {Math.round((formPreviewEmp.emp.insuranceSalary || 14500) * 0.11)} ج.م</p>
                <p><strong>حصة المنشأة (18.75%):</strong> {Math.round((formPreviewEmp.emp.insuranceSalary || 14500) * 0.1875)} ج.م</p>
              </div>

              <div className="pt-3 border-t border-black flex items-center justify-between text-center">
                <div>
                  <p className="font-bold text-[11px]">مسؤول مكتب التأمينات المختص</p>
                  <div className="h-8"></div>
                  <p className="text-[9px]">ختم شعار الهيئة</p>
                </div>
                <div>
                  <p className="font-bold text-[11px]">توقيع صاحب العمل / المدير المفوض</p>
                  <div className="h-8 flex items-center justify-center font-serif italic text-xs">
                    شركة النيل للحلول والتطوير (ش.م.م)
                  </div>
                  <p className="text-[9px]">محمد زكريا</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setFormPreviewEmp(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة النموذج الرسمي (B&W)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
