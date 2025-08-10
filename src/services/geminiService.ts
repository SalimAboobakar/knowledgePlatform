export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ResearchTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

class GeminiService {
  private apiKey: string;
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("Gemini API key not found in environment variables");
    } else {
      console.log("Gemini API key loaded successfully");
    }
  }

  // إرسال رسالة إلى Gemini والحصول على رد
  async sendMessage(message: string, context?: string): Promise<string> {
    // إذا لم يكن هناك مفتاح API، استخدم الردود الافتراضية
    if (!this.apiKey) {
      console.log("Gemini API key not available, using default responses");
      return this.getDefaultResponse(message);
    }

    try {
      const systemPrompt = `أنت مرشد أكاديمي ذكي متخصص في مساعدة الطلاب في:
- اختيار مواضيع البحوث والرسائل العلمية
- تطوير أفكار المشاريع
- توجيه الطلاب في مجالات الدراسة المختلفة
- تقديم نصائح حول منهجية البحث
- مساعدة في كتابة المقترحات البحثية

يجب أن تكون إجاباتك:
- مفيدة وعملية
- باللغة العربية
- مناسبة لمستوى الطالب
- تشجع على التفكير النقدي
- تقدم خطوات واضحة وقابلة للتطبيق

${context ? `السياق الإضافي: ${context}` : ""}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nرسالة الطالب: ${message}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
        console.warn(errorMessage);
        
        // إذا كان الخطأ 404، قد يكون المفتاح غير صحيح أو النموذج غير متاح
        if (response.status === 404) {
          console.warn("Gemini API model not found or API key invalid. Using default responses.");
        }
        
        return this.getDefaultResponse(message);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.warn("Gemini API returned empty response, using default response");
        return this.getDefaultResponse(message);
      }
    } catch (error) {
      console.warn("Error calling Gemini API, using default responses:", error);
      return this.getDefaultResponse(message);
    }
  }

  // الردود الافتراضية للمرشد الذكي
  private getDefaultResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("كيف أطور فكرة مشروعي") ||
      lowerMessage.includes("تطوير فكرة")
    ) {
      return `تطوير فكرة المشروع يتطلب عدة خطوات:

1. **تحديد المشكلة**: ابحث عن مشكلة حقيقية في مجالك
2. **جمع المعلومات**: اقرأ الأبحاث السابقة والمراجع
3. **العصف الذهني**: اكتب جميع الأفكار الممكنة
4. **التقييم**: اختر أفضل فكرة بناءً على:
   - الأهمية العلمية
   - الجدوى التقنية
   - توفر الموارد
   - اهتمامك الشخصي

5. **التطوير**: طور الفكرة إلى مشروع محدد

هل تريد مساعدة في أي من هذه الخطوات؟`;
    }

    if (lowerMessage.includes("منهجية") || lowerMessage.includes("منهجيات")) {
      return `المنهجيات البحثية الرئيسية:

**المنهجية الكمية**:
- المسوحات والاستبيانات
- التجارب المعملية
- التحليل الإحصائي

**المنهجية النوعية**:
- المقابلات
- الملاحظة
- تحليل المحتوى

**المنهجية المختلطة**:
- الجمع بين الكمي والنوعي

اختيار المنهجية يعتمد على:
- نوع البحث
- طبيعة البيانات
- الأهداف البحثية

ما نوع البحث الذي تخطط له؟`;
    }

    if (lowerMessage.includes("مراجع") || lowerMessage.includes("مصادر")) {
      return `لإيجاد المراجع المناسبة:

**قواعد البيانات العلمية**:
- Google Scholar
- IEEE Xplore
- ScienceDirect
- Scopus
- Web of Science

**خطوات البحث**:
1. حدد الكلمات المفتاحية
2. استخدم معاملات البحث المتقدمة
3. راجع الملخصات أولاً
4. تحقق من تاريخ النشر
5. اقرأ المراجع المذكورة

**معايير اختيار المراجع**:
- صلة بالموضوع
- حداثة المعلومات
- مصداقية المصدر
- جودة البحث

هل تريد مساعدة في البحث عن مراجع لمجال معين؟`;
    }

    if (lowerMessage.includes("مقترح") || lowerMessage.includes("proposal")) {
      return `خطوات كتابة المقترح البحثي:

**1. العنوان**
- واضح ومحدد
- يعكس محتوى البحث

**2. المقدمة**
- خلفية الموضوع
- المشكلة البحثية
- أهمية البحث

**3. الأهداف**
- الهدف الرئيسي
- الأهداف الفرعية
- أسئلة البحث

**4. المنهجية**
- نوع البحث
- أدوات جمع البيانات
- طرق التحليل

**5. الجدول الزمني**
- مراحل البحث
- المدة المتوقعة

**6. المراجع**
- قائمة المراجع الأساسية

هل تريد مساعدة في كتابة قسم معين؟`;
    }

    if (lowerMessage.includes("موضوع") || lowerMessage.includes("topics")) {
      return `لاختيار موضوع البحث المناسب:

**معايير اختيار الموضوع**:
1. **الأهمية العلمية**: يساهم في المعرفة
2. **الجدوى**: قابل للتنفيذ
3. **الحداثة**: موضوع جديد أو تطويري
4. **الاهتمام**: يثير اهتمامك الشخصي
5. **توفر البيانات**: إمكانية جمع المعلومات

**مجالات البحث الحالية**:
- الذكاء الاصطناعي وتطبيقاته
- تحليل البيانات الضخمة
- الأمن السيبراني
- تطوير البرمجيات
- الشبكات والاتصالات

**نصائح**:
- اقرأ الأبحاث الحديثة
- تحدث مع المشرفين
- ابحث عن الفجوات المعرفية
- فكر في التطبيقات العملية

هل تريد مساعدة في تحديد مجال معين؟`;
    }

    // رد عام
    return `شكراً لك على سؤالك! 

أنا مرشدك الأكاديمي الذكي، ويمكنني مساعدتك في:
- اختيار مواضيع البحوث
- تطوير أفكار المشاريع
- نصائح منهجية
- كتابة المقترحات البحثية
- إيجاد المراجع

يمكنك أن تسألني عن أي من هذه المواضيع، أو أي سؤال آخر يتعلق بدراستك الأكاديمية.

هل تريد مساعدة في مجال معين؟`;
  }

  // اقتراح مواضيع بحثية
  async suggestResearchTopics(
    field: string,
    level: string
  ): Promise<ResearchTopic[]> {
    try {
      // إذا لم يكن هناك مفتاح API، استخدم الردود الافتراضية
      if (!this.apiKey) {
        return this.getDefaultTopics(field, level);
      }

      const prompt = `اقترح 5 مواضيع بحثية في مجال "${field}" للمستوى "${level}". 
      أعد الإجابة بتنسيق JSON يحتوي على:
      - title: عنوان الموضوع
      - description: وصف مختصر
      - category: التصنيف
      - difficulty: مستوى الصعوبة (beginner/intermediate/advanced)
      - tags: كلمات مفتاحية`;

      const response = await this.sendMessage(prompt);

      // محاولة استخراج JSON من الإجابة
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // إذا فشل في استخراج JSON، إنشاء اقتراحات افتراضية
        return this.getDefaultTopics(field, level);
      }
    } catch (error) {
      console.warn("Error suggesting research topics, using defaults:", error);
      return this.getDefaultTopics(field, level);
    }
  }

  // اقتراحات افتراضية
  private getDefaultTopics(field: string, level: string): ResearchTopic[] {
    const topics: ResearchTopic[] = [
      {
        id: "1",
        title: `تطوير نظام ذكي في مجال ${field}`,
        description: `تصميم وتطوير نظام يستخدم تقنيات الذكاء الاصطناعي لحل مشاكل في ${field}`,
        category: field,
        difficulty: level as any,
        tags: ["ذكاء اصطناعي", "تطوير", field],
      },
      {
        id: "2",
        title: `تحليل البيانات في ${field}`,
        description: `استخدام تقنيات تحليل البيانات لدراسة الظواهر في ${field}`,
        category: field,
        difficulty: level as any,
        tags: ["تحليل البيانات", "إحصائيات", field],
      },
      {
        id: "3",
        title: `تحسين الأداء في ${field}`,
        description: `دراسة وتحسين كفاءة الأنظمة والعمليات في ${field}`,
        category: field,
        difficulty: level as any,
        tags: ["تحسين", "كفاءة", field],
      },
      {
        id: "4",
        title: `تطبيق تقنيات حديثة في ${field}`,
        description: `استكشاف وتطبيق أحدث التقنيات والمنهجيات في مجال ${field}`,
        category: field,
        difficulty: level as any,
        tags: ["تقنيات حديثة", "ابتكار", field],
      },
      {
        id: "5",
        title: `دراسة مقارنة في ${field}`,
        description: `إجراء دراسة مقارنة بين مختلف الطرق والتقنيات المستخدمة في ${field}`,
        category: field,
        difficulty: level as any,
        tags: ["دراسة مقارنة", "تحليل", field],
      },
    ];
    return topics;
  }

  // مساعدة في كتابة المقترح البحثي
  async helpWithProposal(topic: string, field: string): Promise<string> {
    // إذا لم يكن هناك مفتاح API، استخدم الرد الافتراضي
    if (!this.apiKey) {
      return this.getDefaultProposalHelp(topic, field);
    }

    const prompt = `ساعدني في كتابة مقترح بحثي لموضوع: "${topic}" في مجال "${field}".
    قدم لي:
    1. مقدمة للموضوع
    2. المشكلة البحثية
    3. الأهداف
    4. المنهجية المقترحة
    5. المراجع الأساسية`;

    try {
      return await this.sendMessage(prompt);
    } catch (error) {
      console.warn("Error getting proposal help, using default:", error);
      return this.getDefaultProposalHelp(topic, field);
    }
  }

  // مساعدة افتراضية في كتابة المقترح
  private getDefaultProposalHelp(topic: string, field: string): string {
    return `مقترح بحثي لموضوع: "${topic}" في مجال "${field}"

**1. المقدمة**
هذا البحث يهدف إلى دراسة ${topic} في مجال ${field}، حيث يشكل هذا الموضوع أهمية كبيرة في التطور العلمي والتقني الحالي.

**2. المشكلة البحثية**
- تحديد المشاكل والتحديات في ${field}
- الحاجة إلى حلول مبتكرة لـ ${topic}
- الفجوات المعرفية الموجودة

**3. الأهداف**
- الهدف الرئيسي: تطوير حلول لـ ${topic}
- الأهداف الفرعية:
  * دراسة الوضع الحالي
  * تحديد المتطلبات
  * تطوير الحلول المقترحة
  * تقييم النتائج

**4. المنهجية المقترحة**
- نوع البحث: تطبيقي/نظري
- أدوات جمع البيانات: استبيانات، مقابلات، تجارب
- طرق التحليل: إحصائي، تحليلي

**5. المراجع الأساسية**
- مراجع حديثة في ${field}
- أبحاث سابقة في ${topic}
- مصادر موثوقة ومعترف بها

هل تريد تفاصيل أكثر عن أي قسم؟`;
  }

  // نصائح منهجية
  async getMethodologyTips(researchType: string): Promise<string> {
    // إذا لم يكن هناك مفتاح API، استخدم الرد الافتراضي
    if (!this.apiKey) {
      return this.getDefaultMethodologyTips(researchType);
    }

    const prompt = `قدم لي نصائح منهجية للبحث من نوع "${researchType}".
    شمل:
    - خطوات البحث
    - أدوات جمع البيانات
    - طرق التحليل
    - معايير الجودة`;

    try {
      return await this.sendMessage(prompt);
    } catch (error) {
      console.warn("Error getting methodology tips, using default:", error);
      return this.getDefaultMethodologyTips(researchType);
    }
  }

  // نصائح منهجية افتراضية
  private getDefaultMethodologyTips(researchType: string): string {
    const tips = {
      كمي: `المنهجية الكمية للبحث:

**خطوات البحث:**
1. تحديد المشكلة والأهداف
2. صياغة الفرضيات
3. تصميم الدراسة
4. جمع البيانات
5. تحليل البيانات
6. تفسير النتائج

**أدوات جمع البيانات:**
- الاستبيانات المغلقة
- المقاييس المعيارية
- التجارب المعملية
- الملاحظة المنظمة

**طرق التحليل:**
- الإحصائيات الوصفية
- الإحصائيات الاستنتاجية
- اختبارات الفرضيات
- تحليل الارتباط والانحدار

**معايير الجودة:**
- الصدق والثبات
- تمثيل العينة
- دقة القياسات
- شفافية الإجراءات`,

      نوعي: `المنهجية النوعية للبحث:

**خطوات البحث:**
1. تحديد المشكلة
2. اختيار المشاركين
3. جمع البيانات
4. تحليل البيانات
5. كتابة التقرير

**أدوات جمع البيانات:**
- المقابلات العميقة
- الملاحظة المشاركة
- تحليل الوثائق
- مجموعات التركيز

**طرق التحليل:**
- التحليل الموضوعي
- التحليل السردي
- التحليل المقارن
- التحليل التأويلي

**معايير الجودة:**
- المصداقية
- القابلية للتحويل
- الاعتمادية
- التأكيدية`,

      مختلط: `المنهجية المختلطة للبحث:

**خطوات البحث:**
1. تحديد المشكلة
2. تصميم الدراسة المختلطة
3. جمع البيانات الكمية والنوعية
4. تحليل البيانات
5. دمج النتائج
6. تفسير شامل

**أدوات جمع البيانات:**
- الاستبيانات + المقابلات
- التجارب + الملاحظة
- التحليل الإحصائي + التحليل النصي

**طرق التحليل:**
- التحليل المتوازي
- التحليل المتسلسل
- التحليل التحويلي
- التحليل التكاملي

**معايير الجودة:**
- صحة النتائج الكمية والنوعية
- تكامل النتائج
- شمولية الفهم
- قوة الاستنتاجات`,
    };

    return tips[researchType as keyof typeof tips] || tips["كمي"];
  }
}

export const geminiService = new GeminiService();
