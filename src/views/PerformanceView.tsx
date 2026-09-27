import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Plus,
  Star,
  CheckCircle2,
  TrendingUp,
  Target,
  BrainCircuit,
  X,
  FileText,
  User,
  Loader2
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Evaluation } from '../types';
import { generatePerformanceAnalysis } from '../services/gemini';

export const PerformanceView: React.FC = () => {
  const { employees, evaluations, addEvaluation } = useHR();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(evaluations[0] || null);

  // Form State
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    period: 'الربع الثالث 2026',
    productivityScore: 90,
    qualityScore: 90,
    punctualityScore: 90,
    teamworkScore: 90,
    innovationScore: 85,
    strengths: '',
    areasForImprovement: '',
    goals: '',
    aiSummary: '',
    evaluatorName: 'منصور الراشد (نائب الرئيس للعمليات)',
  });

  const selectedEmp = employees.find((e) => e.id === formData.employeeId);

  const calculateOverall = (scores: {
    productivityScore: number;
    qualityScore: number;
    punctualityScore: number;
    teamworkScore: number;
    innovationScore: number;
  }) => {
    return Math.round(
      (scores.productivityScore +
        scores.qualityScore +
        scores.punctualityScore +
        scores.teamworkScore +
        scores.innovationScore) /
        5
    );
  };

  const handleGenerateWithAi = async () => {
    if (!selectedEmp) return;
    setIsGeneratingAi(true);
    try {
      const summary = await generatePerformanceAnalysis({
        employeeName: selectedEmp.fullName,
        jobTitle: selectedEmp.jobTitle,
        department: selectedEmp.department,
        scores: {
          productivity: formData.productivityScore,
          quality: formData.qualityScore,
          punctuality: formData.punctualityScore,
          teamwork: formData.teamworkScore,
          innovation: formData.innovationScore,
        },
        notes: `تقييم دوري للفترة ${formData.period}`,
      });

      setFormData((prev) => ({
        ...prev,
        aiSummary: summary,
        strengths: prev.strengths || 'التفوق في سرعة الإنجاز والحرص على جودة المخرجات.',
        areasForImprovement: prev.areasForImprovement || 'تعزيز القيادة الإشرافية وتقديم ورش تدريبية للفريق.',
        goals: prev.goals || 'تحقيق نمو بنسبة 20% في مؤشرات الأداء التشغيلية للربع القادم.',
      }));
    } catch (err: any) {
      alert('فشل توليد التقرير بالذكاء الاصطناعي: ' + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const overall = calculateOverall(formData);

    addEvaluation({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.fullName,
      department: selectedEmp.department,
      jobTitle: selectedEmp.jobTitle,
      period: formData.period,
      productivityScore: formData.productivityScore,
      qualityScore: formData.qualityScore,
      punctualityScore: formData.punctualityScore,
      teamworkScore: formData.teamworkScore,
      innovationScore: formData.innovationScore,
      overallScore: overall,
      strengths: formData.strengths,
      areasForImprovement: formData.areasForImprovement,
      goals: formData.goals,
      aiSummary: formData.aiSummary,
      evaluatorName: formData.evaluatorName,
      status: 'finalized',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">تقييم أداء الموظفين ومؤشرات KPI و OKRs</h2>
            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> مدعوم بـ Gemini AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">تقييم شامل متعدد المعايير، توليد خطط التطوير الفردية وتوصيات الذكاء الاصطناعي</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إجراء تقييم أداء جديد</span>
        </button>
      </div>

      {/* Main Grid: Evaluation List + Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Evaluations List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
            سجلات التقييم المعتمدة ({evaluations.length})
          </h3>

          <div className="space-y-3">
            {evaluations.map((ev) => {
              const isSelected = selectedEvaluation?.id === ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvaluation(ev)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-violet-50/50 border-violet-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ev.employeeName}</h4>
                      <span className="text-xs text-slate-500">{ev.jobTitle}</span>
                    </div>
                    <div className="text-center bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      <span className="text-xs font-black text-violet-700 font-mono">{ev.overallScore}%</span>
                      <span className="text-[9px] text-slate-400 block">المعدل</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">{ev.period}</span>
                    <span className="text-slate-400">المقيم: {ev.evaluatorName.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Performance Card */}
        <div className="lg:col-span-2">
          {selectedEvaluation ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900">{selectedEvaluation.employeeName}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {selectedEvaluation.overallScore >= 90 ? 'أداء استثنائي (A+)' : 'أداء جيد جداً (B+)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedEvaluation.jobTitle} • قسم {selectedEvaluation.department} • فترة {selectedEvaluation.period}
                  </p>
                </div>

                <div className="text-center p-3 bg-violet-50 rounded-2xl border border-violet-100 shrink-0">
                  <span className="text-2xl font-black text-violet-700 font-mono">
                    {selectedEvaluation.overallScore}%
                  </span>
                  <span className="text-[10px] text-violet-600 block font-bold mt-0.5">المعدل التراكمي للتقييم</span>
                </div>
              </div>

              {/* 5 KPI Dimension Progress Bars */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>محاور تقييم الأداء والكفاءة الوظيفية (من 100):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>الإنتاجية وإنجاز المهام:</span>
                      <span className="font-mono text-emerald-700">{selectedEvaluation.productivityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${selectedEvaluation.productivityScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>جودة ودقة العمل:</span>
                      <span className="font-mono text-emerald-700">{selectedEvaluation.qualityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${selectedEvaluation.qualityScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>الالتزام بالمواعيد والحضور:</span>
                      <span className="font-mono text-blue-700">{selectedEvaluation.punctualityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${selectedEvaluation.punctualityScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>العمل الجماعي وروح الفريق:</span>
                      <span className="font-mono text-indigo-700">{selectedEvaluation.teamworkScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${selectedEvaluation.teamworkScore}%` }}></div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>الابتكار وحل المشكلات المعقدة:</span>
                      <span className="font-mono text-violet-700">{selectedEvaluation.innovationScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-violet-600 h-full rounded-full" style={{ width: `${selectedEvaluation.innovationScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gemini AI Performance Report Banner */}
              {selectedEvaluation.aiSummary && (
                <div className="p-4 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 rounded-2xl border border-violet-200">
                  <div className="flex items-center gap-2 text-violet-800 font-bold text-xs mb-2">
                    <BrainCircuit className="w-4 h-4 text-violet-600" />
                    <span>تحليل وتوصيات الذكاء الاصطناعي (Gemini AI Insights):</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedEvaluation.aiSummary}
                  </p>
                </div>
              )}

              {/* Strengths & Improvement Areas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <h5 className="font-bold text-emerald-800 mb-1">أبرز نقاط القوة:</h5>
                  <p className="text-slate-700 leading-relaxed">{selectedEvaluation.strengths}</p>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <h5 className="font-bold text-amber-800 mb-1">مجالات التحسين المستهدفة:</h5>
                  <p className="text-slate-700 leading-relaxed">{selectedEvaluation.areasForImprovement}</p>
                </div>
              </div>

              {/* Future Goals / OKRs */}
              {selectedEvaluation.goals && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <h5 className="font-bold text-slate-800 mb-1">الأهداف والتطلعات المستقبلية (OKRs):</h5>
                  <p className="text-slate-600 leading-relaxed">{selectedEvaluation.goals}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>المقيم المعتمد: {selectedEvaluation.evaluatorName}</span>
                <span>تاريخ الاعتماد: {selectedEvaluation.createdAt}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              اختر تقييماً من القائمة لعرض التحليل الكامل ومؤشرات الأداء.
            </div>
          )}
        </div>

      </div>

      {/* Add New Evaluation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">إجراء تقييم أداء جديد للموظف</h3>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">
                  Gemini Powered
                </span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الموظف المعني بالتقييم:</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} - {emp.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">فترة التقييم:</label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="مثال: الربع الثالث 2026"
                  />
                </div>
              </div>

              {/* Slider / Numbers for 5 dimensions */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-800">تحديد الدرجات حسب المعايير (من 100):</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 font-bold">
                      <span>الإنتاجية:</span>
                      <span className="font-mono text-emerald-700">{formData.productivityScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={formData.productivityScore}
                      onChange={(e) => setFormData({ ...formData, productivityScore: Number(e.target.value) })}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 font-bold">
                      <span>جودة ودقة العمل:</span>
                      <span className="font-mono text-emerald-700">{formData.qualityScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={formData.qualityScore}
                      onChange={(e) => setFormData({ ...formData, qualityScore: Number(e.target.value) })}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 font-bold">
                      <span>الالتزام بالمواعيد:</span>
                      <span className="font-mono text-blue-700">{formData.punctualityScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={formData.punctualityScore}
                      onChange={(e) => setFormData({ ...formData, punctualityScore: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-700 font-bold">
                      <span>العمل الجماعي:</span>
                      <span className="font-mono text-indigo-700">{formData.teamworkScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={formData.teamworkScore}
                      onChange={(e) => setFormData({ ...formData, teamworkScore: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between mb-1 text-slate-700 font-bold">
                      <span>الابتكار والمبادرة:</span>
                      <span className="font-mono text-violet-700">{formData.innovationScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={formData.innovationScore}
                      onChange={(e) => setFormData({ ...formData, innovationScore: Number(e.target.value) })}
                      className="w-full accent-violet-600"
                    />
                  </div>
                </div>

                {/* AI Generation Trigger */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">المعدل التراكمي المحسوب: <strong>{calculateOverall(formData)}%</strong></span>
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={isGeneratingAi}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري التحليل بـ Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>توليد التقرير الذكي بـ Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Summary result */}
              {formData.aiSummary && (
                <div>
                  <label className="block text-xs font-bold text-violet-900 mb-1">ملخص التحليل الذكي المولد:</label>
                  <textarea
                    rows={4}
                    value={formData.aiSummary}
                    onChange={(e) => setFormData({ ...formData, aiSummary: e.target.value })}
                    className="w-full px-3 py-2 bg-violet-50/60 border border-violet-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أبرز نقاط القوة:</label>
                <input
                  type="text"
                  required
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="مثال: سرعة التعلم، القيادة الفنية، التعاون المستمر"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مجالات التطوير المقترحة:</label>
                <input
                  type="text"
                  required
                  value={formData.areasForImprovement}
                  onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                  placeholder="مثال: إدارة الوقت، تقديم عروض تقديمية دورية"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الأهداف والتطلعات (OKRs):</label>
                <input
                  type="text"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="الأهداف المحددة للربع القادم"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20"
                >
                  اعتماد وحفظ التقييم
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
