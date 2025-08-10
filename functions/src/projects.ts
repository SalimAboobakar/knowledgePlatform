import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { Project, ProjectForm, Milestone, Message } from "./types";

const db = getFirestore();

// إنشاء مشروع جديد
export const createProject = onCall<ProjectForm>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم طالب
    const user = await db.collection("users").doc(auth.uid).get();
    if (!user.exists) {
      throw new HttpsError("permission-denied", "المستخدم غير موجود");
    }

    const userData = user.data();
    if (userData?.role !== "student") {
      throw new HttpsError(
        "permission-denied",
        "فقط الطلاب يمكنهم إنشاء مشاريع"
      );
    }

    // التحقق من وجود المشرف
    const supervisor = await db
      .collection("users")
      .doc(data.supervisorId)
      .get();
    if (!supervisor.exists || supervisor.data()?.role !== "supervisor") {
      throw new HttpsError("invalid-argument", "المشرف غير موجود أو غير صالح");
    }

    // إنشاء المشروع
    const projectData: Omit<Project, "id"> = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: "planning",
      studentId: auth.uid,
      supervisorId: data.supervisorId,
      timeline: data.timeline.map((milestone: any, index: any) => ({
        id: `milestone_${Date.now()}_${index}`,
        ...milestone,
        completed: false,
        progress: 0,
      })),
      progress: 0,
      tags: data.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const projectRef = await db.collection("projects").add(projectData);

    return {
      success: true,
      data: {
        id: projectRef.id,
        ...projectData,
      },
      message: "تم إنشاء المشروع بنجاح",
    };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء إنشاء المشروع");
  }
});

// تحديث المشروع
export const updateProject = onCall<{
  projectId: string;
  updates: Partial<Project>;
}>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من صلاحيات المستخدم
    const project = await db.collection("projects").doc(data.projectId).get();
    if (!project.exists) {
      throw new HttpsError("not-found", "المشروع غير موجود");
    }

    const projectData = project.data() as Project;
    const user = await db.collection("users").doc(auth.uid).get();
    const userData = user.data();

    const canEdit =
      projectData.studentId === auth.uid ||
      projectData.supervisorId === auth.uid ||
      userData?.role === "admin" ||
      userData?.role === "coordinator";

    if (!canEdit) {
      throw new HttpsError(
        "permission-denied",
        "ليس لديك صلاحية لتحديث هذا المشروع"
      );
    }

    // تحديث المشروع
    await db
      .collection("projects")
      .doc(data.projectId)
      .update({
        ...data.updates,
        updatedAt: new Date(),
      });

    return {
      success: true,
      message: "تم تحديث المشروع بنجاح",
    };
  } catch (error) {
    console.error("Error updating project:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء تحديث المشروع");
  }
});

// حذف المشروع
export const deleteProject = onCall<{ projectId: string }>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من صلاحيات المستخدم
    const project = await db.collection("projects").doc(data.projectId).get();
    if (!project.exists) {
      throw new HttpsError("not-found", "المشروع غير موجود");
    }

    const projectData = project.data() as Project;
    const user = await db.collection("users").doc(auth.uid).get();
    const userData = user.data();

    const canDelete =
      projectData.studentId === auth.uid || userData?.role === "admin";

    if (!canDelete) {
      throw new HttpsError(
        "permission-denied",
        "ليس لديك صلاحية لحذف هذا المشروع"
      );
    }

    // حذف المشروع وجميع الرسائل المرتبطة به
    const batch = db.batch();
    batch.delete(db.collection("projects").doc(data.projectId));

    // حذف الرسائل
    const messages = await db
      .collection("projects")
      .doc(data.projectId)
      .collection("messages")
      .get();
    messages.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      message: "تم حذف المشروع بنجاح",
    };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء حذف المشروع");
  }
});

// إرسال رسالة في المشروع
export const sendMessage = onCall<{
  projectId: string;
  content: string;
  type: "text" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من صلاحيات المستخدم
    const project = await db.collection("projects").doc(data.projectId).get();
    if (!project.exists) {
      throw new HttpsError("not-found", "المشروع غير موجود");
    }

    const projectData = project.data() as Project;
    const canMessage =
      projectData.studentId === auth.uid ||
      projectData.supervisorId === auth.uid;

    if (!canMessage) {
      throw new HttpsError(
        "permission-denied",
        "ليس لديك صلاحية لإرسال رسائل في هذا المشروع"
      );
    }

    // إنشاء الرسالة
    const messageData: Omit<Message, "id"> = {
      senderId: auth.uid,
      content: data.content,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      readBy: { [auth.uid]: new Date() },
      createdAt: new Date(),
    };

    const messageRef = await db
      .collection("projects")
      .doc(data.projectId)
      .collection("messages")
      .add(messageData);

    return {
      success: true,
      data: {
        id: messageRef.id,
        ...messageData,
      },
      message: "تم إرسال الرسالة بنجاح",
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء إرسال الرسالة");
  }
});

// تحديث مرحلة المشروع
export const updateMilestone = onCall<{
  projectId: string;
  milestoneId: string;
  updates: Partial<Milestone>;
}>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من صلاحيات المستخدم
    const project = await db.collection("projects").doc(data.projectId).get();
    if (!project.exists) {
      throw new HttpsError("not-found", "المشروع غير موجود");
    }

    const projectData = project.data() as Project;
    const canEdit =
      projectData.studentId === auth.uid ||
      projectData.supervisorId === auth.uid;

    if (!canEdit) {
      throw new HttpsError(
        "permission-denied",
        "ليس لديك صلاحية لتحديث مراحل هذا المشروع"
      );
    }

    // تحديث المرحلة
    const projectRef = db.collection("projects").doc(data.projectId);
    const projectDoc = await projectRef.get();
    const currentProject = projectDoc.data() as Project;

    const updatedTimeline = currentProject.timeline.map((milestone: any) =>
      milestone.id === data.milestoneId
        ? { ...milestone, ...data.updates }
        : milestone
    );

    // حساب التقدم العام
    const totalProgress = updatedTimeline.reduce(
      (sum: any, milestone: any) => sum + milestone.progress,
      0
    );
    const averageProgress = Math.round(totalProgress / updatedTimeline.length);

    await projectRef.update({
      timeline: updatedTimeline,
      progress: averageProgress,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: "تم تحديث المرحلة بنجاح",
    };
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء تحديث المرحلة");
  }
});

export const projectFunctions = {
  createProject,
  updateProject,
  deleteProject,
  sendMessage,
  updateMilestone,
};
