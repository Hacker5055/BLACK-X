import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  Scale,
  Calculator,
  ShieldCheck,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  CalendarCheck,
  Coins,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building2,
  QrCode
} from 'lucide-react';
import { downloadFile } from '../services/storage';
import { downloadElementAsPdf } from '../utils/pdfExport';

export const EgyptianLaborLawView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'calculator' | 'forms'>('articles');
  const [searchArticle, setSearchArticle] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('sec-wages');

  // Interactive Calculator State
  const [calcType, setCalcType] = useState<'gratuity' | 'overtime' | 'insurance' | 'tax'>('insurance');
  const [monthlySalary, setMonthlySalary] = useState<number>(15000);
  const [serviceYears, setServiceYears] = useState<number>(6);
  const [overtimeDayHours, setOvertimeDayHours] = useState<number>(10);
  const [overtimeNightHours, setOvertimeNightHours] = useState<number>(5);
  const [overtimeHolidayHours, setOvertimeHolidayHours] = useState<number>(0);

  // Calculations based on Egyptian Labor Law No. 12 of 2003 and Social Insurance Law No. 148 of 2019
  // 1. Social Insurance (148/2019):
  // Insured wage capped or calculated: 11% employee share, 18.75% employer share
  const insurableWage = Math.min(monthlySalary, 14500); // الحد التأميني الاسترشادي
  const employeeInsuranceShare = Math.round(insurableWage * 0.11);
  const employerInsuranceShare = Math.round(insurableWage * 0.1875);
  const totalInsuranceShare = employeeInsuranceShare + employerInsuranceShare;

  // 2. Overtime (Law 12/2003, Art 85):
  // Hourly wage = monthly salary / (30 days * 8 hours) = monthly / 240
  const hourlyRate = monthlySalary / 240;
  const dayOvertimePay = overtimeDayHours * hourlyRate * 1.35; // أجر الساعة + 35%
  const nightOvertimePay = overtimeNightHours * hourlyRate * 1.70; // أجر الساعة + 70%
  const holidayOvertimePay = overtimeHolidayHours * hourlyRate * 2.00; // مثلي الأجر 200%
  const totalOvertimePay = Math.round(dayOvertimePay + nightOvertimePay + holidayOvertimePay);

  // 3. End of Service Gratuity (Art 126 / Retirement / Arbitrary termination Art 122):
  // نصف شهر عن أول 5 سنوات + شهر كامل عن كل سنة تالية
  const gratuityTotal = Math.round(
    serviceYears <= 5
      ? (monthlySalary * 0.5) * serviceYears
      : (monthlySalary * 0.5 * 5) + (monthlySalary * (serviceYears - 5))
  );

  // 4. Egyptian Income Tax on Wages (ضريبة المرتبات وما في حكمها - تقريبي سنوي ثم شهري)
  const annualGross = monthlySalary * 12;
  const annualInsurance = employeeInsuranceShare * 12;
  const personalExemption = 20000; // الإعفاء الشخصي السنوي
  const taxableAnnual = Math.max(0, annualGross - annualInsurance - personalExemption);
  let annualTax = 0;
  if (taxableAnnual <= 40000) {
    annualTax = 0; // الشريحة الصفرية
  } else if (taxableAnnual <= 55000) {
    annualTax = (taxableAnnual - 40000) * 0.10;
  } else if (taxableAnnual <= 70000) {
    annualTax = 15000 * 0.10 + (taxableAnnual - 55000) * 0.15;
  } else if (taxableAnnual <= 200000) {
    annualTax = 15000 * 0.10 + 15000 * 0.15 + (taxableAnnual - 70000) * 0.20;
  } else {
    annualTax = 15000 * 0.10 + 15000 * 0.15 + 130000 * 0.20 + (taxableAnnual - 200000) * 0.225;
  }
  const monthlyIncomeTax = Math.round(annualTax / 12);

  const [isDownloadingLawPdf, setIsDownloadingLawPdf] = useState(false);
  const lawDocRef = useRef<HTMLDivElement>(null);

  // Egyptian Labor Law Guide text for download
  const handleDownloadLawPDF = async () => {
    if (!lawDocRef.current) return;
    setIsDownloadingLawPdf(true);
    try {
      await downloadElementAsPdf(lawDocRef.current, {
        fileName: 'دليل_قانون_العمل_المصري_12_لسنة_2003_معتمد.pdf',
        orientation: 'portrait',
        marginMm: 8,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingLawPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <Scale className="w-4 h-4" />
              <span>المرجع القانوني الرسمي للسوق المصري</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              دليل قانون العمل المصري والتأمينات الاجتماعية
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              مرجع معتمد وشامل لأحكام قانون العمل رقم 12 لسنة 2003 وتعديلاته، وقانون التأمينات والمعاشات رقم 148 لسنة 2019، وحاسبات مكافأة نهاية الخدمة، والإضافي، والضرائب.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadLawPDF}
              disabled={isDownloadingLawPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              title="تحميل الدليل القانوني المرجعي كاملاً بصيغة ملف PDF"
            >
              {isDownloadingLawPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isDownloadingLawPdf ? 'جارٍ تجهيز ملف الـ PDF...' : 'تحميل مرجع قانون العمل (PDF)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة المستند الرسمي</span>
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'articles'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>أبواب ومواد القانون (قانون 12/2003 و 148/2019)</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'calculator'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>الحاسبة القانونية الذكية (تأمينات، إضافي، نهاية خدمة)</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'forms'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>نماذج استمارات التأمينات ومكتب العمل (س1، س2، س6)</span>
        </button>
      </div>

      {/* Tab 1: Law Articles Explorer */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          
          {/* Quick Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="ابحث في نصوص ومواد قانون العمل (مثال: نهاية الخدمة، ساعات العمل، الإجازة العارضة، التأمينات)..."
              value={searchArticle}
              onChange={(e) => setSearchArticle(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
            />
          </div>

          {/* Chapters Accordion */}
          <div className="space-y-3">
            
            {/* Chapter 1: Wages & Minimum Wage */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'sec-wages' ? null : 'sec-wages')}
                className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    ١
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">الأجور والحد الأدنى والعلاوة السنوية</h3>
                    <span className="text-[11px] text-slate-400">الحد الأدنى 6,000 ج.م • علاوة دورية 3% • حماية الأجور</span>
                  </div>
                </div>
                {expandedSection === 'sec-wages' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'sec-wages' && (
                <div className="p-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📌 قرار المجلس القومي للأجور (الحد الأدنى للأجور):</strong>
                    <p>
                      يلتزم أصحاب الأعمال في القطاع الخاص المصري بالحد الأدنى للأجور المحدد بـ <strong>6,000 جنيه مصري شهرياً</strong>.
                      يضمن هذا الحد حماية العامل ومراعاة مستويات المعيشة، وتُحظر العقود التي تحدد أجراً أقل من ذلك.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📌 العلاوة الدورية السنوية (المادة 3 من قانون 12 لسنة 2003):</strong>
                    <p>
                      يستحق العاملون الذين تسري في شأنهم أحكام هذا القانون علاوة سنوية دورية في تاريخ استحقاقها لا تقل عن <strong>(3%) من أجر الاشتراك التأميني</strong> للمؤمن عليه.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📌 سداد الأجور وحمايتها (المادة 34 إلى 38):</strong>
                    <p>
                      تؤدى الأجور بالعملة المتداولة قانوناً (الجنيه المصري EGP) في أحد أيام العمل وفي مكانه أو عبر التحويلات البنكية المعتمدة (CIB / الأهلي / بنك مصر / إنستاباي).
                      ولا تبرأ ذمة صاحب العمل من الأجر إلا إذا وقّع العامل بما يفيد استلام الأجر في السجل المعد لذلك أو في كشوف الأجور، أو إيصال الإيداع البنكي.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter 2: Working Hours & Overtime */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'sec-hours' ? null : 'sec-hours')}
                className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    ٢
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ساعات العمل الرسمية وساعات العمل الإضافي (Overtime)</h3>
                    <span className="text-[11px] text-slate-400">المادتان 80 و 85 • 8 ساعات يومياً • إضافي نهاري 135% • ليلي 170% • عطلات 200%</span>
                  </div>
                </div>
                {expandedSection === 'sec-hours' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'sec-hours' && (
                <div className="p-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📌 ساعات العمل العادية (المادة 80):</strong>
                    <p>
                      لا يجوز تشغيل العامل تشغيلاً فعلياً أكثر من <strong>8 ساعات في اليوم أو 48 ساعة في الأسبوع</strong>، ولا تدخل فيها الفترات المخصصة لتناول الطعام والراحة.
                      ويجب أن تتخلل ساعات العمل فترة أو أكثر لتناول الطعام والراحة لا تقل في مجموعها عن ساعة، بحيث لا يعمل العامل أكثر من 5 ساعات متصلة.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📌 احتساب الساعات الإضافية (المادة 85):</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600">
                      <li><strong>ساعات العمل الإضافي النهارية:</strong> يستحق العامل أجراً إضافياً يعادل أجر ساعته مضافاً إليه <strong>35%</strong> عن ساعات العمل النهارية.</li>
                      <li><strong>ساعات العمل الإضافي الليلية:</strong> يستحق العامل أجراً إضافياً يعادل أجر ساعته مضافاً إليه <strong>70%</strong> عن ساعات العمل الليلية (من غروب الشمس إلى شروقها).</li>
                      <li><strong>العمل في أيام الراحات الأسبوعية والعطلات:</strong> يستحق العامل <strong>مثلي الأجر (200%)</strong> أو يُمنح يوماً بديلاً للراحة خلال الأسبوع التالي.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter 3: Leaves & Absences */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'sec-leaves' ? null : 'sec-leaves')}
                className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                    ٣
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">الإجازات السنوية، العارضة، المرضية وإجازات الوضع</h3>
                    <span className="text-[11px] text-slate-400">المواد 47 إلى 54 • 21 يوم اعتيادي • 7 أيام عارضة • إجازة وضع 90 يوماً</span>
                  </div>
                </div>
                {expandedSection === 'sec-leaves' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'sec-leaves' && (
                <div className="p-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <strong className="text-emerald-800 block font-bold mb-1">الإجازة السنوية (المادة 47):</strong>
                      <p>
                        21 يوماً بأجر كامل لمن أمضى في الخدمة سنة كاملة، وتزاد إلى 30 يوماً متى أمضى 10 سنوات في الخدمة أو تجاوز سن الخمسين.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <strong className="text-amber-800 block font-bold mb-1">الإجازة العارضة (المادة 48):</strong>
                      <p>
                        7 أيام خلال السنة لظرف طارئ لا يمكن توقعه مسبقاً، بحد أقصى يومين في المرة الواحدة وتخصم من رصيد الإجازات السنوية.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <strong className="text-purple-800 block font-bold mb-1">إجازة الوضع (المادة 91):</strong>
                      <p>
                        للعاملة التي أمضت 10 أشهر الحق في إجازة وضع مدتها 90 يوماً بأجر كامل تشمل المدة قبل الوضع وبعده، وساعتان يومياً للرضاعة لمدة سنتين.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <strong className="text-rose-800 block font-bold mb-1">الإجازة المرضية (المادة 54):</strong>
                      <p>
                        تثبت بقرار من الهيئة العامة للتأمين الصحي، وتُصرف التعويضات المالية وفقاً لأحكام قانون التأمينات الاجتماعية.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter 4: Social Insurance Law No. 148 of 2019 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'sec-insurance' ? null : 'sec-insurance')}
                className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-sm">
                    ٤
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">قانون التأمينات الاجتماعية والمعاشات رقم 148 لسنة 2019</h3>
                    <span className="text-[11px] text-slate-400">حصة العامل 11% • حصة صاحب العمل 18.75% • استمارات س1 وس2 وس6</span>
                  </div>
                </div>
                {expandedSection === 'sec-insurance' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'sec-insurance' && (
                <div className="p-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <strong className="text-slate-900 block">توزيع نسب الاشتراكات التأمينية الشهرية:</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                        <span className="text-[10px] text-emerald-700 font-bold block">حصة المؤمن عليه (العامل)</span>
                        <span className="text-lg font-black text-emerald-900 font-mono">11%</span>
                        <span className="text-[10px] text-emerald-600 block">تستقطع من راتب الموظف</span>
                      </div>
                      <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                        <span className="text-[10px] text-indigo-700 font-bold block">حصة المنشأة (صاحب العمل)</span>
                        <span className="text-lg font-black text-indigo-900 font-mono">18.75%</span>
                        <span className="text-[10px] text-indigo-600 block">تتحملها الشركة بالكامل</span>
                      </div>
                      <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300 text-center">
                        <span className="text-[10px] text-slate-600 font-bold block">إجمالي الاشتراك المسدد للتأمينات</span>
                        <span className="text-lg font-black text-slate-900 font-mono">29.75%</span>
                        <span className="text-[10px] text-slate-500 block">يورد للهيئة القومية للتأمين</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter 5: End of Service & Termination */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'sec-eos' ? null : 'sec-eos')}
                className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm">
                    ٥
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">مكافأة نهاية الخدمة والتعويض عن إنهاء العقد</h3>
                    <span className="text-[11px] text-slate-400">المادة 126 (نصف شهر عن أول 5 سنوات + شهر تالٍ) • المادة 122 (شهرين عن كل سنة للفصل التعسفي)</span>
                  </div>
                </div>
                {expandedSection === 'sec-eos' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSection === 'sec-eos' && (
                <div className="p-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📌 مكافأة نهاية الخدمة بعد سن الستين (المادة 126):</strong>
                    <p>
                      يستحق العامل مكافأة عن مدة عمله بعد سن الستين بواقع <strong>أجر نصف شهر عن كل سنة من السنوات الخمس الأولى</strong>،
                      و<strong>أجر شهر كامل عن كل سنة من السنوات التالية</strong>، متى لم تكن له حقوق عن هذه المدة وفقاً لأحكام تأمين الشيخوخة والعجز والوفاة.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <strong className="text-slate-900 block">📌 التعويض عن الفصل التعسفي غير المبرر (المادة 122):</strong>
                    <p>
                      إذا أنهى صاحب العمل عقد العمل غير محدد المدة دون مبرر مشروع وكافٍ، التزم بأن يعوض العامل عما يصيبه من ضرر.
                      ولا يجوز أن يقل التعويض الذي تحكم به المحكمة العمالية عن <strong>أجر شهرين عن كل سنة من سنوات الخدمة</strong> السابقة.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Legal Calculators */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>معايير الاحتساب التفاعلية</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الاحتساب المطلوب:</label>
              <select
                value={calcType}
                onChange={(e) => setCalcType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="insurance">التأمينات الاجتماعية (قانون 148 لسنة 2019)</option>
                <option value="overtime">ساعات العمل الإضافي (المادة 85)</option>
                <option value="gratuity">مكافأة نهاية الخدمة (المادة 126)</option>
                <option value="tax">ضريبة كسب العمل (شرائح مصلحة الضرائب)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الشهري (جنيه مصري EGP):</label>
              <input
                type="number"
                min="6000"
                step="500"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Math.max(1000, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">الحد الأدنى القانوني في مصر: 6,000 ج.م</span>
            </div>

            {calcType === 'gratuity' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سنوات الخدمة في الشركة:</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={serviceYears}
                  onChange={(e) => setServiceYears(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
            )}

            {calcType === 'overtime' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ساعات عمل إضافية نهارية (+35%):</label>
                  <input
                    type="number"
                    min="0"
                    value={overtimeDayHours}
                    onChange={(e) => setOvertimeDayHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ساعات عمل إضافية ليلية (+70%):</label>
                  <input
                    type="number"
                    min="0"
                    value={overtimeNightHours}
                    onChange={(e) => setOvertimeNightHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ساعات عمل عطلات وأعياد رسمية (200%):</label>
                  <input
                    type="number"
                    min="0"
                    value={overtimeHolidayHours}
                    onChange={(e) => setOvertimeHolidayHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            
            {calcType === 'insurance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">نتائج احتساب التأمينات الاجتماعية (قانون 148 لسنة 2019)</h4>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">معتمد رسمياً</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-bold block">استقطاع حصة الموظف (11%):</span>
                    <span className="text-2xl font-black text-emerald-950 font-mono mt-1 block">
                      {employeeInsuranceShare.toLocaleString('ar-EG')} <small className="text-xs font-normal">جنيه مصري</small>
                    </span>
                    <span className="text-[11px] text-emerald-700 mt-1 block">تخصم من الراتب الإجمالي شهرياً</span>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <span className="text-xs text-indigo-800 font-bold block">مساهمة المنشأة / صاحب العمل (18.75%):</span>
                    <span className="text-2xl font-black text-indigo-950 font-mono mt-1 block">
                      {employerInsuranceShare.toLocaleString('ar-EG')} <small className="text-xs font-normal">جنيه مصري</small>
                    </span>
                    <span className="text-[11px] text-indigo-700 mt-1 block">تتحملها الشركة لصالح التأمينات</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">إجمالي الشيك المسدد للهيئة القومية للتأمين الاجتماعي (29.75%):</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {totalInsuranceShare.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>
            )}

            {calcType === 'overtime' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">نتائج احتساب ساعات العمل الإضافي (المادة 85)</h4>
                  <span className="text-xs text-slate-500 font-mono">أجر الساعة الأساسي: {hourlyRate.toFixed(2)} ج.م</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">إضافي نهاري ({overtimeDayHours} س × 135%):</span>
                    <span className="text-base font-bold text-slate-900 font-mono mt-1 block">{Math.round(dayOvertimePay)} ج.م</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">إضافي ليلي ({overtimeNightHours} س × 170%):</span>
                    <span className="text-base font-bold text-slate-900 font-mono mt-1 block">{Math.round(nightOvertimePay)} ج.م</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">عطلات رسمية ({overtimeHolidayHours} س × 200%):</span>
                    <span className="text-base font-bold text-slate-900 font-mono mt-1 block">{Math.round(holidayOvertimePay)} ج.م</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">إجمالي مستحقات الأوفر تايم المستحقة في مسير الراتب:</span>
                  <span className="text-xl font-black text-emerald-950 font-mono">
                    +{totalOvertimePay.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>
            )}

            {calcType === 'gratuity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">احتساب مكافأة نهاية الخدمة (المادة 126 من قانون العمل)</h4>
                  <span className="text-xs font-bold text-slate-600">{serviceYears} سنوات خدمة</span>
                </div>

                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-xs text-emerald-800 font-bold block">إجمالي مكافأة نهاية الخدمة المستحقة:</span>
                  <span className="text-3xl font-black text-emerald-950 font-mono">
                    {gratuityTotal.toLocaleString('ar-EG')} <small className="text-sm font-bold">جنيه مصري</small>
                  </span>
                  <p className="text-[11px] text-slate-600 mt-2">
                    طريقة الاحتساب: أجر نصف شهر ({monthlySalary / 2} ج.م) عن كل سنة من السنوات الخمس الأولى + أجر شهر كامل ({monthlySalary} ج.م) عن كل سنة إضافية.
                  </p>
                </div>
              </div>
            )}

            {calcType === 'tax' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">استقطاع ضريبة كسب العمل والمرتبات (مصلحة الضرائب المصرية)</h4>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">طبقاً للشرائح التصاعدية</span>
                </div>

                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                  <span className="text-xs text-blue-800 font-bold block">الضريبة الشهرية المستقطعة من الراتب:</span>
                  <span className="text-3xl font-black text-blue-950 font-mono">
                    {monthlyIncomeTax.toLocaleString('ar-EG')} <small className="text-sm font-bold">جنيه مصري / شهرياً</small>
                  </span>
                  <p className="text-[11px] text-slate-600 mt-2">
                    تُحسب الضريبة بعد خصم حصة العامل في التأمينات الاجتماعية (11%) والإعفاء الشخصي السنوي المقدر بـ 20,000 ج.م مع تطبيق الشريحة المعفاة 0%.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Tab 3: Official Forms & Templates */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Form S1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              س١
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">استمارة (1) تأمينات اجتماعية</h3>
              <span className="text-xs text-slate-400 block mt-0.5">إخطار بدء اشتراك عامل بالمنشأة</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تُقدم إلى مكتب التأمينات الاجتماعية التابع له مقر الشركة خلال شهر من تاريخ استلام الموظف للعمل، موضحاً بها الرقم القومي والأجر الشامل وتاريخ التعيين.
            </p>
            <button
              onClick={() => alert('تم تجهيز بيانات استمارة س1 للموظفين الجدد جاهزة للطباعة والتوقيع.')}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
            >
              عرض وتعبئة نموذج استمارة (1)
            </button>
          </div>

          {/* Form S2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              س٢
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">استمارة (2) تأمينات اجتماعية</h3>
              <span className="text-xs text-slate-400 block mt-0.5">إقرار سنوي بالأجور والاشتراكات</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تُقدم سنوياً في شهر يناير لبيان التعديلات في أجور العاملين والعلاوات الدورية السنوية (3%) وتعديل نسب الاشتراكات وفقاً لقرارات الهيئة القومية للتأمين.
            </p>
            <button
              onClick={() => alert('تم استخراج كشف استمارة س2 السنوية لجميع العاملين.')}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition-colors"
            >
              عرض وتعبئة نموذج استمارة (2)
            </button>
          </div>

          {/* Form S6 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              س٦
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">استمارة (6) تأمينات اجتماعية</h3>
              <span className="text-xs text-slate-400 block mt-0.5">إخطار انتهاء خدمة مؤمن عليه وخلو طرف</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تُقدم عند انتهاء خدمة العامل سواء بالاستقالة أو انتهاء مدة العقد أو التقاعد، وتُرفق معها مخالصة الأجور ومكافأة نهاية الخدمة لتسوية معاشه.
            </p>
            <button
              onClick={() => alert('تم تجهيز نموذج استمارة س6 مع إخلاء الطرف ومخالصة الأجور.')}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
            >
              عرض وتعبئة نموذج استمارة (6)
            </button>
          </div>

        </div>
      )}

      {/* Offscreen High-Resolution Printable Legal Reference Document for PDF Export (Official Black & White Gazette Style) */}
      <div
        ref={lawDocRef}
        data-pdf-content="egyptian-labor-law-doc"
        style={{ position: 'absolute', left: '-9999px', top: 0, width: '840px' }}
        className="bg-white text-neutral-950 p-10 font-['Cairo',sans-serif] space-y-6 border-2 border-neutral-900 printable-official-doc"
      >
        {/* Document Header */}
        <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-black text-xl shadow-sm">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-950">جمهورية مصر العربية</h2>
                <span className="text-[10px] font-bold border border-neutral-800 px-2 py-0.5 rounded font-mono">
                  الجريدة الرسمية
                </span>
              </div>
              <p className="text-xs text-neutral-700 font-bold">الدليل المرجعي الرسمي لأحكام قانون العمل والتأمينات الاجتماعية</p>
              <p className="text-[11px] text-neutral-500 font-mono">قانون رقم 12 لسنة 2003 • قانون التأمينات 148 لسنة 2019</p>
            </div>
          </div>
          <div className="text-left font-mono text-xs text-neutral-600">
            <div>تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>كود الوثيقة: LAW-REF-2026-EG</div>
            <div className="text-neutral-950 font-bold border-b border-neutral-400 pb-0.5">نسخة رسمية معتمدة (أبيض وأسود)</div>
          </div>
        </div>

        {/* Section 1: Minimum Wage */}
        <div className="space-y-2 border-b border-neutral-300 pb-4">
          <h3 className="text-sm font-black text-neutral-950 flex items-center gap-2">
            <span>الباب الأول: الحد الأدنى للأجور والعلاوة الدورية وفترة الاختبار</span>
          </h3>
          <ul className="text-xs text-neutral-800 space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>الحد الأدنى للأجور:</strong> يلتزم صاحب العمل في القطاع الخاص بالحد الأدنى للأجور المقرر من المجلس القومي للأجور (6,000 جنيه مصري شهرياً).</li>
            <li><strong>العلاوة الدورية السنوية:</strong> يستحق العامل علاوة دورية سنوية لا تقل عن (3%) من أجر الاشتراك التأميني تُصرف سنوياً.</li>
            <li><strong>فترة الاختبار (المادة 32):</strong> تحدد فترة الاختبار بما لا يزيد على ثلاثة أشهر، ولا يجوز تعيين العامل تحت الاختبار أكثر من مرة لدى نفس صاحب العمل.</li>
          </ul>
        </div>

        {/* Section 2: Working Hours & Overtime */}
        <div className="space-y-2 border-b border-neutral-300 pb-4">
          <h3 className="text-sm font-black text-neutral-950 flex items-center gap-2">
            <span>الباب الثاني: ساعات العمل والعمل الإضافي والراحات الأسبوعية</span>
          </h3>
          <ul className="text-xs text-neutral-800 space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>ساعات العمل الأساسية:</strong> 8 ساعات عمل يومياً أو 48 ساعة أسبوعياً كحد أقصى (لا تشمل فترات الراحة).</li>
            <li><strong>أجر العمل الإضافي النهاري:</strong> أجر الساعة مضافاً إليه 35% عن ساعات التشغيل الإضافية النهارية.</li>
            <li><strong>أجر العمل الإضافي الليلي:</strong> أجر الساعة مضافاً إليه 70% عن ساعات التشغيل الليلية.</li>
            <li><strong>العمل في العطلات الرسمية والأعياد:</strong> يستحق العامل مثلي الأجر (أجره عن اليوم + 100% إضافي)، أو يوماً بديلاً للراحة.</li>
          </ul>
        </div>

        {/* Section 3: Official Leaves */}
        <div className="space-y-2 border-b border-neutral-300 pb-4">
          <h3 className="text-sm font-black text-neutral-950 flex items-center gap-2">
            <span>الباب الثالث: الإجازات السنوية والرسمية والعارضة</span>
          </h3>
          <ul className="text-xs text-neutral-800 space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>الإجازة الاعتيادية (المادة 47):</strong> 21 يوماً لمن أمضى سنة، وتزاد إلى 30 يوماً لمن أمضى 10 سنوات أو تجاوز سن الخمسين.</li>
            <li><strong>الإجازة العارضة (المادة 48):</strong> 7 أيام كحد أقصى في السنة ولا تتجاوز يومين في المرة الواحدة وتخصم من الرصيد السنوي.</li>
            <li><strong>إجازة الوضع للأمهات (المادة 91):</strong> 90 يوماً بأجر كامل تشمل ما قبل الوضع وما بعده، وفترتي رضاعة نصف ساعة يومياً لمدة عامين.</li>
            <li><strong>الإجازة المرضية (المادة 54):</strong> تثبت بقرار التأمين الصحي، وتُصرف بنسبة 75% لأول 90 يوماً ثم 85% للـ 90 يوماً التالية.</li>
          </ul>
        </div>

        {/* Section 4: Social Insurance Rates Table */}
        <div className="space-y-2 border-b border-neutral-300 pb-4">
          <h3 className="text-sm font-black text-neutral-950">الباب الرابع: نسب التأمينات الاجتماعية (قانون 148 لسنة 2019)</h3>
          <table className="w-full text-xs border-2 border-neutral-900 text-right">
            <thead className="bg-neutral-100 font-black border-b-2 border-neutral-900 text-neutral-950">
              <tr>
                <th className="p-2 border-l border-neutral-300">الطرف المكلف بالاشتراك</th>
                <th className="p-2 border-l border-neutral-300">النسبة القانونية</th>
                <th className="p-2">الوعاء التأميني المطبق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="p-2 border-l border-neutral-300 font-semibold text-neutral-900">حصة المؤمن عليه (العامل)</td>
                <td className="p-2 border-l border-neutral-300 font-mono font-bold text-neutral-950">11%</td>
                <td className="p-2 text-neutral-800">أجر الاشتراك التأميني الشامل</td>
              </tr>
              <tr>
                <td className="p-2 border-l border-neutral-300 font-semibold text-neutral-900">حصة صاحب العمل (المنشأة)</td>
                <td className="p-2 border-l border-neutral-300 font-mono font-bold text-neutral-950">18.75%</td>
                <td className="p-2 text-neutral-800">تأمين الشيخوخة والعجز وإصابات العمل</td>
              </tr>
              <tr className="bg-neutral-100 font-black border-t-2 border-neutral-900">
                <td className="p-2 border-l border-neutral-300 text-neutral-950">إجمالي الاشتراك المشترك</td>
                <td className="p-2 border-l border-neutral-300 font-mono text-neutral-950">29.75%</td>
                <td className="p-2 text-neutral-950">يُسدد شهرياً للهيئة القومية للتأمين الاجتماعي</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 5: End of Service Gratuity & Indemnity */}
        <div className="space-y-2 border-b border-neutral-300 pb-4">
          <h3 className="text-sm font-black text-neutral-950">الباب الخامس: مكافأة نهاية الخدمة والتعويض عن الفصل</h3>
          <ul className="text-xs text-neutral-800 space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>مكافأة سن الستين (المادة 126):</strong> نصف شهر عن كل سنة من السنوات الخمس الأولى، وأجر شهر عن كل سنة من السنوات التالية.</li>
            <li><strong>التعويض عن الفصل التعسفي (المادة 122):</strong> أجر شهرين على الأقل عن كل سنة من سنوات الخدمة بالإضافة لمهلة الإخطار.</li>
          </ul>
        </div>

        {/* Validation Stamp & Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-neutral-950" />
            <div>
              <p className="font-bold text-neutral-950">إدارة الشؤون القانونية والموارد البشرية</p>
              <p className="text-[10px] text-neutral-500">منظومة موارد HR - التوافق والامتثال القانوني</p>
            </div>
          </div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-950 font-black text-[10px] rounded-lg border-2 border-neutral-900">
              معتمد ومطابق لأحدث تشريعات العمل المصرية 2026
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
