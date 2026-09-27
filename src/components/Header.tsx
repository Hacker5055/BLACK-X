import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  BookOpen,
  Download,
  Upload,
  LogOut,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Info,
  Sun,
  Moon,
  Building2,
  Menu,
  X,
  UserCheck,
  Smartphone,
  LayoutDashboard,
  UserCircle2,
  QrCode
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { BrandingModal } from './BrandingModal';
import { DocumentVerificationModal } from './DocumentVerificationModal';

export const Header: React.FC = () => {
  const {
    currentUser,
    signOut,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setShowMobileSimulator,
    setShowAdvisorModal,
    setShowUserGuide,
    backupSystemData,
    restoreSystemData,
    employees,
    attendance,
    checkIn,
    darkMode,
    toggleDarkMode,
    companyBranding,
    canEditBranding,
    activeTab,
    setActiveTab,
    isCurrentUserAdmin,
    isHRStaff,
    userRole,
    setUserRole,
    setEmployeeFullScreenView,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useHR();

  const userEmail = (currentUser?.email || '').toLowerCase().trim();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) restoreSystemData(content);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Right Side: Mobile Menu Button + Company Logo & Identity */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Menu Hamburger (Visible ONLY for HR staff since regular employees only have the portal) */}
              {isHRStaff && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  aria-label="القائمة الرئيسية"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {/* Logo */}
              <div
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0"
                onClick={() => {
                  if (isHRStaff && userRole === 'admin') {
                    setActiveTab('dashboard');
                  } else {
                    setEmployeeFullScreenView('portal');
                  }
                }}
              >
                {companyBranding.logoUrl ? (
                  <img
                    src={companyBranding.logoUrl}
                    alt={companyBranding.companyName}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-black text-lg">
                    {companyBranding.companyName ? companyBranding.companyName.trim()[0] : 'م'}
                  </div>
                )}
                
                <div className="hidden min-[480px]:block truncate max-w-[150px] sm:max-w-[220px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                      {companyBranding.companyName}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {companyBranding.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Center Role / View Mode Switcher (For HR Staff) or Clean Full Screen Badge (For Employees) */}
            {isHRStaff ? (
              <div className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => {
                    setUserRole('admin');
                    setActiveTab('dashboard');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    userRole === 'admin' && activeTab !== 'employee-portal'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>لوحة إدارة الـ HR</span>
                </button>
                <button
                  onClick={() => {
                    setUserRole('employee');
                    setEmployeeFullScreenView('portal');
                    setActiveTab('employee-portal');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    userRole === 'employee' || activeTab === 'employee-portal'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <UserCircle2 className="w-3.5 h-3.5" />
                  <span>بوابة الموظف الذاتية</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-2xs">
                <UserCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>بوابة الموظف الذاتية (Full Screen)</span>
              </div>
            )}

            {/* Left Side: Actions Tools & Toggles */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title={darkMode ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Branding Customization Settings Button (Special badge for mz0970mmz@gmail.com) */}
              <button
                onClick={() => setShowBrandingModal(true)}
                className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                  canEditBranding
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="تخصيص شعار وهوية المنشأة (مخصص للمدير mz0970mmz@gmail.com)"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px]">
                  {canEditBranding ? 'تغيير الشعار والهوية' : 'هوية المنشأة'}
                </span>
              </button>

              {/* QR Verification Modal Trigger Button */}
              <button
                onClick={() => setShowVerifyModal(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                title="التحقق الرقمي من صحة المستندات وشهادات الرواتب"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>التحقق من المستندات</span>
              </button>

              {/* AI Advisor Button */}
              <button
                onClick={() => setShowAdvisorModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                title="مستشار الموارد البشرية الذكي"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden md:inline">المستشار</span>
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer"
                  title="الإشعارات والتنبيهات"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu */}
                {showNotifications && (
                  <div className="absolute left-0 sm:right-auto mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 text-xs text-right">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <span className="font-bold text-slate-800 dark:text-white">الإشعارات والتنبيهات</span>
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        مسح الكل
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-slate-400 py-6">لا توجد إشعارات حالياً</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                              n.read
                                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                            }`}
                          >
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">{n.title}</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">{n.createdAt}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile / Logout */}
              {currentUser && (
                <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
                  <div className="flex items-center gap-2 p-1 pl-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || ''}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                      </div>
                    )}
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">
                        {currentUser.displayName || currentUser.email?.split('@')[0]}
                      </p>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {userEmail === 'mz0970mmz@gmail.com'
                          ? 'المدير العام'
                          : isHRStaff
                          ? 'مسؤول HR'
                          : 'موظف بالشركة'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={signOut}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* Branding Customization Modal */}
      <BrandingModal
        isOpen={showBrandingModal}
        onClose={() => setShowBrandingModal(false)}
      />

      {/* Global Document Verification Modal */}
      {showVerifyModal && (
        <DocumentVerificationModal
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </>
  );
};
