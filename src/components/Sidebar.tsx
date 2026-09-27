import React from 'react';
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
  X
} from 'lucide-react';
import { useHR } from '../context/HRContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    tasks,
    leaves,
    payrolls,
    mobileMenuOpen,
    setMobileMenuOpen,
    isCurrentUserAdmin
  } = useHR();

  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
  const draftPayrolls = payrolls.filter((p) => p.status === 'draft').length;

  const navItems = [
    {
      id: 'employee-portal',
      label: 'بوابة الموظف الذاتية (ESS)',
      icon: UserCircle2,
      badge: 'الخدمة الذاتية',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold',
    },
    {
      id: 'chat',
      label: 'شات الشركة والأقسام',
      icon: MessageSquare,
      badge: 'واتساب داخلي',
      badgeColor: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold',
    },
    {
      id: 'dashboard',
      label: 'لوحة إدارة الـ HR',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'egyptian-law',
      label: 'مرجع قانون العمل المصري',
      icon: Scale,
      badge: 'قانون 12 لسنة 2003',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold',
    },
    {
      id: 'employees',
      label: 'شؤون وسجلات الموظفين',
      icon: Users,
      badge: null,
    },
    {
      id: 'attendance',
      label: 'الحضور والانصراف بالبصمة',
      icon: Clock,
      badge: null,
    },
    {
      id: 'leaves',
      label: 'الإجازات السنوية والعارضة',
      icon: CalendarCheck,
      badge: pendingLeaves > 0 ? `${pendingLeaves} معلق` : null,
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300',
    },
    {
      id: 'payroll',
      label: 'مسيرات الرواتب (ج.م EGP)',
      icon: CreditCard,
      badge: draftPayrolls > 0 ? `${draftPayrolls} مسودة` : null,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
    },
    {
      id: 'performance',
      label: 'تقييم الأداء ومؤشرات KPI',
      icon: Award,
      badge: 'Gemini AI',
      badgeColor: 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-bold',
    },
    {
      id: 'accounting',
      label: 'الربط المحاسبي (دفترة/قيود)',
      icon: BookOpen,
      badge: 'سحابي',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300',
    },
    {
      id: 'tasks',
      label: 'مهام العمل (Google Tasks)',
      icon: CheckSquare,
      badge: null,
    },
    {
      id: 'security',
      label: 'الأمان وسجل التدقيق',
      icon: ShieldCheck,
      badge: null,
    },
    {
      id: 'guide',
      label: 'دليل استخدام النظام',
      icon: HelpCircle,
      badge: null,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-4 space-y-6 min-h-[calc(100vh-64px)] transition-colors">
        
        {/* Navigation Links */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-3 uppercase tracking-wider block mb-2">
            القائمة الرئيسية
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] shrink-0 ${
                      isActive ? 'bg-white/20 text-white font-bold' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legal Egyptian Badge */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>الامتثال القانوني</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            مطابق لقانون العمل رقم 12 لسنة 2003 والتأمينات والمعاشات 148 لسنة 2019 (جمهورية مصر العربية).
          </p>
        </div>

      </aside>

      {/* 2. Responsive Mobile Drawer (Opens on tap of hamburger) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-800 dark:text-white">قائمة الأقسام</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-200 dark:border-slate-800">
              Mawared HRMS Egypt Enterprise
            </p>

          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};
