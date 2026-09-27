/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HRProvider, useHR } from './context/HRContext';
import { GoogleLoginGate } from './components/GoogleLoginGate';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { AttendanceView } from './views/AttendanceView';
import { LeavesView } from './views/LeavesView';
import { PayrollView } from './views/PayrollView';
import { PerformanceView } from './views/PerformanceView';
import { AccountingView } from './views/AccountingView';
import { GoogleTasksView } from './views/GoogleTasksView';
import { GoogleChatView } from './views/GoogleChatView';
import { EgyptianLaborLawView } from './views/EgyptianLaborLawView';
import { EmployeePortalView } from './views/EmployeePortalView';
import { EmployeePayslipsView } from './views/EmployeePayslipsView';
import { EmployeeCertificateView } from './views/EmployeeCertificateView';
import { EmployeeAttendanceView } from './views/EmployeeAttendanceView';
import { EmployeeProfileView } from './views/EmployeeProfileView';
import { SecurityView } from './views/SecurityView';
import { UserGuideView } from './views/UserGuideView';
import { OnboardingRequestView } from './views/OnboardingRequestView';
import { AdvisorChatModal } from './components/AdvisorChatModal';
import { MobileSimulatorModal } from './components/MobileSimulatorModal';
import {
  LayoutDashboard,
  UserCircle2,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Award,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Scale,
  ArrowRight
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isCurrentUserAdmin,
    isHRStaff,
    isEmployeeRegistered,
    employeeFullScreenView,
    setEmployeeFullScreenView,
    companyBranding,
    userRole,
    setUserRole
  } = useHR();

  // 1. Unregistered employee: redirect to fill out company info & request access
  if (!isEmployeeRegistered) {
    return <OnboardingRequestView />;
  }

  // 2. Regular Employee OR Admin switched to employee mode: Pure Full Screen Employee Portal (No admin sidebar)
  if (!isHRStaff || userRole === 'employee') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Cairo',sans-serif] transition-colors">
        {/* Top Header */}
        <Header />

        {/* Top Subview Return Bar if viewing a sub-feature full screen */}
        {employeeFullScreenView !== 'portal' && (
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs font-bold shadow-md sticky top-16 z-20">
            <button
              onClick={() => setEmployeeFullScreenView('portal')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى بوابة الموظف الرئيسية</span>
            </button>
            <span className="opacity-90 font-medium">
              بوابة الخدمة الذاتية للموظف • {companyBranding.companyName}
            </span>
          </div>
        )}

        {/* Full Screen View Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-12">
          {employeeFullScreenView === 'portal' && <EmployeePortalView />}
          {employeeFullScreenView === 'chat' && <GoogleChatView />}
          {employeeFullScreenView === 'payslips' && <EmployeePayslipsView />}
          {employeeFullScreenView === 'leaves' && <LeavesView />}
          {employeeFullScreenView === 'attendance' && <EmployeeAttendanceView />}
          {employeeFullScreenView === 'certificate' && <EmployeeCertificateView />}
          {employeeFullScreenView === 'profile' && <EmployeeProfileView />}
        </main>
      </div>
    );
  }

  // 3. Admin / HR Director (mz0970mmz@gmail.com): Full Management HRMS
  const renderActiveView = () => {
    switch (activeTab) {
      case 'employee-portal':
        return <EmployeePortalView />;
      case 'dashboard':
        return <DashboardView />;
      case 'employees':
        return <EmployeesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'leaves':
        return <LeavesView />;
      case 'payroll':
        return <PayrollView />;
      case 'performance':
        return <PerformanceView />;
      case 'accounting':
        return <AccountingView />;
      case 'tasks':
        return <GoogleTasksView />;
      case 'chat':
        return <GoogleChatView />;
      case 'egyptian-law':
        return <EgyptianLaborLawView />;
      case 'advisor':
        return <DashboardView />;
      case 'security':
        return <SecurityView />;
      case 'guide':
        return <UserGuideView />;
      default:
        return <DashboardView />;
    }
  };

  const mobileNavItems = [
    { id: 'employee-portal', label: 'بوابة الموظف', icon: UserCircle2 },
    { id: 'chat', label: 'شات الشركة', icon: MessageSquare },
    { id: 'attendance', label: 'الحضور', icon: Clock },
    { id: 'leaves', label: 'الإجازات', icon: CalendarCheck },
    { id: 'payroll', label: 'الرواتب', icon: CreditCard },
    { id: 'dashboard', label: 'الإدارة', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Cairo',sans-serif] transition-colors">
      {/* Top Main Navigation Header */}
      <Header />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar for Admins */}
        <Sidebar />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-full pb-20 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Responsive Mobile Bottom Navigation Bar (Visible for Admins on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 z-30 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 p-1 transition-colors cursor-pointer ${
                isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Interactive Modals */}
      <AdvisorChatModal />
      <MobileSimulatorModal />
    </div>
  );
};

export default function App() {
  return (
    <HRProvider>
      <GoogleLoginGate>
        <MainContent />
      </GoogleLoginGate>
    </HRProvider>
  );
}
