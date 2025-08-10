import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { ChatbotInteraction } from "./types";

const db = getFirestore();

// إرسال استفسار للـ chatbot
export const sendChatbotQuery = onCall<{
  query: string;
  context?: string;
  language: "ar" | "en";
}>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من وجود المستخدم
    const user = await db.collection("users").doc(auth.uid).get();
    if (!user.exists) {
      throw new HttpsError("permission-denied", "المستخدم غير موجود");
    }

    // هنا يمكن إضافة منطق الذكاء الاصطناعي للرد على الاستفسار
    // حالياً سنستخدم رد بسيط للتوضيح
    let response = "";

    if (data.language === "ar") {
      response = generateArabicResponse(data.query, data.context);
    } else {
      response = generateEnglishResponse(data.query, data.context);
    }

    // حفظ التفاعل في قاعدة البيانات
    const interactionData: Omit<ChatbotInteraction, "id"> = {
      userId: auth.uid,
      query: data.query,
      response: response,
      context: data.context,
      language: data.language,
      createdAt: new Date(),
    };

    const interactionRef = await db.collection("chatbot").add(interactionData);

    return {
      success: true,
      data: {
        id: interactionRef.id,
        ...interactionData,
      },
      message: "تم إرسال الاستفسار بنجاح",
    };
  } catch (error) {
    console.error("Error sending chatbot query:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء إرسال الاستفسار");
  }
});

// تقييم رد الـ chatbot
export const rateChatbotResponse = onCall<{
  interactionId: string;
  rating: number;
  feedback?: string;
}>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من وجود التفاعل
    const interaction = await db
      .collection("chatbot")
      .doc(data.interactionId)
      .get();
    if (!interaction.exists) {
      throw new HttpsError("not-found", "التفاعل غير موجود");
    }

    const interactionData = interaction.data() as ChatbotInteraction;
    if (interactionData.userId !== auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "ليس لديك صلاحية لتقييم هذا التفاعل"
      );
    }

    // التحقق من صحة التقييم
    if (data.rating < 1 || data.rating > 5) {
      throw new HttpsError("invalid-argument", "التقييم يجب أن يكون بين 1 و 5");
    }

    // تحديث التفاعل بالتقييم
    await db.collection("chatbot").doc(data.interactionId).update({
      rating: data.rating,
      feedback: data.feedback,
    });

    return {
      success: true,
      message: "تم تقييم الرد بنجاح",
    };
  } catch (error) {
    console.error("Error rating chatbot response:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء تقييم الرد");
  }
});

// الحصول على تاريخ التفاعلات
export const getChatbotHistory = onCall<{
  limit?: number;
  language?: "ar" | "en";
}>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من وجود المستخدم
    const user = await db.collection("users").doc(auth.uid).get();
    if (!user.exists) {
      throw new HttpsError("permission-denied", "المستخدم غير موجود");
    }

    // بناء الاستعلام
    let query = db
      .collection("chatbot")
      .where("userId", "==", auth.uid)
      .orderBy("createdAt", "desc");

    if (data.language) {
      query = query.where("language", "==", data.language);
    }

    if (data.limit) {
      query = query.limit(data.limit);
    } else {
      query = query.limit(50); // افتراضي
    }

    const snapshot = await query.get();
    const interactions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: interactions,
      message: "تم جلب تاريخ التفاعلات بنجاح",
    };
  } catch (error) {
    console.error("Error getting chatbot history:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء جلب تاريخ التفاعلات");
  }
});

// حذف تفاعل
export const deleteChatbotInteraction = onCall<{ interactionId: string }>(
  async (request: any) => {
    try {
      const { data, auth } = request;

      if (!auth) {
        throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
      }

      // التحقق من وجود التفاعل
      const interaction = await db
        .collection("chatbot")
        .doc(data.interactionId)
        .get();
      if (!interaction.exists) {
        throw new HttpsError("not-found", "التفاعل غير موجود");
      }

      const interactionData = interaction.data() as ChatbotInteraction;
      if (interactionData.userId !== auth.uid) {
        throw new HttpsError(
          "permission-denied",
          "ليس لديك صلاحية لحذف هذا التفاعل"
        );
      }

      // حذف التفاعل
      await db.collection("chatbot").doc(data.interactionId).delete();

      return {
        success: true,
        message: "تم حذف التفاعل بنجاح",
      };
    } catch (error) {
      console.error("Error deleting chatbot interaction:", error);
      throw new HttpsError("internal", "حدث خطأ أثناء حذف التفاعل");
    }
  }
);

// وظائف مساعدة لتوليد الردود
function generateArabicResponse(query: string, context?: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("مشروع") || lowerQuery.includes("project")) {
    return 'يمكنك إنشاء مشروع جديد من خلال الذهاب إلى صفحة المشاريع والنقر على "مشروع جديد". تأكد من تحديد المشرف المناسب للمشروع.';
  }

  if (lowerQuery.includes("مشرف") || lowerQuery.includes("supervisor")) {
    return "المشرفون هم أعضاء هيئة التدريس المسؤولون عن الإشراف على مشاريع الطلاب. يمكنك اختيار مشرف من قائمة المشرفين المتاحين.";
  }

  if (lowerQuery.includes("مرحلة") || lowerQuery.includes("milestone")) {
    return "المراحل هي نقاط مهمة في تطور المشروع. يمكنك إضافة مراحل وتحديث تقدمها من خلال صفحة تفاصيل المشروع.";
  }

  if (lowerQuery.includes("رسالة") || lowerQuery.includes("message")) {
    return "يمكنك التواصل مع المشرف أو الطالب من خلال نظام الرسائل في كل مشروع. الرسائل محفوظة ويمكن مراجعتها لاحقاً.";
  }

  return "مرحباً! كيف يمكنني مساعدتك في مشروعك؟ يمكنك سؤالي عن إنشاء المشاريع، إدارة المراحل، التواصل مع المشرفين، أو أي شيء آخر يتعلق بالمنصة.";
}

function generateEnglishResponse(query: string, context?: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("project")) {
    return 'You can create a new project by going to the Projects page and clicking "New Project". Make sure to select the appropriate supervisor for your project.';
  }

  if (lowerQuery.includes("supervisor")) {
    return "Supervisors are faculty members responsible for overseeing student projects. You can choose a supervisor from the available supervisors list.";
  }

  if (lowerQuery.includes("milestone")) {
    return "Milestones are important points in project development. You can add milestones and update their progress through the project details page.";
  }

  if (lowerQuery.includes("message")) {
    return "You can communicate with your supervisor or student through the messaging system in each project. Messages are saved and can be reviewed later.";
  }

  return "Hello! How can I help you with your project? You can ask me about creating projects, managing milestones, communicating with supervisors, or anything else related to the platform.";
}

export const chatbotFunctions = {
  sendChatbotQuery,
  rateChatbotResponse,
  getChatbotHistory,
  deleteChatbotInteraction,
};
