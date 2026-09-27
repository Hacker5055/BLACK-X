import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  FileText,
  Copy,
  Check,
  Loader2,
  Bot,
  User,
  ShieldCheck,
  HelpCircle,
  Printer,
  Download
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { askGeminiAdvisor, draftHRLetter } from '../services/gemini';
import { downloadElementAsPdf } from '../utils/pdfExport';

export const AdvisorChatModal: React.FC = () => {
  const { showAdvisorModal, setShowAdvisorModal, employees, attendance, payrolls } = useHR();

  const [activeTab, setActiveTab] = useState<'chat' | 'letters'>('chat');

  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'مرحباً بك! أنا مستشارك الذكي للموارد البشرية واللوائح الإدارية بنظام "موارد HR". كيف يمكنني مساعدتك اليوم في نظام العمل، سياسات الإجازات، احتساب الرواتب، أو إدارة فرق العمل؟',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Letter Drafting State
  const [letterType, setLetterType] = useState('خطاب تعريف بالراتب موجه للبنوك');
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [letterDetails, setLetterDetails] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const letterDocRef = useRef<HTMLDivElement>(null);

  const handleDownloadLetterPdf = async () => {
    if (!letterDocRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const fileName = `خطاب_إداري_رسمي_${letterType}.pdf`;
      await downloadElementAsPdf(letterDocRef.current, {
        fileName,
        orientation: 'portrait',
        marginMm: 10,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!showAdvisorModal) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoadingChat) return;

    const newMsgs = [...messages, { sender: 'user' as const, text }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsLoadingChat(true);

    try {
      const context = {
        totalEmployees: employees.length,
        departments: Array.from(new Set(employees.map((e) => e.department))),
        month: '2026-09',
      };
      const reply = await askGeminiAdvisor(text, context);
      setMessages([...newMsgs, { sender: 'ai', text: reply }]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: 'عذراً، حدث خطأ أثناء الاتصال بمستشار الذكاء الاصطناعي: ' + err.message,
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleDraftLetter = async () => {
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    setIsDrafting(true);
    try {
      const result = await draftHRLetter({
        letterType,
        employeeName: emp.fullName,
        jobTitle: emp.jobTitle,
        details: `المرتب الأساسي: ${emp.basicSalary} جنيه مصري، بدل السكن: ${emp.housingAllowance} جنيه مصري، تاريخ التعيين: ${emp.hireDate}، الرقم القومي: ${emp.nationalId || '-'}. ${letterDetails}`,
      });
      setGeneratedLetter(result);
    } catch (err: any) {
      alert('خطأ في صياغة الخطاب: ' + err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">مستشار الموارد البشرية الذكي 24/7</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  متصل ومتاح لحظياً
                </span>
              </div>
              <p className="text-xs text-slate-300">مدعوم بنموذج Google Gemini 3.8 Flash للاستشارات والخطابات الإدارية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white/10 rounded-xl p-1 border border-white/15 text-xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                الاستشارات والدعم
              </button>
              <button
                onClick={() => setActiveTab('letters')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'letters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-200 hover:text-white'
                }`}
              >
                صياغة الخطابات الرسمية
              </button>
            </div>

            <button
              onClick={() => setShowAdvisorModal(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Live Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* Quick Prompts */}
            <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">أسئلة شائعة:</span>
              {[
                'كيف تحسب مكافأة نهاية الخدمة في قانون العمل المصري (المادة 126)؟',
                'ما هي نسبة اشتراك التأمينات الاجتماعية (قانون 148 لسنة 2019)؟',
                'ما هي ضوابط ساعات العمل الإضافي والأوفر تايم (المادة 85)؟',
                'ما هي شروط استحقاق الإجازة العارضة وإجازة الوضع للأمهات العاملات؟',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    m.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line border border-slate-200/60'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isLoadingChat && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 bg-slate-100 rounded-2xl rounded-tl-none text-xs text-slate-500">
                    جاري التفكير وصياغة الإجابة القانونية والإدارية...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="اطرح استفسارك الإداري أو القانوني هنا..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLoadingChat || !inputMessage.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab 2: Letter Drafting */}
        {activeTab === 'letters' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الخطاب المطلوب:</label>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="خطاب تعريف بالراتب موجه للبنوك">خطاب تعريف بالراتب موجه للبنوك</option>
                  <option value="خطاب تعريف بالراتب موجه للسفارات والتأشيرات">خطاب تعريف بالراتب موجه للسفارات</option>
                  <option value="خطاب إنذار وتنبيه إداري لموظف">خطاب إنذار وتنبيه إداري لموظف</option>
                  <option value="خطاب ترقية وزيادة راتب">خطاب ترقية وتعديل مسمى وراتب</option>
                  <option value="شهادة خبرة وإخلاء طرف">شهادة خبرة وإخلاء طرف معتمدة</option>
                  <option value="خطاب شكر وتقدير للإنجاز">خطاب شكر وتقدير للإنجاز الاستثنائي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الموظف المعني:</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات أو تفاصيل إضافية للخطاب:</label>
              <input
                type="text"
                value={letterDetails}
                onChange={(e) => setLetterDetails(e.target.value)}
                placeholder="مثال: موجه إلى بنك الراجحي لطلب تمويل عقاري..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleDraftLetter}
                disabled={isDrafting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isDrafting ? 'جاري الصياغة بـ Gemini...' : 'صياغة الخطاب الرسمي فورياً'}</span>
              </button>
            </div>

            {/* Result Box */}
            {generatedLetter && (
              <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900">مسودة الخطاب الرسمي المعتمد:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLetter}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
                    </button>
                    <button
                      onClick={handleDownloadLetterPdf}
                      disabled={isDownloadingPdf}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      {isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      <span>{isDownloadingPdf ? 'جارٍ التحميل...' : 'تحميل PDF'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={letterDocRef}
                  data-pdf-content="advisor-letter"
                  className="p-8 bg-white rounded-2xl border-2 border-neutral-900 text-xs text-neutral-950 leading-relaxed font-serif shadow-xs printable-official-doc space-y-4"
                >
                  <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-3 font-sans not-italic">
                    <div>
                      <h4 className="font-black text-sm text-neutral-950">خطاب إداري وقرار رسمي</h4>
                      <span className="text-[10px] text-neutral-600 font-mono">المرجع: HR-DEC-{Date.now().toString().slice(-6)}</span>
                    </div>
                    <div className="text-left font-mono text-[10px] text-neutral-600">
                      <span>التاريخ: {new Date().toLocaleDateString('ar-EG')}</span>
                      <span className="block font-bold text-neutral-900">طراز رسمي (أبيض وأسود)</span>
                    </div>
                  </div>

                  <div className="whitespace-pre-line py-2 text-justify text-neutral-900 leading-loose">
                    {generatedLetter}
                  </div>

                  <div className="pt-6 border-t-2 border-neutral-900 flex items-center justify-between font-sans not-italic text-[11px] text-neutral-700">
                    <div className="text-center">
                      <span className="font-bold block text-neutral-900">مسؤول الشؤون القانونية والموارد البشرية</span>
                      <div className="text-[10px] text-neutral-500 font-mono mt-2">[ توقيع معتمد ]</div>
                    </div>

                    <div className="w-18 h-18 rounded-full border-2 border-dashed border-neutral-900 flex flex-col items-center justify-center text-center p-1 text-neutral-950 select-none">
                      <span className="text-[8px] font-black leading-tight">معتمد رسمياً</span>
                      <span className="text-[7px] font-mono">SEAL HR</span>
                    </div>

                    <div className="text-center">
                      <span className="font-bold block text-neutral-900">المدير العام المفوض</span>
                      <div className="text-[10px] text-neutral-500 font-mono mt-2">[ اعتماد الإدارة ]</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
