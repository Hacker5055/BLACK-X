import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  CreditCard,
  Calendar,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  FileSpreadsheet,
  Camera,
  FileCheck,
  Scale,
  HeartHandshake,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Employee } from '../types';
import { downloadFile } from '../services/storage';
import { PhotoUploadModal } from '../components/PhotoUploadModal';
import { OnboardingAuditModal } from '../components/OnboardingAuditModal';
import { EOSCalculatorModal } from '../components/EOSCalculatorModal';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    accessRequests,
    approveAccessRequest,
    rejectAccessRequest
  } = useHR();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Modals state
  const [photoModalEmp, setPhotoModalEmp] = useState<Employee | null>(null);
  const [auditModalEmp, setAuditModalEmp] = useState<Employee | null>(null);
  const [eosModalEmp, setEosModalEmp] = useState<Employee | null>(null);

  const pendingRequests = (accessRequests || []).filter((r) => r.status === 'pending');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    employeeCode: '',
    email: '',
    phone: '',
    department: 'الهندسة والتقنية',
    jobTitle: '',
    basicSalary: 12000,
    housingAllowance: 3000,
    transportAllowance: 1000,
    otherAllowances: 500,
    hireDate: new Date().toISOString().slice(0, 10),
    nationalId: '',
    socialInsuranceNumber: '',
    iban: '',
    contractType: 'fixed' as 'fixed' | 'unlimited' | 'temporary',
    contractStartDate: new Date().toISOString().slice(0, 10),
    contractEndDate: '',
    insuranceRenewalDate: '',
    insuranceSalary: 14500,
    avatar: '',
    isSpecialNeeds: false,
    status: 'active' as 'active' | 'on_leave' | 'terminated',
  });

  const departments = ['all', 'الهندسة والتقنية', 'الموارد البشرية', 'المالية والمحاسبة', 'التسويق والمبيعات', 'العمليات التشغيلية'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.jobTitle) {
      alert('يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
      setEditingEmployee(null);
    } else {
      addEmployee({
        ...formData,
        employeeCode: formData.employeeCode || `EMP-${1000 + employees.length + 1}`,
      });
    }

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      employeeCode: '',
      email: '',
      phone: '',
      department: 'الهندسة والتقنية',
      jobTitle: '',
      basicSalary: 12000,
      housingAllowance: 3000,
      transportAllowance: 1000,
      otherAllowances: 500,
      hireDate: new Date().toISOString().slice(0, 10),
      nationalId: '',
      socialInsuranceNumber: '',
      iban: '',
      contractType: 'fixed',
      contractStartDate: new Date().toISOString().slice(0, 10),
      contractEndDate: '',
      insuranceRenewalDate: '',
      insuranceSalary: 14500,
      avatar: '',
      isSpecialNeeds: false,
      status: 'active',
    });
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      employeeCode: emp.employeeCode,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      jobTitle: emp.jobTitle,
      basicSalary: emp.basicSalary,
      housingAllowance: emp.housingAllowance,
      transportAllowance: emp.transportAllowance,
      otherAllowances: emp.otherAllowances,
      hireDate: emp.hireDate,
      nationalId: emp.nationalId || '',
      socialInsuranceNumber: emp.socialInsuranceNumber || '',
      iban: emp.iban || '',
      contractType: emp.contractType || 'fixed',
      contractStartDate: emp.contractStartDate || emp.hireDate,
      contractEndDate: emp.contractEndDate || '',
      insuranceRenewalDate: emp.insuranceRenewalDate || '',
      insuranceSalary: emp.insuranceSalary || 14500,
      avatar: emp.avatar || '',
      isSpecialNeeds: !!emp.isSpecialNeeds,
      status: emp.status,
    });
    setShowAddModal(true);
  };

  const exportEmployeesCSV = () => {
    const headers = ['كود الموظف', 'الاسم الكامل', 'البريد الإلكتروني', 'الجوال', 'القسم', 'المسمى الوظيفي', 'الراتب الأساسي', 'بدل السكن', 'بدل النقل', 'تاريخ التعيين', 'نوع العقد', 'الرقم التأميني', 'الحالة'];
    const rows = filteredEmployees.map((e) => [
      e.employeeCode,
      `"${e.fullName}"`,
      e.email,
      e.phone,
      `"${e.department}"`,
      `"${e.jobTitle}"`,
      e.basicSalary,
      e.housingAllowance,
      e.transportAllowance,
      e.hireDate,
      e.contractType === 'unlimited' ? 'دائم' : 'محدد المدة',
      e.socialInsuranceNumber || 'غير مسجل',
      e.status === 'active' ? 'على رأس العمل' : e.status === 'on_leave' ? 'إجازة' : 'منتهي',
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csvContent, `Employees_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">شؤون وسجلات الموظفين</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            إدارة الملفات الوظيفية، الصور الشخصية، مسوغات التعيين، والتسويات القانونية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportEmployeesCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingEmployee(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* Pending Access Requests Review Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-3xl border border-amber-200 dark:border-amber-800/60 p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                طلبات انضمام موظفين جدد بانتظار اعتماد الموارد البشرية ({pendingRequests.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
              تتطلب تدقيق الرقم القومي واعتماد العقد
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.fullName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {req.jobTitle} • {req.department}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full">
                      طلب جديد
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    <p>البريد: <span className="font-bold text-slate-900 dark:text-white">{req.email}</span></p>
                    <p>الرقم القومي: <span className="font-bold text-slate-900 dark:text-white">{req.nationalId}</span></p>
                    <p>رقم الجوال: <span className="text-slate-700 dark:text-slate-300">{req.phone}</span></p>
                    {req.notes && (
                      <p className="font-sans italic text-slate-500 text-[11px] pt-1">"{req.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      const reason = prompt('أدخل سبب رفض الطلب:');
                      rejectAccessRequest(req.id, reason || undefined);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 dark:bg-slate-700 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    رفض الطلب
                  </button>
                  <button
                    onClick={() => approveAccessRequest(req.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    اعتماد وتفعيل الحساب
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث بالاسم، الكود، أو المسمى..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedDepartment === dept
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {dept === 'all' ? 'جميع الأقسام' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const totalPackage = emp.basicSalary + emp.housingAllowance + emp.transportAllowance + emp.otherAllowances;
          
          // Onboarding docs completion count
          const docsCount = emp.onboardingDocuments?.length || 9;
          const submittedCount = emp.onboardingDocuments?.filter((d) => d.isSubmitted).length ?? 7;
          const docsPercent = Math.round((submittedCount / docsCount) * 100);

          return (
            <div
              key={emp.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative group/avatar">
                      <img
                        src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={emp.fullName}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoModalEmp(emp)}
                        className="absolute inset-0 bg-slate-900/60 text-white rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        title="تغيير أو رفع صورة الموظف"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {emp.fullName}
                        </h3>
                        {emp.isSpecialNeeds && (
                          <span className="px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 text-[9px] font-extrabold rounded-md flex items-center gap-0.5" title="نسبة الـ 5% ذوي الهمم">
                            <HeartHandshake className="w-2.5 h-2.5" />
                            <span>5%</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">{emp.jobTitle}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{emp.employeeCode}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      emp.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : emp.status === 'on_leave'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                    }`}
                  >
                    {emp.status === 'active' ? 'على رأس العمل' : emp.status === 'on_leave' ? 'في إجازة' : 'منتهي'}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      القسم:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      إجمالي الراتب الشهري:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {totalPackage.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      تاريخ المباشرة:
                    </span>
                    <span className="font-mono">{emp.hireDate}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      سريان العقد:
                    </span>
                    {emp.contractType === 'unlimited' ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">عقد دائم (غير محدد)</span>
                    ) : emp.contractEndDate ? (
                      <span className="font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200">
                        {emp.contractEndDate}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">محدد المدة</span>
                    )}
                  </div>

                  {emp.socialInsuranceNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        الرقم التأميني:
                      </span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-[11px]">
                        {emp.socialInsuranceNumber}
                      </span>
                    </div>
                  )}

                  {/* Onboarding Documents Completion indicator */}
                  <div
                    onClick={() => setAuditModalEmp(emp)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors"
                    title="انقر لفتح مدقق مسوغات التعيين والأوراق القانونية"
                  >
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      مسوغات التعيين:
                    </span>
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${docsPercent === 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}>
                      {submittedCount}/{docsCount} ({docsPercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAuditModalEmp(emp)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="فحص وتدقيق مسوغات التعيين"
                  >
                    <FileCheck className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setEosModalEmp(emp)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="حاسبة مكافأة نهاية الخدمة والتسوية (المادة 126)"
                  >
                    <Scale className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setPhotoModalEmp(emp)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="تغيير الصورة الشخصية"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="تعديل بيانات الموظف"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف الموظف ${emp.fullName}؟`)) {
                        deleteEmployee(emp.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="حذف الموظف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingEmployee ? 'تعديل بيانات الموظف والعقد والصورة' : 'تسجيل موظف جديد في النظام'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              
              {/* Photo Upload & Preview Row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-200 dark:bg-slate-700">
                    <img
                      src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">الصورة الشخصية للموظف</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">تظهر في بطاقة العمل، الشهادات وبوابة الموظف</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('أدخل رابط الصورة المباشر أو اضغط موافق:', formData.avatar);
                    if (url !== null) {
                      setFormData({ ...formData, avatar: url });
                    }
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تحديد الصورة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="مثال: خالد محمد السبيعي"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كود الموظف (الرقم الوظيفي)</label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="EMP-1006"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني المهني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="employee@company.eg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الجوال (مصر)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="+20 10 0000 0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">القسم / الإدارة *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="الهندسة والتقنية">الهندسة والتقنية</option>
                    <option value="الموارد البشرية">الموارد البشرية</option>
                    <option value="المالية والمحاسبة">المالية والمحاسبة</option>
                    <option value="التسويق والمبيعات">التسويق والمبيعات</option>
                    <option value="العمليات التشغيلية">العمليات التشغيلية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المسمى الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="مثال: مهندس برمجيات، محاسب عام، أخصائي تسويق"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع عقد العمل *</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  >
                    <option value="fixed">عقد محدد المدة (سنوي / متعدد السنوات)</option>
                    <option value="unlimited">عقد غير محدد المدة (دائم)</option>
                    <option value="temporary">عقد مؤقت / عمل عارض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ انتهاء العقد</label>
                  <input
                    type="date"
                    disabled={formData.contractType === 'unlimited'}
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم التأميني (الهيئة القومية للتأمين)</label>
                  <input
                    type="text"
                    value={formData.socialInsuranceNumber}
                    onChange={(e) => setFormData({ ...formData, socialInsuranceNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="مثال: 109847291"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">موعد التجديد والمطابقة التأمينية (استمارة 2)</label>
                  <input
                    type="date"
                    value={formData.insuranceRenewalDate}
                    onChange={(e) => setFormData({ ...formData, insuranceRenewalDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المرتب الأساسي (جنيه مصري ج.م) *</label>
                  <input
                    type="number"
                    min="6000"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">بدل السكن (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.housingAllowance}
                    onChange={(e) => setFormData({ ...formData, housingAllowance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">بدل الانتقال (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.transportAllowance}
                    onChange={(e) => setFormData({ ...formData, transportAllowance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">بدلات وحوافز أخرى (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.otherAllowances}
                    onChange={(e) => setFormData({ ...formData, otherAllowances: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرقم القومي (14 رقم)</label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="29XXXXXXXXXXXX"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الآيبان البنكي المصري (IBAN)</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    placeholder="EG0000000000000000000000"
                  />
                </div>

              </div>

              {/* Special Needs 5% Checkbox */}
              <div className="p-3 bg-violet-50/70 dark:bg-violet-950/30 rounded-xl border border-violet-200 dark:border-violet-900/60 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="specialNeedsCheck"
                  checked={formData.isSpecialNeeds}
                  onChange={(e) => setFormData({ ...formData, isSpecialNeeds: e.target.checked })}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                />
                <label htmlFor="specialNeedsCheck" className="text-xs font-bold text-violet-900 dark:text-violet-200 cursor-pointer">
                  الموظف مسجل ضمن كوتة الـ 5% ذوي الهمم (قانون رقم 10 لسنة 2018)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {editingEmployee ? 'حفظ التعديلات' : 'تسجيل الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Interactive Feature Modals */}
      {photoModalEmp && (
        <PhotoUploadModal
          currentAvatar={photoModalEmp.avatar}
          employeeName={photoModalEmp.fullName}
          onSaveAvatar={(avatarUrl) => {
            updateEmployee(photoModalEmp.id, { avatar: avatarUrl });
            setPhotoModalEmp(null);
          }}
          onClose={() => setPhotoModalEmp(null)}
        />
      )}

      {auditModalEmp && (
        <OnboardingAuditModal
          employee={auditModalEmp}
          onClose={() => setAuditModalEmp(null)}
        />
      )}

      {eosModalEmp && (
        <EOSCalculatorModal
          initialEmployee={eosModalEmp}
          onClose={() => setEosModalEmp(null)}
        />
      )}

    </div>
  );
};
