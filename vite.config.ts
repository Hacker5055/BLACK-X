import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiServerPlugin(): Plugin {
  return {
    name: 'gemini-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gemini')) {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = body ? JSON.parse(body) : {};
            let apiKey = process.env.GEMINI_API_KEY;

            const fallbackAdvisor = (msg: string) => {
              const lower = msg.toLowerCase();
              if (msg.includes('مكافأة نهاية الخدمة') || msg.includes('نهاية الخدمة') || msg.includes('مكافاه')) {
                return `📌 **طريقة احتساب مكافأة نهاية الخدمة والتعويض وفقاً لقانون العمل المصري رقم 12 لسنة 2003:**

1. **الأساس القانوني لمكافأة التقاعد (المادة 126):**
   - يستحق العامل مكافأة عن مدة عمله بعد سن الستين بواقع:
     * أجر نصف شهر عن كل سنة من السنوات الخمس الأولى.
     * أجر شهر كامل عن كل سنة من السنوات التالية.
   - يعتمد الاحتساب على الأجر الأخير الشامل الثابت إذا لم تكن للعامل حقوق عن هذه المدة وفقاً لقانون التأمينات والمعاشات.

2. **التعويض عن إنهاء العقد غير المبرر / الفصل التعسفي (المادة 122):**
   - إذا أنهى أحد الطرفين العقد دون مبرر مشروع وكافٍ، التزم بأن يعوض الطرف الآخر عما أصابه من ضرر.
   - لا يجوز أن يقل التعويض الذي تحكم به المحكمة العمالية للعامل عن **أجر شهرين عن كل سنة من سنوات الخدمة**.

3. **حالات الاستقالة والمهلة القانونية (المادة 111 و 118):**
   - يلتزم العامل بإخطار صاحب العمل كتابة بطلب الاستقالة قبل الإنهاء بشهرين إذا كانت مدة خدمته متصلة تجاوزت 10 سنوات، وشهر واحد إذا كانت أقل.`;
              }

              if (msg.includes('ساعات العمل الإضافي') || msg.includes('إضافي') || msg.includes('أوفر تايم') || msg.includes('overtime')) {
                return `⏱ **ضوابط ساعات العمل الإضافي (Overtime) وفق المادتين (80) و (85) من قانون العمل المصري:**

1. **الحد الأقصى لساعات العمل العادية:**
   - 8 ساعات يومياً أو 48 ساعة أسبوعياً كحد أقصى (لا تشمل فترات الراحة وتناول الطعام).

2. **احتساب أجر الساعة الإضافية:**
   - **ساعات العمل النهارية:** أجر ساعة العمل مضافاً إليه (35%) من الأجر الأساسي.
   - **ساعات العمل الليلية:** أجر ساعة العمل مضافاً إليه (70%) من الأجر الأساسي (من غروب الشمس إلى شروقها).
   - **أيام الراحات الأسبوعية والعطلات والأعياد الرسمية:** يستحق العامل **مثلي الأجر (200%)** أو يوماً بديلاً للراحة خلال الأسبوع التالي.`;
              }

              if (msg.includes('تأمين') || msg.includes('تأمينات') || msg.includes('148')) {
                return `🏛 **نسب اشتراكات التأمينات الاجتماعية وفق قانون رقم 148 لسنة 2019 في مصر:**

1. **حصة المؤمن عليه (العامل):**
   - **11%** من أجر الاشتراك التأميني الشامل تستقطع شهرياً من راتب الموظف.

2. **حصة المنشأة (صاحب العمل):**
   - **18.75%** من أجر الاشتراك التأميني الشامل تتحملها الشركة وتورد للتأمينات.

3. **إجمالي الاشتراك الشهري المورد للهيئة القومية للتأمين الاجتماعي:**
   - **29.75%** من أجر الاشتراك التأميني الشامل.

4. **الاستمارات الإلزامية:**
   - استمارة س1 (إخطار التحاق عامل جديد خلال شهر).
   - استمارة س2 (إقرار سنوي بالأجور في يناير).
   - استمارة س6 (إخطار انتهاء خدمة مؤمن عليه وتسوية مستحقاته).`;
              }

              if (msg.includes('إنتاجية') || msg.includes('الغياب') || msg.includes('الالتزام')) {
                return `💡 **توصيات إدارية لرفع الإنتاجية والحد من الغياب وفقاً لبيئة العمل المصرية:**

1. **التحفيز وربط الحوافز بالأداء:**
   - تطبيق حافز انتظام شهري للموظفين الأكثر التزاماً بمواعيد العمل.
   - ربط مؤشرات الأداء (KPIs) بمكافآت ربع سنوية واضحة ومحددة سلفاً.

2. **مرونة ساعات العمل الذكية:**
   - اعتماد نافذة حضور مرنة (بين 08:00 ص و 08:45 ص) مع اشتراط استكمال 8 ساعات عمل يومية.
   - تفعيل العمل عن بعد للمهام التحليلية وتطوير البرمجيات عند الحاجة.

3. **بيئة العمل وثقافة التقدير:**
   - الاستماع لملاحظات فرق العمل وإتاحة قنوات تواصل مفتوحة عبر Google Chat الداخلي.`;
              }

              return `📋 **إرشادات الاستشارة الإدارية بنظام موارد HR (جمهورية مصر العربية):**

- يلتزم النظام بأحكام قانون العمل المصري رقم 12 لسنة 2003 وقانون التأمينات الاجتماعية والمعاشات رقم 148 لسنة 2019.
- الحد الأدنى للأجور بالقطاع الخاص 6,000 جنيه مصري شهرياً وفقاً لقرارات المجلس القومي للأجور.
- يمكنك الاستفادة من ميزة صياغة الخطابات الرسمية أو توليد القيود المحاسبية وترحيلها لبرامج الحسابات (دفترة / قيود) بنقرة زر.`;
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
**المعدل التراكمي العام:** ${avg}% (${avg >= 90 ? 'أداء استثنائي يتجاوز التوقعات A+' : 'أداء متميز وجيد جداً B+'})

**1. الملخص التنفيذي:**
أظهر الموظف كفاءة ومهنية ملحوظة خلال هذه الدورة التقييمية، مع التزام عالي بتحقيق الأهداف المحددة وتسليم المهام الموكلة بجودة ودقة عالية في المواعيد المقررة ووفقاً للوائح العمل المنظمة.

**2. أبرز نقاط القوة والكفاءات:**
- التفوق والإنتاجية العالية بمعدل ${scores?.productivity || 85}% وسرعة معالجة المهام التشغيلية.
- الدقة والاهتمام بالتفاصيل بنسبة ${scores?.quality || 85}% والالتزام التام بالجودة.
- التعاون الإيجابي والتواصل الفعال مع أعضاء الفريق بروح الفريق الواحد (${scores?.teamwork || 85}%).

**3. فرص التحسين والتطوير المستهدفة:**
- تشجيع الموظف على تبني مزيد من الحلول الابتكارية واستخدام أدوات ذكاء اصطناعي حديثة لتسريع وتيرة العمل.
- إتاحة الفرصة للموظف لقيادة مشاريع مصغرة لبناء مهارات التوجيه والإشراف.

**4. الأهداف والتوصيات المقترحة للربع القادم (OKRs):**
- **الهدف 1:** تحقيق نسبة إنجاز للمشاريع الحرجة لا تقل عن 95% وفق الجدول الزمني.
- **الهدف 2:** تقديم ورشة عمل داخلية لمشاركة المعرفة مع الزملاء الجدد في القسم.`;
            };

            const fallbackDraftLetter = (type: string, name: string, title: string, details: string) => {
              const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
              const refNo = `HR-EG-LTR-${Math.floor(100000 + Math.random() * 900000)}`;

              if (type.includes('إنذار') || type.includes('تنبيه')) {
                return `جمهورية مصر العربية
شركة التقنية المتقدمة ش.م.م
إدارة الموارد البشرية والشؤون الإدارية

التاريخ: ${today}
الرقم المرجعي: ${refNo}

الموضوع: خطاب إنذار إداري ولفت نظر

إلى السيد / ${name}
المسمى الوظيفي: ${title}

تحية طيبة وبعد،،،

إشارة إلى سجلات الحضور والتقارير الإدارية الخاصة بالعمل، وحرصاً من إدارة الشركة على انتظام سير العمل والالتزام بلائحة تنظيم العمل والجزاءات المعتمدة من مديرية العمل المختصة؛
نلفت عنايتكم إلى ضرورة الالتزام التام بالتعليمات والواجبات الوظيفية وتلافي الملاحظات المدونة (${details || 'عدم الالتزام بمواعيد الحضور أو إنجاز المهام'}).

نأمل منكم مضاعفة الحرص والالتزام مستقبلاً لتفادي اتخاذ أي إجراءات نظامية لاحقة وفق المادة (66) وما بعدها من قانون العمل المصري رقم 12 لسنة 2003.

وتفضلوا بقبول فائق الاحترام والتقدير،،،

إدارة الموارد البشرية
شركة التقنية المتقدمة ش.م.م
القاهرة - جمهورية مصر العربية
(ختم وتوقيع الإدارة المعتمد)`;
              }

              if (type.includes('ترقية') || type.includes('مكافأة') || type.includes('زيادة')) {
                return `جمهورية مصر العربية
شركة التقنية المتقدمة ش.م.م
إدارة الموارد البشرية

التاريخ: ${today}
الرقم المرجعي: ${refNo}

الموضوع: قرار ترقية وتعديل حزمة الأجر الوظيفي

إلى الزميل العزيز: ${name}
المسمى الوظيفي: ${title}

تحية طيبة وبعد،،،

بناءً على التميز والأداء الاستثنائي الذي أظهرتموه وتفانيكم المستمر في إنجاح أعمال الشركة وتحقيق أهدافها؛ يسر الإدارة التنفيذية إحاطتكم علماً بصدور قرار ترقيتكم وتعديل حزمة المزايا المالية تقديراً لجهودكم المخلصة.

نبارك لكم هذه الترقية المستحقة، ونسأل الله لكم دوام التوفيق والنجاح.

وتفضلوا بقبول فائق الاحترام والتقدير،،،

الرئيس التنفيذي / مدير عام الموارد البشرية
شركة التقنية المتقدمة ش.م.م`;
              }

              if (type.includes('خبرة') || type.includes('إخلاء')) {
                return `جمهورية مصر العربية
شركة التقنية المتقدمة ش.م.م
إدارة الموارد البشرية

التاريخ: ${today}
الرقم المرجعي: ${refNo}

الموضوع: شهادة خبرة وإخلاء طرف

تشهد شركة التقنية المتقدمة ش.م.م بأن السيد / ${name}
قد عمل لدينا بوظيفة: (${title})
خلال فترة خدمته بالشركة، وكان مثالاً للموظف المخلص والمجتهد في أداء مسؤولياته وحسن السير والسلوك. وقد تم إخلاء طرفه من كافة العهد والمستحقات التأمينية والمالية واستلام استمارة (6) تأمينات.

وقد أُعطيت له هذه الشهادة بناءً على طلبه دون أدنى مسؤولية على الشركة تجاه حقوق الغير.

مع تمنياتنا له بالتوفيق والنجاح في مسيرته المهنية.

مدير الموارد البشرية
شركة التقنية المتقدمة ش.م.م
(الختم الرسمي)`;
              }

              // Default: Salary Certificate (شهادة مفردات مرتب)
              return `جمهورية مصر العربية
شركة التقنية المتقدمة ش.م.م
إدارة الموارد البشرية

التاريخ: ${today}
الرقم المرجعي: ${refNo}

الموضوع: شهادة مفردات مرتب وإثبات دخل

إلى من يهمه الأمر (البنوك والهيئات الرسمية)،،،

تشهد شركة التقنية المتقدمة ش.م.م بأن السيد / ${name}
يعمل لدينا بوظيفة: (${title}) بموجب عقد عمل ساري ومؤمن عليه بالهيئة القومية للتأمين الاجتماعي.
التفاصيل وبيان الأجر: ${details || 'المرتب محول على الحساب البنكي بانتظام شهرياً.'}

وقد صدرت هذه الشهادة بناءً على طلب الموظف لتقديمها لمن يهمه الأمر دون أدنى مسؤولية مالية على الشركة تجاه تعاملاته الشخصية.

وتفضلوا بقبول فائق الاحترام والتقدير،،،

إدارة الموارد البشرية
شركة التقنية المتقدمة ش.م.م
القاهرة - جمهورية مصر العربية
(الختم الرسمي المعتمد)`;
            };

            if (req.url === '/api/gemini/advisor') {
              const { message, context } = data;
              if (apiKey) {
                try {
                  const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
                  });
                  const response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: message || 'مرحبا، كيف يمكن لنظام الموارد البشرية مساعدتي اليوم؟',
                    config: {
                      systemInstruction: `أنت مستشار وخبير موارد بشرية معتمد ومستشار قانوني للعمل والشؤون الإدارية في نظام "موارد HR" المتوافق مع قانون العمل المصري رقم 12 لسنة 2003 وتعديلاته وقانون التأمينات الاجتماعية والمعاشات رقم 148 لسنة 2019. 
تساعد المديرين والموظفين في شرح قوانين العمل المصرية (الحد الأدنى للأجور 6000 جنيه، مكافأة نهاية الخدمة، ساعات العمل والإضافي، الإجازات الاعتيادية والعارضة والمرضية، استمارات س1 وس2 وس6). أجب باللغة العربية الفصحى الراقية والمنسقة.`,
                    },
                  });
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ text: response.text }));
                  return;
                } catch (e) {
                  console.warn('Gemini call failed, using expert fallback:', e);
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: fallbackAdvisor(message || '') }));
              return;
            }

            if (req.url === '/api/gemini/performance-summary') {
              const { employeeName, jobTitle, department, scores, notes } = data;
              if (apiKey) {
                try {
                  const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
                  });
                  const prompt = `حلل درجات تقييم الأداء للموظف: ${employeeName}، المسمى: ${jobTitle}، القسم: ${department}، الدرجات: ${JSON.stringify(scores)}. اكتب تقريراً تحفيزياً باللغة العربية يشمل نقاط القوة وفرص التطوير وأهداف OKRs.`;
                  const response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                  });
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ summary: response.text }));
                  return;
                } catch (e) {
                  console.warn('Gemini call failed, using expert fallback:', e);
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ summary: fallbackPerformanceSummary(employeeName, jobTitle, department, scores) }));
              return;
            }

            if (req.url === '/api/gemini/draft-letter') {
              const { letterType, employeeName, jobTitle, details } = data;
              if (apiKey) {
                try {
                  const ai = new GoogleGenAI({
                    apiKey,
                    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
                  });
                  const prompt = `قم بصياغة خطاب رسمي معتمد في جمهورية مصر العربية للنوع: "${letterType}" للموظف: ${employeeName}، المسمى: ${jobTitle}. التفاصيل: ${details || 'قياسي'}.`;
                  const response = await ai.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                  });
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ letterText: response.text }));
                  return;
                } catch (e) {
                  console.warn('Gemini call failed, using expert fallback:', e);
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ letterText: fallbackDraftLetter(letterType || 'تعريف بالراتب', employeeName || 'الموظف', jobTitle || 'موظف', details || '') }));
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
          } catch (err: any) {
            console.error('Gemini API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Server error calling Gemini' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), geminiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
