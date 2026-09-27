import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Payroll,
  Evaluation,
  HRTask,
  NotificationItem,
  AuditLog,
  AccountingJournalEntry,
  CompanyBranding,
  ChatGroup,
  ChatMessage,
  AccessRequest
} from '../types';

export interface HRSystemState {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payrolls: Payroll[];
  evaluations: Evaluation[];
  tasks: HRTask[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  journalEntries: AccountingJournalEntry[];
  branding?: CompanyBranding;
  chatGroups?: ChatGroup[];
  chatMessages?: ChatMessage[];
  accessRequests?: AccessRequest[];
}

const STORAGE_KEY = 'mawared_hr_state_eg_v3';

export function loadStoredState(): HRSystemState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Ensure admin user exists in cached state
    if (parsed.employees && !parsed.employees.some((e: any) => e.email?.toLowerCase() === 'mz0970mmz@gmail.com')) {
      return null; // Force refresh from updated INITIAL_EMPLOYEES
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return null;
  }
}

export function saveStoredState(state: HRSystemState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportBackup(state: HRSystemState): string {
  const payload = {
    app: 'Mawared HRMS Egypt Enterprise',
    version: '3.0.0-EG',
    legalStandard: 'قانون العمل المصري رقم 12 لسنة 2003 وقانون التأمينات رقم 148 لسنة 2019',
    exportedAt: new Date().toISOString(),
    securityChecksum: btoa(new Date().getTime().toString() + '_MAWARED_EG_SECURED'),
    data: state,
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackup(jsonString: string): HRSystemState {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data || !parsed.data.employees) {
      throw new Error('الملف لا يحتوي على بنية بيانات نظام موارد المعتمدة.');
    }
    return parsed.data;
  } catch (err: any) {
    throw new Error('فشل استيراد النسخة الاحتياطية: ' + (err.message || 'الملف تالف'));
  }
}

/**
 * Generate Egyptian Banking Payroll / SIF file format (ACH / CBE standard for CIB, NBE, Banque Misr).
 */
export function generateWPSContent(payrolls: Payroll[], employees: Employee[]): string {
  const companyTaxId = '300-892-019'; // الرقم الضريبي
  const companySocialInsuranceNo = '24984210'; // رقم المنشأة بالتأمينات
  const bankCode = 'CIB-EG';
  const monthStr = payrolls[0]?.month || '2026-09';
  const fileDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const totalNet = payrolls.reduce((acc, p) => acc + p.netSalary, 0).toFixed(2);
  const totalEmployees = payrolls.length;

  let content = `// ملف مسير صرف المرتبات المصرفي المعتمد - البنك المركزي المصري (CBE ACH Standard)\n`;
  content += `SCR,${companyTaxId},${companySocialInsuranceNo},${bankCode},${fileDate},${monthStr},${totalEmployees},${totalNet},EGP\n`;

  payrolls.forEach((p, idx) => {
    const emp = employees.find((e) => e.id === p.employeeId);
    const nationalId = emp?.nationalId || `29${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const iban = emp?.iban || 'EG000000000000000000000000000';
    const basic = p.basicSalary.toFixed(2);
    const housing = p.housingAllowance.toFixed(2);
    const otherAllowances = (p.transportAllowance + p.bonus + p.overtimePay).toFixed(2);
    const socialIns = (p.socialInsuranceEmployee || p.gosiDeduction || 0).toFixed(2);
    const incomeTax = (p.incomeTaxDeduction || 0).toFixed(2);
    const net = p.netSalary.toFixed(2);

    content += `EDR,${nationalId},${emp?.employeeCode || `EMP-EG-${100 + idx}`},${p.employeeName},${iban},${bankCode},${net},${basic},${housing},${otherAllowances},${socialIns},${incomeTax}\n`;
  });

  return content;
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPayrollToCSV(payrolls: Payroll[]): string {
  const headers = [
    'كود الموظف',
    'اسم الموظف',
    'القسم',
    'الشهر',
    'المرتب الأساسي (ج.م)',
    'بدل السكن (ج.م)',
    'بدل الانتقال (ج.م)',
    'مكافآت وإضافي (ج.م)',
    'تأمينات اجتماعية - حصة العامل 11% (ج.م)',
    'ضريبة كسب العمل (ج.م)',
    'خصومات الغياب والتأخير (ج.م)',
    'صافي الراتب (ج.م)',
    'طريقة التحويل البنكي',
    'حالة الصرف'
  ];

  const rows = payrolls.map(p => [
    p.employeeId,
    `"${p.employeeName}"`,
    `"${p.department}"`,
    p.month,
    p.basicSalary,
    p.housingAllowance,
    p.transportAllowance,
    p.bonus + p.overtimePay,
    p.socialInsuranceEmployee || p.gosiDeduction,
    p.incomeTaxDeduction || 0,
    p.absenceDeduction,
    p.netSalary,
    `"${p.paymentMethod}"`,
    p.status === 'paid' ? 'تم الصرف' : p.status === 'approved' ? 'معتمد' : 'مسودة'
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
