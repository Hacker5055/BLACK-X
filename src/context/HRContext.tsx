import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
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
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_PAYROLLS,
  INITIAL_EVALUATIONS,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_JOURNAL_ENTRIES,
  DEFAULT_BRANDING,
  INITIAL_CHAT_GROUPS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ACCESS_REQUESTS
} from '../services/mockData';
import {
  loadStoredState,
  saveStoredState,
  HRSystemState,
  exportBackup,
  importBackup,
  downloadFile
} from '../services/storage';
import {
  auth,
  initAuth,
  googleSignIn,
  logout,
  testFirestoreConnection,
  isAuthCancellation,
  db
} from '../services/firebase';
import {
  fetchGoogleTasks,
  createGoogleTask,
  updateGoogleTaskStatus
} from '../services/workspace';

interface HRContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payrolls: Payroll[];
  evaluations: Evaluation[];
  tasks: HRTask[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  journalEntries: AccountingJournalEntry[];

  // User & Auth
  currentUser: User | null;
  googleToken: string | null;
  isGoogleConnected: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsRegisteredUser: (email: string) => void;
  signOut: () => Promise<void>;

  // Actions
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  checkIn: (employeeId: string, location?: string) => void;
  checkOut: (employeeId: string) => void;

  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
  approveLeaveRequest: (id: string, note?: string) => void;
  rejectLeaveRequest: (id: string, note?: string) => void;

  generateMonthlyPayroll: (month: string) => void;
  markPayrollPaid: (payrollId: string) => void;

  addEvaluation: (evalData: Omit<Evaluation, 'id' | 'createdAt'>) => void;

  addTask: (task: Omit<HRTask, 'id' | 'createdAt'>, syncToGoogle?: boolean) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  syncAllTasksWithGoogle: () => Promise<void>;

  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  syncJournalEntryToCloud: (id: string) => Promise<void>;

  // Modals & Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showMobileSimulator: boolean;
  setShowMobileSimulator: (show: boolean) => void;
  showAdvisorModal: boolean;
  setShowAdvisorModal: (show: boolean) => void;
  showUserGuide: boolean;
  setShowUserGuide: (show: boolean) => void;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Company Branding & Restrictions (Only mz0970mmz@gmail.com can edit)
  companyBranding: CompanyBranding;
  updateCompanyBranding: (branding: Partial<CompanyBranding>) => { success: boolean; error?: string };
  canEditBranding: boolean;

  // Employee Portal & Role
  currentEmployee: Employee | null;
  isCurrentUserAdmin: boolean;
  isHRStaff: boolean;
  userRole: 'admin' | 'employee';
  setUserRole: (role: 'admin' | 'employee') => void;

  // Internal Corporate Chat (WhatsApp Style)
  chatGroups: ChatGroup[];
  chatMessages: ChatMessage[];
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  sendChatMessage: (groupId: string, content: string) => void;
  createChatGroup: (group: Omit<ChatGroup, 'id' | 'createdAt'>) => void;

  // Access Requests & Registration for new employees
  accessRequests: AccessRequest[];
  isEmployeeRegistered: boolean;
  submitAccessRequest: (req: Omit<AccessRequest, 'id' | 'status' | 'requestedAt'>) => void;
  approveAccessRequest: (requestId: string) => void;
  rejectAccessRequest: (requestId: string, reason?: string) => void;

  // Employee Portal Full Screen Navigation
  employeeFullScreenView: 'portal' | 'chat' | 'payslips' | 'leaves' | 'attendance' | 'certificate' | 'profile';
  setEmployeeFullScreenView: (view: 'portal' | 'chat' | 'payslips' | 'leaves' | 'attendance' | 'certificate' | 'profile') => void;
  selectedPayslipForView: Payroll | null;
  setSelectedPayslipForView: (payroll: Payroll | null) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // System
  backupSystemData: () => void;
  restoreSystemData: (fileContent: string) => void;
  isOnline: boolean;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Load initial state from localStorage if available, or use realistic seed
  const [state, setState] = useState<HRSystemState>(() => {
    const saved = loadStoredState();
    if (saved) {
      return {
        ...saved,
        branding: saved.branding || DEFAULT_BRANDING,
        chatGroups: saved.chatGroups || INITIAL_CHAT_GROUPS,
        chatMessages: saved.chatMessages || INITIAL_CHAT_MESSAGES,
        accessRequests: saved.accessRequests || INITIAL_ACCESS_REQUESTS,
      };
    }
    return {
      employees: INITIAL_EMPLOYEES,
      attendance: INITIAL_ATTENDANCE,
      leaves: INITIAL_LEAVES,
      payrolls: INITIAL_PAYROLLS,
      evaluations: INITIAL_EVALUATIONS,
      tasks: INITIAL_TASKS,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      branding: DEFAULT_BRANDING,
      chatGroups: INITIAL_CHAT_GROUPS,
      chatMessages: INITIAL_CHAT_MESSAGES,
      accessRequests: INITIAL_ACCESS_REQUESTS,
    };
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('employee-portal');
  const [showMobileSimulator, setShowMobileSimulator] = useState<boolean>(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState<boolean>(false);
  const [showUserGuide, setShowUserGuide] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Employee Full Screen Navigation State
  const [employeeFullScreenView, setEmployeeFullScreenView] = useState<'portal' | 'chat' | 'payslips' | 'leaves' | 'attendance' | 'certificate' | 'profile'>('portal');
  const [selectedPayslipForView, setSelectedPayslipForView] = useState<Payroll | null>(null);

  // Dark Mode state & persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('mawared_dark_mode');
      if (savedTheme !== null) return savedTheme === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mawared_dark_mode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // User and Role helpers
  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const matchingEmployee = state.employees.find(
    (e) => e.email.toLowerCase().trim() === userEmail
  );

  const isHRStaff = 
    userEmail === 'mz0970mmz@gmail.com' || 
    userEmail.includes('admin') || 
    userEmail.includes('hr') ||
    matchingEmployee?.department === 'الموارد البشرية' ||
    matchingEmployee?.department === 'الموارد البشرية والإدارة العليا' ||
    Boolean(matchingEmployee?.jobTitle && (matchingEmployee.jobTitle.toLowerCase().includes('hr') || matchingEmployee.jobTitle.includes('موارد بشرية')));

  const isCurrentUserAdmin = isHRStaff;
  
  // Registration Verification: mz0970mmz is always registered, other employees must be active in employees list
  const isEmployeeRegistered = 
    userEmail === 'mz0970mmz@gmail.com' || 
    state.employees.some(
      (e) => e.email.toLowerCase().trim() === userEmail && e.status === 'active'
    );

  const currentEmployee = matchingEmployee || (isCurrentUserAdmin ? state.employees[0] : null);

  const [userRole, setUserRole] = useState<'admin' | 'employee'>(() => {
    return isHRStaff ? 'admin' : 'employee';
  });

  // Access Requests & Registration Management
  const accessRequests: AccessRequest[] = state.accessRequests || INITIAL_ACCESS_REQUESTS;

  const submitAccessRequest = (reqData: Omit<AccessRequest, 'id' | 'status' | 'requestedAt'>) => {
    const newReq: AccessRequest = {
      id: `req-${Date.now()}`,
      ...reqData,
      status: 'pending',
      requestedAt: new Date().toISOString().slice(0, 10),
    };

    const hrTask: HRTask = {
      id: `task-${Date.now()}`,
      title: `مراجعة وتدقيق طلب اعتماد موظف جديد: ${reqData.fullName}`,
      description: `الموظف ${reqData.fullName} برقم قومي (${reqData.nationalId}) يطلب تفعيل حسابه بقسم ${reqData.department} (${reqData.jobTitle}).`,
      assignedTo: 'فريق الموارد البشرية (HR)',
      dueDate: new Date().toISOString().slice(0, 10),
      priority: 'urgent',
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      accessRequests: [newReq, ...(prev.accessRequests || INITIAL_ACCESS_REQUESTS)],
      tasks: [hrTask, ...(prev.tasks || [])],
    }));

    logAudit('تقديم طلب انضمام', reqData.fullName, `طلب موظف جديد الانضمام للمنصة: ${reqData.email} (${reqData.department} - ${reqData.jobTitle})`);
    addNotification({
      title: 'طلب انضمام موظف جديد بانتظار الاعتماد',
      message: `الموظف ${reqData.fullName} (${reqData.jobTitle}) قدم طلب دخول للمنصة. يرجى مراجعة وتدقيق البيانات.`,
      type: 'info',
      read: false,
    });
  };

  const approveAccessRequest = (requestId: string) => {
    const req = (state.accessRequests || INITIAL_ACCESS_REQUESTS).find((r) => r.id === requestId);
    if (!req) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeCode: req.employeeCode || `EMP-EG-${100 + state.employees.length + 1}`,
      fullName: req.fullName,
      email: req.email.toLowerCase().trim(),
      phone: req.phone,
      department: req.department,
      jobTitle: req.jobTitle,
      basicSalary: 14000,
      housingAllowance: 2000,
      transportAllowance: 1000,
      otherAllowances: 500,
      hireDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      nationalId: req.nationalId,
      socialInsuranceNumber: req.socialInsuranceNumber || '109847291',
      iban: 'EG380002000100000099999999999',
      remainingLeaveDays: 21,
      casualLeaveDays: 6,
    };

    // Create an initial September 2026 payslip for this newly approved employee
    const initialPayroll: Payroll = {
      id: `pay-${Date.now()}`,
      month: '2026-09',
      employeeId: newEmp.id,
      employeeName: newEmp.fullName,
      department: newEmp.department,
      jobTitle: newEmp.jobTitle,
      basicSalary: newEmp.basicSalary,
      housingAllowance: newEmp.housingAllowance,
      transportAllowance: newEmp.transportAllowance,
      overtimePay: 0,
      bonus: 0,
      socialInsuranceEmployee: Math.round(newEmp.basicSalary * 0.11),
      socialInsuranceEmployer: Math.round(newEmp.basicSalary * 0.1875),
      gosiDeduction: Math.round(newEmp.basicSalary * 0.11),
      incomeTaxDeduction: 1100,
      martyrsFundDeduction: 15,
      absenceDeduction: 0,
      otherDeductions: 0,
      netSalary: Math.round(
        newEmp.basicSalary +
        newEmp.housingAllowance +
        newEmp.transportAllowance -
        newEmp.basicSalary * 0.11 -
        1100 -
        15
      ),
      status: 'paid',
      paymentMethod: 'تحويل بنكي مباشر (CIB/NBE)',
      createdAt: new Date().toISOString().slice(0, 10),
      paidAt: '2026-09-27',
    };

    setState((prev) => ({
      ...prev,
      employees: [newEmp, ...prev.employees],
      payrolls: [initialPayroll, ...prev.payrolls],
      accessRequests: (prev.accessRequests || INITIAL_ACCESS_REQUESTS).map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              reviewedAt: new Date().toISOString().slice(0, 10),
              reviewedBy: currentUser?.email || 'مسؤول الموارد البشرية (HR)',
            }
          : r
      ),
    }));

    logAudit('اعتماد موظف جديد', currentUser?.displayName || 'مسؤول الموارد البشرية', `تم اعتماد وتفعيل حساب الموظف ${newEmp.fullName} (${newEmp.email})`);
    addNotification({
      title: 'تم اعتماد حساب الموظف بنجاح',
      message: `تم اعتماد وتفعيل حساب ${newEmp.fullName} وإضافته لسجلات الشركة بنجاح وأصبح بإمكانه الدخول لبوابة الموظف فورياً.`,
      type: 'success',
      read: false,
    });
  };

  const rejectAccessRequest = (requestId: string, reason?: string) => {
    setState((prev) => ({
      ...prev,
      accessRequests: (prev.accessRequests || INITIAL_ACCESS_REQUESTS).map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              rejectionReason: reason || 'البيانات غير مطابقة لسجلات الشركة أو بطاقة الرقم القومي',
              reviewedAt: new Date().toISOString().slice(0, 10),
              reviewedBy: currentUser?.email || 'المدير العام',
            }
          : r
      ),
    }));

    logAudit('رفض طلب انضمام', currentUser?.displayName || 'المدير العام', `تم رفض طلب الانضمام رقم ${requestId}`);
    addNotification({
      title: 'تم رفض طلب الانضمام',
      message: 'تم رفض طلب الانضمام.',
      type: 'warning',
      read: false,
    });
  };

  // Company Branding Management (Strictly restricted to mz0970mmz@gmail.com)
  const companyBranding: CompanyBranding = state.branding || DEFAULT_BRANDING;
  const canEditBranding = userEmail === 'mz0970mmz@gmail.com';

  const updateCompanyBranding = (brandingUpdates: Partial<CompanyBranding>) => {
    if (!canEditBranding) {
      addNotification({
        title: 'غير مصرح بتعديل الهوية',
        message: 'صلاحية تغيير شعار المنشأة واسم المنصة محصورة حصرياً بحساب المدير العام (mz0970mmz@gmail.com).',
        type: 'warning',
        read: false,
      });
      return {
        success: false,
        error: 'صلاحية تغيير الشعار واسم المنشأة محصورة بحساب المدير العام (mz0970mmz@gmail.com)',
      };
    }

    const updated: CompanyBranding = {
      ...companyBranding,
      ...brandingUpdates,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.email || 'mz0970mmz@gmail.com',
    };

    setState((prev) => ({
      ...prev,
      branding: updated,
    }));

    logAudit('تحديث الهوية والشعار', currentUser?.displayName || 'المدير العام', `تم تحديث اسم المنشأة أو الشعار: ${updated.companyName}`);
    addNotification({
      title: 'تم تحديث الشعار والهوية الرسمية',
      message: 'تم حفظ وتطبيق شعار واسم المنشأة الجديد على كافة الأوراق المطبوعة والشهادات والنظام.',
      type: 'success',
      read: false,
    });

    return { success: true };
  };

  // Corporate WhatsApp-style Chat
  const chatGroups: ChatGroup[] = state.chatGroups || INITIAL_CHAT_GROUPS;
  const chatMessages: ChatMessage[] = state.chatMessages || INITIAL_CHAT_MESSAGES;
  const [activeGroupId, setActiveGroupId] = useState<string>('grp-all');

  const sendChatMessage = (groupId: string, content: string) => {
    if (!content.trim()) return;
    const curEmp = state.employees.find(
      (e) => e.email.toLowerCase().trim() === userEmail
    );

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      groupId,
      senderId: curEmp?.id || currentUser?.uid || 'user-emp',
      senderName: curEmp?.fullName || currentUser?.displayName || 'موظف بالشركة',
      senderEmail: currentUser?.email || curEmp?.email || '',
      senderAvatar: currentUser?.photoURL || curEmp?.avatar,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setState((prev) => ({
      ...prev,
      chatMessages: [...(prev.chatMessages || INITIAL_CHAT_MESSAGES), newMsg],
    }));
  };

  const createChatGroup = (groupData: Omit<ChatGroup, 'id' | 'createdAt'>) => {
    const newGroup: ChatGroup = {
      id: `grp-${Date.now()}`,
      ...groupData,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      chatGroups: [...(prev.chatGroups || INITIAL_CHAT_GROUPS), newGroup],
    }));

    setActiveGroupId(newGroup.id);
    addNotification({
      title: 'تم إنشاء مجموعة محادثة جديدة',
      message: `تم إنشاء مجموعة «${newGroup.name}» لقسم ${newGroup.department}.`,
      type: 'success',
      read: false,
    });
  };

  // Save to localStorage on state change
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Init Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleToken(token);
        logAudit('تسجيل الدخول', user.displayName || user.email || 'مستخدم جوجل', 'تمت المصادقة بنجاح.');
      },
      () => {
        setCurrentUser(null);
        setGoogleToken(null);
      }
    );

    testFirestoreConnection().then((connected) => {
      setIsOnline(connected);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const logAudit = (action: string, performedBy: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      action,
      performedBy,
      details,
      createdAt: new Date().toLocaleString('ar-SA'),
    };
    setState((prev) => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs.slice(0, 49)],
    }));
  };

  const handleSignInWithGoogle = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        setCurrentUser(res.user);
        setGoogleToken(res.accessToken);
        if (res.user.email?.toLowerCase().trim() === 'mz0970mmz@gmail.com') {
          setUserRole('admin');
        } else {
          setUserRole('employee');
          setActiveTab('employee-portal');
        }
        addNotification({
          title: 'تم تسجيل الدخول بحساب Google بنجاح',
          message: 'تم التحقق من بياناتك عبر Google بنجاح.',
          type: 'success',
          read: false,
        });
      }
    } catch (err: any) {
      if (isAuthCancellation(err)) {
        // Safe user cancellation or closed popup - no warning or alert needed
        return;
      }
      console.warn('[HR Context] Google sign-in note:', err?.message || err);
      addNotification({
        title: 'تنبيه تسجيل الدخول',
        message: 'تعذر استكمال تسجيل الدخول عبر Google. يمكنك استخدام الدخول المباشر بالبريد أدناه.',
        type: 'warning',
        read: false,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInAsRegisteredUser = (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const emp = state.employees.find(e => e.email.toLowerCase().trim() === cleanEmail);
    if (emp) {
      const mockUser: any = {
        uid: `user-${emp.id}`,
        email: emp.email,
        displayName: emp.fullName,
        photoURL: emp.avatar || null,
        emailVerified: true,
      };
      setCurrentUser(mockUser);
      logAudit('تسجيل الدخول (معتمد)', emp.fullName, `تم تسجيل الدخول بالبريد المعتمد: ${emp.email}`);
      addNotification({
        title: `مرحباً بك، ${emp.fullName}`,
        message: `تم تسجيل الدخول بنجاح بحساب ${emp.email}.`,
        type: 'success',
        read: false,
      });
    } else {
      // Unregistered user entered email directly: sign them in so they can fill out Onboarding view
      const mockUser: any = {
        uid: `user-guest-${Date.now()}`,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        photoURL: null,
        emailVerified: false,
      };
      setCurrentUser(mockUser);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setGoogleToken(null);
    addNotification({
      title: 'تسجيل الخروج',
      message: 'تم تسجيل الخروج بنجاح من النظام.',
      type: 'info',
      read: false,
    });
  };

  // Employee management
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = {
      id,
      ...empData,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      employees: [newEmp, ...prev.employees],
    }));
    logAudit('إضافة موظف جديد', currentUser?.displayName || 'المدير', `تمت إضافة الموظف ${newEmp.fullName} (${newEmp.employeeCode}).`);
    addNotification({
      title: 'إضافة موظف جديد',
      message: `تم تسجيل الموظف ${newEmp.fullName} بقسم ${newEmp.department}.`,
      type: 'info',
      read: false,
    });
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === id ? { ...e, ...empData, updatedAt: new Date().toISOString() } : e)),
    }));
    logAudit('تحديث بيانات موظف', currentUser?.displayName || 'المدير', `تم تعديل بيانات الموظف معرف: ${id}.`);
  };

  const deleteEmployee = (id: string) => {
    const emp = state.employees.find((e) => e.id === id);
    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
    }));
    logAudit('حذف موظف', currentUser?.displayName || 'المدير', `تم حذف الموظف ${emp?.fullName || id}.`);
  };

  // Attendance
  const checkIn = (employeeId: string, location: string = 'المقر الرئيسي - التجمع الخامس، القاهرة') => {
    const emp = state.employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);

    const existingIndex = state.attendance.findIndex(
      (a) => a.employeeId === employeeId && a.date === todayStr
    );

    if (existingIndex >= 0) {
      addNotification({
        title: 'تنبيه تسجيل الحضور',
        message: 'الموظف قام بتسجيل الحضور لهذا اليوم بالفعل.',
        type: 'warning',
        read: false,
      });
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      date: todayStr,
      checkInTime: timeStr,
      workHours: 0,
      overtimeHours: 0,
      status: isLate ? 'late' : 'present',
      location,
      notes: isLate ? 'تسجيل حضور بعد الموعد المحدد' : 'حضور في الموعد',
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      attendance: [newRecord, ...prev.attendance],
    }));

    logAudit('تسجيل حضور', emp.fullName, `تم تسجيل الحضور في الساعة ${timeStr} (${isLate ? 'متأخر' : 'في الموعد'}).`);
    addNotification({
      title: 'تسجيل حضور موظف',
      message: `سجل ${emp.fullName} حضوره الساعة ${timeStr}.`,
      type: isLate ? 'warning' : 'success',
      read: false,
    });
  };

  const checkOut = (employeeId: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toTimeString().slice(0, 8);

    setState((prev) => ({
      ...prev,
      attendance: prev.attendance.map((att) => {
        if (att.employeeId === employeeId && att.date === todayStr) {
          // Calculate work hours
          let hours = 8.0;
          let overtime = 0;
          if (att.checkInTime) {
            const [inH, inM] = att.checkInTime.split(':').map(Number);
            const now = new Date();
            const elapsed = now.getHours() + now.getMinutes() / 60 - (inH + inM / 60);
            hours = Math.max(0.1, Number(elapsed.toFixed(1)));
            if (hours > 8) overtime = Number((hours - 8).toFixed(1));
          }
          return {
            ...att,
            checkOutTime: timeStr,
            workHours: hours,
            overtimeHours: overtime,
          };
        }
        return att;
      }),
    }));

    const emp = state.employees.find((e) => e.id === employeeId);
    logAudit('تسجيل انصراف', emp?.fullName || employeeId, `تم تسجيل الإنصراف في الساعة ${timeStr}.`);
  };

  // Leaves
  const submitLeaveRequest = (reqData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const id = `leave-${Date.now()}`;
    const newReq: LeaveRequest = {
      id,
      ...reqData,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      leaves: [newReq, ...prev.leaves],
    }));
    logAudit('طلب إجازة جديد', reqData.employeeName, `طلب إجازة ${reqData.leaveType} لمدة ${reqData.days} أيام.`);
    addNotification({
      title: 'طلب إجازة جديد بانتظار الاعتماد',
      message: `طلب ${reqData.employeeName} إجازة لمدة ${reqData.days} أيام.`,
      type: 'leave',
      read: false,
    });
  };

  const approveLeaveRequest = (id: string, note?: string) => {
    const leave = state.leaves.find((l) => l.id === id);
    if (!leave) return;

    setState((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'approved',
              actionNotes: note || 'تمت الموافقة من إدارة الموارد البشرية',
              reviewedBy: currentUser?.displayName || 'مدير الموارد البشرية',
              updatedAt: new Date().toISOString(),
            }
          : l
      ),
      employees: prev.employees.map((e) =>
        e.id === leave.employeeId
          ? {
              ...e,
              remainingLeaveDays: Math.max(0, (e.remainingLeaveDays || 21) - leave.days),
            }
          : e
      ),
    }));

    logAudit('اعتماد إجازة', currentUser?.displayName || 'المدير', `تم اعتماد إجازة ${leave.employeeName}.`);
    addNotification({
      title: 'تم اعتماد الإجازة',
      message: `تم اعتماد إجازة ${leave.employeeName} للفترة من ${leave.startDate} إلى ${leave.endDate}.`,
      type: 'success',
      read: false,
    });
  };

  const rejectLeaveRequest = (id: string, note?: string) => {
    const leave = state.leaves.find((l) => l.id === id);
    setState((prev) => ({
      ...prev,
      leaves: prev.leaves.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'rejected',
              actionNotes: note || 'تم الرفض وفقاً لمتطلبات العمل',
              reviewedBy: currentUser?.displayName || 'مدير الموارد البشرية',
              updatedAt: new Date().toISOString(),
            }
          : l
      ),
    }));
    logAudit('رفض إجازة', currentUser?.displayName || 'المدير', `تم رفض إجازة ${leave?.employeeName}.`);
  };

  // Payroll
  const generateMonthlyPayroll = (month: string) => {
    const newPayrolls: Payroll[] = state.employees.map((emp) => {
      // Calculate Egyptian Social Insurance (Law 148 of 2019): 11% employee share, 18.75% employer share
      const insurableWage = Math.min(emp.basicSalary + emp.housingAllowance, 14500);
      const socialInsEmp = Number((insurableWage * 0.11).toFixed(2));
      const socialInsCompany = Number((insurableWage * 0.1875).toFixed(2));
      
      // Estimated monthly income tax (Egypt progressive brackets after 20,000 EGP annual exemption)
      const annualGross = (emp.basicSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances) * 12;
      const taxableAnnual = Math.max(0, annualGross - (socialInsEmp * 12) - 20000);
      let annualTax = 0;
      if (taxableAnnual > 40000) {
        annualTax = (taxableAnnual - 40000) * 0.15;
      }
      const incomeTax = Number((annualTax / 12).toFixed(2));

      const overtimePay = 0;
      const bonus = 0;
      const absenceDeduction = 0;
      const otherDeductions = 0;
      const gross = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances + overtimePay + bonus;
      const net = gross - socialInsEmp - incomeTax - absenceDeduction - otherDeductions;

      return {
        id: `pay-${emp.id}-${month}`,
        month,
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department,
        jobTitle: emp.jobTitle,
        basicSalary: emp.basicSalary,
        housingAllowance: emp.housingAllowance,
        transportAllowance: emp.transportAllowance,
        overtimePay,
        bonus,
        socialInsuranceEmployee: socialInsEmp,
        socialInsuranceEmployer: socialInsCompany,
        gosiDeduction: socialInsEmp,
        incomeTaxDeduction: incomeTax,
        absenceDeduction,
        otherDeductions,
        netSalary: Number(net.toFixed(2)),
        status: 'approved',
        paymentMethod: 'تحويل بنكي فوري (CIB / البنك الأهلي المصري / إنستاباي)',
        notes: `مسير رواتب شهر ${month} بالجنيه المصري`,
        createdAt: new Date().toISOString().slice(0, 10),
      };
    });

    setState((prev) => {
      // Replace existing payrolls for that month or append
      const filtered = prev.payrolls.filter((p) => p.month !== month);
      return {
        ...prev,
        payrolls: [...newPayrolls, ...filtered],
      };
    });

    logAudit('توليد مسير الرواتب', currentUser?.displayName || 'المدير', `تم احتساب وتوليد مسير رواتب شهر ${month} لعدد ${newPayrolls.length} موظف.`);
    addNotification({
      title: `تم إصدار مسير شهر ${month}`,
      message: `تم توليد مسير الرواتب لعدد ${newPayrolls.length} موظف بإجمالي رواتب جاهزة للاعتماد والصرف.`,
      type: 'payroll',
      read: false,
    });
  };

  const markPayrollPaid = (payrollId: string) => {
    setState((prev) => ({
      ...prev,
      payrolls: prev.payrolls.map((p) =>
        p.id === payrollId ? { ...p, status: 'paid', paidAt: new Date().toISOString() } : p
      ),
    }));
    const item = state.payrolls.find((p) => p.id === payrollId);
    logAudit('صرف راتب', currentUser?.displayName || 'المدير', `تم تأكيد صرف راتب ${item?.employeeName} لشهر ${item?.month}.`);
  };

  // Performance Evaluation
  const addEvaluation = (evalData: Omit<Evaluation, 'id' | 'createdAt'>) => {
    const id = `eval-${Date.now()}`;
    const newEval: Evaluation = {
      id,
      ...evalData,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      evaluations: [newEval, ...prev.evaluations],
    }));
    logAudit('تسجيل تقييم أداء', currentUser?.displayName || 'المدير', `تم إدراج تقييم أداء للموظف ${evalData.employeeName} بدرجة ${evalData.overallScore}%.`);
    addNotification({
      title: 'تقييم أداء جديد معتمد',
      message: `تم تسجيل تقييم ${evalData.employeeName} بنسبة ${evalData.overallScore}% مع التوصيات الذكية.`,
      type: 'success',
      read: false,
    });
  };

  // Tasks & Google Tasks Sync
  const addTask = async (taskData: Omit<HRTask, 'id' | 'createdAt'>, syncToGoogle: boolean = false) => {
    let googleTaskId: string | undefined;

    if (syncToGoogle && googleToken) {
      try {
        const created = await createGoogleTask(googleToken, {
          title: taskData.title,
          notes: taskData.description,
          due: taskData.dueDate,
        });
        googleTaskId = created.id;
      } catch (err) {
        console.warn('Google Tasks sync failed:', err);
      }
    }

    const newTask: HRTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      googleTaskId,
      syncedWithGoogle: !!googleTaskId,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));

    logAudit('إضافة مهمة HR', currentUser?.displayName || 'المدير', `تمت إضافة المهمة: "${taskData.title}".`);
    addNotification({
      title: 'مهمة إدارية جديدة',
      message: `تم تكليف ${taskData.assignedTo} بمهمة: ${taskData.title}.`,
      type: 'info',
      read: false,
    });
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';

    if (task.googleTaskId && googleToken) {
      try {
        await updateGoogleTaskStatus(googleToken, task.googleTaskId, nextStatus === 'completed');
      } catch (err) {
        console.warn('Failed to update Google Task status:', err);
      }
    }

    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus } : t
      ),
    }));

    logAudit('تحديث حالة مهمة', currentUser?.displayName || 'المستخدم', `تغيير حالة المهمة "${task.title}" إلى ${nextStatus === 'completed' ? 'مكتملة' : 'قيد التنفيذ'}.`);
  };

  const syncAllTasksWithGoogle = async () => {
    if (!googleToken) {
      throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لمزامنة المهام.');
    }

    try {
      const gTasks = await fetchGoogleTasks(googleToken);
      let addedCount = 0;

      const newTasks: HRTask[] = [];
      for (const gt of gTasks) {
        if (!gt.title) continue;
        const exists = state.tasks.some((t) => t.googleTaskId === gt.id || t.title === gt.title);
        if (!exists) {
          addedCount++;
          newTasks.push({
            id: `task-g-${gt.id || Date.now()}`,
            title: gt.title,
            description: gt.notes || 'تمت المزامنة من Google Tasks',
            assignedTo: currentUser?.displayName || 'الإدارة',
            dueDate: gt.due ? gt.due.slice(0, 10) : new Date().toISOString().slice(0, 10),
            priority: 'medium',
            status: gt.status === 'completed' ? 'completed' : 'pending',
            googleTaskId: gt.id,
            syncedWithGoogle: true,
            createdAt: new Date().toISOString().slice(0, 10),
          });
        }
      }

      if (newTasks.length > 0) {
        setState((prev) => ({
          ...prev,
          tasks: [...newTasks, ...prev.tasks],
        }));
      }

      logAudit('مزامنة Google Tasks', currentUser?.displayName || 'المدير', `تم استيراد ومزامنة ${addedCount} مهام من Google Tasks.`);
      addNotification({
        title: 'اكتملت مزامنة Google Tasks',
        message: `تم جلب وتحديث ${addedCount} مهام من حساب جوجل بنجاح.`,
        type: 'success',
        read: false,
      });
    } catch (err: any) {
      console.warn('Google Tasks Sync notice:', err?.message || err);
      throw err;
    }
  };

  // Notifications
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      ...notif,
      createdAt: 'الآن',
    };
    setState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const clearAllNotifications = () => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
  };

  // Accounting
  const syncJournalEntryToCloud = async (id: string) => {
    setState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.map((je) =>
        je.id === id ? { ...je, status: 'synced', syncedAt: new Date().toLocaleString('ar-SA') } : je
      ),
    }));
    const entry = state.journalEntries.find((j) => j.id === id);
    logAudit('مزامنة قيود محاسبية', currentUser?.displayName || 'رئيس الحسابات', `تم تصدير القيد ${entry?.referenceNo} إلى النظام المحاسبي السحابي.`);
    addNotification({
      title: 'تمت المزامنة المحاسبية بنجاح',
      message: `تم ترحيل قيد استحقاق الرواتب ${entry?.referenceNo} إلى النظام المحاسبي.`,
      type: 'success',
      read: false,
    });
  };

  // Backup & Restore
  const backupSystemData = () => {
    const json = exportBackup(state);
    const filename = `Mawared_HRMS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(json, filename, 'application/json;charset=utf-8;');
    logAudit('تصدير نسخة احتياطية', currentUser?.displayName || 'المدير', 'تم تصدير ملف النسخة الاحتياطية المشفرة للنظام.');
    addNotification({
      title: 'تم تنزيل النسخة الاحتياطية',
      message: 'تم حفظ وتنزيل كامل بيانات الموارد البشرية والرواتب بأمان.',
      type: 'success',
      read: false,
    });
  };

  const restoreSystemData = (fileContent: string) => {
    try {
      const restored = importBackup(fileContent);
      setState(restored);
      logAudit('استعادة نسخة احتياطية', currentUser?.displayName || 'المدير', 'تمت استعادة بيانات النظام من نسخة سابقة بنجاح.');
      addNotification({
        title: 'اكتملت استعادة البيانات بنجاح',
        message: 'تم تحديث جميع السجلات والملفات من النسخة الاحتياطية المستوردة.',
        type: 'success',
        read: false,
      });
    } catch (err: any) {
      addNotification({
        title: 'خطأ في استعادة النسخة الاحتياطية',
        message: 'تعذر استعادة البيانات: ' + (err.message || 'الملف غير صالح'),
        type: 'warning',
        read: false,
      });
    }
  };

  return (
    <HRContext.Provider
      value={{
        employees: state.employees,
        attendance: state.attendance,
        leaves: state.leaves,
        payrolls: state.payrolls,
        evaluations: state.evaluations,
        tasks: state.tasks,
        notifications: state.notifications,
        auditLogs: state.auditLogs,
        journalEntries: state.journalEntries,

        currentUser,
        googleToken,
        isGoogleConnected: !!googleToken,
        isSigningIn,
        signInWithGoogle: handleSignInWithGoogle,
        signInAsRegisteredUser,
        signOut: handleSignOut,

        addEmployee,
        updateEmployee,
        deleteEmployee,

        checkIn,
        checkOut,

        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,

        generateMonthlyPayroll,
        markPayrollPaid,

        addEvaluation,

        addTask,
        toggleTaskStatus,
        syncAllTasksWithGoogle,

        addNotification,
        markNotificationRead,
        clearAllNotifications,

        syncJournalEntryToCloud,

        activeTab,
        setActiveTab,
        showMobileSimulator,
        setShowMobileSimulator,
        showAdvisorModal,
        setShowAdvisorModal,
        showUserGuide,
        setShowUserGuide,

        darkMode,
        toggleDarkMode,
        companyBranding,
        updateCompanyBranding,
        canEditBranding,
        currentEmployee,
        isCurrentUserAdmin,
        isHRStaff,
        userRole,
        setUserRole,
        chatGroups,
        chatMessages,
        activeGroupId,
        setActiveGroupId,
        sendChatMessage,
        createChatGroup,
        mobileMenuOpen,
        setMobileMenuOpen,

        accessRequests,
        isEmployeeRegistered,
        submitAccessRequest,
        approveAccessRequest,
        rejectAccessRequest,
        employeeFullScreenView,
        setEmployeeFullScreenView,
        selectedPayslipForView,
        setSelectedPayslipForView,

        backupSystemData,
        restoreSystemData,
        isOnline,
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
