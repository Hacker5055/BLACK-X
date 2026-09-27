import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const fallbackAdvisor = (msg: string) => {
  if (msg.includes('مكافأة نهاية الخدمة') || msg.includes('نهاية الخدمة')) {
    return `📌 **طريقة احتساب مكافأة نهاية الخدمة وفقاً لنظام العمل السعودي (المادة 84):**

1. **الأساس النظامي:**
   - أجر نصف شهر عن كل سنة من السنوات الخمس الأولى.
   - أجر شهر كامل عن كل سنة تالية.
   - يعتمد الاحتساب على الأجر الأخير (الراتب الفعلي شاملاً البدلات كالسكن والنقل).

2. **في حال استقالة الموظف (المادة 85):**
   - أقل من سنتين: لا يستحق مكافأة.
   - من سنتين إلى 5 سنوات: يستحق ثلث المكافأة (1/3).
   - من 5 إلى 10 سنوات: يستحق ثلثي المكافأة (2/3).
   - أكثر من 10 سنوات: يستحق المكافأة كاملة.`;
  }

  if (msg.includes('ساعات العمل الإضافي') || msg.includes('إضافي')) {
    return `⏱ **ضوابط ساعات العمل الإضافي (المادة 107):**
- يستحق الموظف أجر الساعة الأساسية مضافاً إليه 50% من أجره الأساسي عن كل ساعة إضافية.
- ساعات العطل والأعياد تحسب إضافية بنسبة كاملة.`;
  }

  return `📋 **إرشادات الاستشارة الإدارية بنظام موارد HR:**
- توثيق العقود عبر منصة "قوى" وإيداع مسيرات الأجور عبر حماية الأجور (WPS).
- جدولة تقييمات الأداء ربع السنوية لضمان تطابق الأهداف مع خطة المنشأة.`;
};

const fallbackPerformanceSummary = (name: string, title: string, dept: string, scores: any) => {
  const avg = Math.round(
    ((scores?.productivity || 80) +
      (scores?.quality || 80) +
      (scores?.punctuality || 80) +
      (scores?.teamwork || 80) +
      (scores?.innovation || 80)) / 5
  );

  return `📊 **تقرير التحليل التقييمي الشامل للأداء الوظيفي**
**الموظف:** ${name} | **المسمى الوظيفي:** ${title} (${dept})
**المعدل التراكمي:** ${avg}% (${avg >= 90 ? 'أداء استثنائي A+' : 'أداء متميز B+'})

**1. الملخص التنفيذي:**
أظهر الموظف كفاءة ومهنية ملحوظة والتزاماً عالياً بإنجاز المهام الموكلة بأعلى معايير الجودة.

**2. أبرز نقاط القوة:**
- الإنتاجية وسرعة الإنجاز بنسبة ${scores?.productivity || 85}%.
- دقة المخرجات والالتزام بالمواعيد المحددة (${scores?.quality || 85}%).

**3. التوصيات والأهداف (OKRs):**
- قيادة مبادرات تطويرية في القسم خلال الربع القادم.
- استمرار التميز والمشاركة الفعالة في مشاريع الفريق.`;
};

const fallbackDraftLetter = (type: string, name: string, title: string, details: string) => {
  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  const refNo = `HR-LTR-${Math.floor(100000 + Math.random() * 900000)}`;

  return `المملكة العربية السعودية
شركة التقنية المتقدمة المحدودة
إدارة الموارد البشرية

التاريخ: ${today}
الرقم المرجعي: ${refNo}

الموضوع: ${type}

تشهد شركة التقنية المتقدمة المحدودة بأن الموظف:
الاسم: ${name}
المسمى الوظيفي: ${title}
يعمل لدينا على رأس العمل بموجب عقد عمل ساري المفعول.
التفاصيل الإضافية: ${details || 'تم إصدار هذا الخطاب بناءً على طلب الموظف لتقديمه لمن يهمه الأمر دون أدنى مسؤولية مالية على الشركة.'}

وتقبلوا وافر التحية والتقدير،،،

إدارة الموارد البشرية
شركة التقنية المتقدمة المحدودة
الرياض - المملكة العربية السعودية
(الختم الإلكتروني المعتمد)`;
};

// API: Advisor
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { message, context } = req.body;
    const ai = getAiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message || 'مرحبا، كيف يمكن لنظام الموارد البشرية مساعدتي اليوم؟',
          config: {
            systemInstruction: `أنت مستشار وخبير موارد بشرية معتمد ومستشار قانوني للعمل والشؤون الإدارية في نظام "موارد HR". 
تساعد المديرين والموظفين في شرح نظام العمل والرواتب والإجازات ورفع الإنتاجية. أجب باللغة العربية الفصحى الراقية والمنسقة.`,
          },
        });
        return res.json({ text: response.text });
      } catch (e) {
        console.warn('Gemini call failed in server, using fallback');
      }
    }
    res.json({ text: fallbackAdvisor(message || '') });
  } catch (err: any) {
    console.error('Advisor Error:', err);
    res.json({ text: fallbackAdvisor(req.body.message || '') });
  }
});

// API: Performance Summary
app.post('/api/gemini/performance-summary', async (req, res) => {
  try {
    const { employeeName, jobTitle, department, scores, notes } = req.body;
    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `حلل درجات تقييم الأداء للموظف: ${employeeName}، المسمى: ${jobTitle}، القسم: ${department}، الدرجات: ${JSON.stringify(scores)}. اكتب تقريراً تحفيزياً باللغة العربية يشمل نقاط القوة وفرص التطوير وأهداف OKRs.`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        return res.json({ summary: response.text });
      } catch (e) {
        console.warn('Gemini call failed in server, using fallback');
      }
    }
    res.json({ summary: fallbackPerformanceSummary(employeeName, jobTitle, department, scores) });
  } catch (err: any) {
    console.error('Performance Summary Error:', err);
    res.json({ summary: fallbackPerformanceSummary(req.body.employeeName, req.body.jobTitle, req.body.department, req.body.scores) });
  }
});

// API: Draft Letter
app.post('/api/gemini/draft-letter', async (req, res) => {
  try {
    const { letterType, employeeName, jobTitle, details } = req.body;
    const ai = getAiClient();
    if (ai) {
      try {
        const prompt = `قم بصياغة خطاب رسمي معتمد للنوع: "${letterType}" للموظف: ${employeeName}، المسمى: ${jobTitle}. التفاصيل: ${details || 'قياسي'}.`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        return res.json({ letterText: response.text });
      } catch (e) {
        console.warn('Gemini call failed in server, using fallback');
      }
    }
    res.json({ letterText: fallbackDraftLetter(letterType || 'تعريف بالراتب', employeeName || 'الموظف', jobTitle || 'موظف', details || '') });
  } catch (err: any) {
    console.error('Draft Letter Error:', err);
    res.json({ letterText: fallbackDraftLetter(req.body.letterType, req.body.employeeName, req.body.jobTitle, req.body.details) });
  }
});

// Static files in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
