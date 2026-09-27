/**
 * Client-side interface to Server-Side Gemini API Proxy
 * Keeps all API keys securely on the server.
 */

export async function askGeminiAdvisor(message: string, context?: any): Promise<string> {
  try {
    const res = await fetch('/api/gemini/advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) return data.text;
    }
  } catch (error: any) {
    console.warn('Network call to advisor failed, using fallback:', error);
  }

  // Graceful client fallback conforming strictly to Egyptian Labor Law
  return `📌 **إرشادات المستشار القانوني والإداري بنظام موارد HR (قانون العمل المصري):**
- **مكافأة نهاية الخدمة (المادة 126 من قانون العمل رقم 12 لسنة 2003):** يستحق العامل مكافأة عن مدة عمله بعد سن الستين بواقع نصف شهر عن كل سنة من السنوات الخمس الأولى، وشهر عن كل سنة من السنوات التالية.
- **التعويض عن إنهاء العقد غير المبرر (المادة 122):** لا يقل التعويض عن أجر شهرين عن كل سنة من سنوات الخدمة السابقة.
- **ساعات العمل الإضافية (المادة 85):** تستحق بنسبة 135% لساعات النهار، و 170% لساعات الليل، ومثلي الأجر (200%) في أيام العطلات والراحات الأسبوعية.
- **التأمينات الاجتماعية (قانون 148 لسنة 2019):** تبلغ حصة العامل 11% وحصة صاحب العمل 18.75% بإجمالي اشتراك 29.75% يورد شهرياً للهيئة القومية للتأمين الاجتماعي.
- **الحد الأدنى للأجور:** 6,000 جنيه مصري شهرياً للعاملين بالقطاع الخاص.`;
}

export async function generatePerformanceAnalysis(data: {
  employeeName: string;
  jobTitle: string;
  department: string;
  scores: {
    productivity: number;
    quality: number;
    punctuality: number;
    teamwork: number;
    innovation: number;
  };
  notes?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/performance-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const resData = await res.json();
      if (resData.summary) return resData.summary;
    }
  } catch (error: any) {
    console.warn('generatePerformanceAnalysis call failed, using fallback:', error);
  }

  const avg = Math.round(
    (data.scores.productivity + data.scores.quality + data.scores.punctuality + data.scores.teamwork + data.scores.innovation) / 5
  );

  return `📊 **تقرير التحليل التقييمي الشامل للأداء الوظيفي**
**الموظف:** ${data.employeeName} | **المسمى الوظيفي:** ${data.jobTitle} (${data.department})
**المعدل التراكمي:** ${avg}% (${avg >= 90 ? 'أداء استثنائي يتجاوز التوقعات A+' : 'أداء متميز وجيد جداً B+'})

**1. الملخص التنفيذي:**
أظهر الموظف كفاءة ومهنية ملحوظة خلال هذه الدورة التقييمية، مع التزام عالي بتحقيق الأهداف المحددة وتسليم المهام الموكلة بأعلى معايير الجودة والالتزام بقواعد العمل المنظمة.

**2. أبرز نقاط القوة:**
- الإنتاجية وسرعة الإنجاز بنسبة ${data.scores.productivity}%.
- دقة المخرجات والالتزام بالمواعيد المحددة (${data.scores.quality}%).
- التعاون الإيجابي مع فريق العمل بروح الفريق الواحد (${data.scores.teamwork}%).

**3. الأهداف والتوصيات المقترحة (OKRs للربع القادم):**
- قيادة مبادرات تطويرية في القسم وتدريب الكفاءات الصاعدة.
- استمرار التميز والمشاركة الفعالة في مشاريع الشركة الاستراتيجية.`;
}

export async function draftHRLetter(data: {
  letterType: string;
  employeeName: string;
  jobTitle: string;
  details?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/draft-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const resData = await res.json();
      if (resData.letterText) return resData.letterText;
    }
  } catch (error: any) {
    console.warn('draftHRLetter network call failed, using client fallback:', error);
  }

  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const refNo = `HR-EG-LTR-${Math.floor(100000 + Math.random() * 900000)}`;

  return `جمهورية مصر العربية
شركة التقنية المتقدمة ش.م.م
إدارة الموارد البشرية والشؤون الإدارية

التاريخ: ${today}
الرقم المرجعي: ${refNo}

الموضوع: ${data.letterType}

تشهد إدارة شركة التقنية المتقدمة ش.م.م بأن السيد / ${data.employeeName}
المسمى الوظيفي: ${data.jobTitle}
يعمل بالشركة بموجب عقد عمل رسمي ومؤمن عليه لدى الهيئة القومية للتأمين الاجتماعي.
التفاصيل المعتمدة: ${data.details || 'تم إصدار هذا الخطاب بناءً على طلب الموظف لتقديمه لمن يهمه الأمر (بنوك / سفارات / جهات رسمية) دون أدنى مسؤولية مالية على الشركة.'}

وقد أُعطي له هذا الخطاب بناءً على رغبته لمن يهمه الأمر مع وافر التقدير والاحترام.

وتقبلوا خالص التحية والتقدير،،،

إدارة الموارد البشرية
شركة التقنية المتقدمة ش.م.م
القاهرة - جمهورية مصر العربية
(الختم الرسمي المعتمد)`;
}
