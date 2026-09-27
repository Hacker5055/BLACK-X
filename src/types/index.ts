export interface OnboardingDocRecord {
  id: string;
  name: string; // e.g. "أصل المؤهل الدراسي", "شهادة التجنيد", "الفيش الجنائي"
  isRequired: boolean;
  isSubmitted: boolean;
  submittedAt?: string;
  notes?: string;
  documentNumber?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  hireDate: string;
  status: 'active' | 'on_leave' | 'terminated';
  nationalId?: string; // Egyptian 14-digit National ID
  socialInsuranceNumber?: string; // الرقم التأميني
  iban?: string; // Egyptian IBAN (EG...)
  contractType?: 'fixed' | 'unlimited' | 'temporary'; // نوع العقد: محدد المدة، غير محدد المدة، مؤقت
  contractStartDate?: string;
  contractEndDate?: string; // تاريخ انتهاء العقد
  insuranceJoinDate?: string; // تاريخ بدء الاشتراك التأميني
  insuranceRenewalDate?: string; // موعد التجديد السنوي (استمارة 2) أو المطابقة
  insuranceFormStatus?: 'form1_completed' | 'form2_pending_annual' | 'form2_submitted' | 'form1_pending';
  insuranceSalary?: number; // أجر الاشتراك التأميني الشامل
  avatar?: string;
  isSpecialNeeds?: boolean; // نسبة الـ 5% ذوي الهمم (قانون 10 لسنة 2018)
  onboardingDocuments?: OnboardingDocRecord[]; // مسوغات التعيين الرسمية
  remainingLeaveDays?: number;
  casualLeaveDays?: number; // إجازة عارضة (7 أيام سنوياً)
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplianceAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  type: 'contract_expiry' | 'insurance_renewal' | 'insurance_form1_due' | 'insurance_form2_due';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  targetDate: string;
  daysRemaining: number;
  status: 'active' | 'dismissed' | 'resolved';
  actionType?: 'renew_contract' | 'renew_insurance' | 'submit_form1' | 'submit_form2';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workHours: number;
  overtimeHours: number;
  status: 'present' | 'late' | 'absent' | 'leave' | 'half_day';
  location?: string;
  notes?: string;
  createdAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'annual' | 'casual' | 'sick' | 'unpaid' | 'emergency' | 'maternity' | 'paternity' | 'pilgrimage';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  actionNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Payroll {
  id: string;
  month: string; // e.g. "2026-09"
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  overtimePay: number;
  bonus: number;
  socialInsuranceEmployee: number; // حصة العامل في التأمينات 11% (قانون 148 لسنة 2019)
  socialInsuranceEmployer: number; // حصة صاحب العمل في التأمينات 18.75%
  gosiDeduction: number; // Aliased for backward compatibility with 11% social insurance
  incomeTaxDeduction: number; // ضريبة كسب العمل
  martyrsFundDeduction?: number; // صندوق تكريم الشهداء
  absenceDeduction: number;
  otherDeductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  period: string; // e.g. "Q3 2026"
  productivityScore: number; // 0-100
  qualityScore: number;
  punctualityScore: number;
  teamworkScore: number;
  innovationScore: number;
  overallScore: number;
  strengths: string;
  areasForImprovement: string;
  goals: string;
  aiSummary?: string;
  evaluatorName: string;
  status: 'draft' | 'submitted' | 'finalized';
  createdAt: string;
}

export interface HRTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  googleTaskId?: string;
  syncedWithGoogle?: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payroll' | 'leave';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  category?: 'employee' | 'payroll' | 'contract' | 'insurance' | 'onboarding' | 'system' | 'security' | 'settlement';
  performedBy: string;
  performedByEmail?: string;
  targetEntity?: string;
  financialImpact?: number; // e.g. difference in salary or settlement
  severity?: 'info' | 'warning' | 'critical';
  details: string;
  createdAt: string;
  ipAddress?: string;
}

export interface EOSCalculation {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  terminationDate: string;
  reason: 'resignation' | 'contract_expiry' | 'dismissal' | 'retirement' | 'mutual_agreement';
  serviceYears: number;
  serviceMonths: number;
  serviceDays: number;
  lastBasicSalary: number;
  lastGrossSalary: number;
  eosGratuityAmount: number; // مكافأة نهاية الخدمة المادة 126
  unusedLeaveDays: number;
  unusedLeaveCompensation: number; // مقابل رصيد الإجازات
  noticePeriodCompensation: number; // بدل مهلة الإخطار إن وجد
  bonusesAndRewards: number; // مكافآت أو أرباح مستحقة
  deductionsAndCustody: number; // خصومات عهد أو سلفيات
  netSettlementAmount: number; // صافي مستحقات نهاية الخدمة
  verificationHash: string; // كود التحقق الرقمي لمنع التزوير
  status: 'draft' | 'approved' | 'paid_and_cleared';
  notes?: string;
  createdAt: string;
  clearedAt?: string;
  clearedBy?: string;
}

export interface DocumentVerificationRecord {
  verificationHash: string;
  documentType: 'salary_certificate' | 'payslip' | 'eos_clearance' | 'hr_notice' | 'insurance_form';
  title: string;
  employeeCode: string;
  employeeName: string;
  nationalIdMasked: string;
  issueDate: string;
  expiryDate?: string;
  issuedBy: string;
  status: 'valid' | 'revoked' | 'expired';
  metadataSummary: Record<string, any>;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface AccountingJournalEntry {
  id: string;
  referenceNo: string;
  date: string;
  description: string;
  system: 'qoyod' | 'daftra' | 'quickbooks' | 'xero' | 'zoho';
  status: 'draft' | 'synced';
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  syncedAt?: string;
}

export interface CompanyBranding {
  companyName: string;
  subtitle: string;
  logoUrl: string;
  taxNumber?: string;
  commercialRecord?: string;
  address?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  department: string; // 'all' or specific department
  icon?: string;
  isDepartmentOnly?: boolean;
  memberEmails?: string[];
  createdAt: string;
}

export interface AccessRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  department: string;
  jobTitle: string;
  employeeCode?: string;
  socialInsuranceNumber?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}


