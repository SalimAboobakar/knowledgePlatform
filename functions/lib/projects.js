"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectFunctions = exports.updateMilestone = exports.sendMessage = exports.deleteProject = exports.updateProject = exports.createProject = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
// إنشاء مشروع جديد
exports.createProject = (0, https_1.onCall)(async (request) => {
    var _a;
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من أن المستخدم طالب
        const user = await db.collection("users").doc(auth.uid).get();
        if (!user.exists) {
            throw new https_1.HttpsError("permission-denied", "المستخدم غير موجود");
        }
        const userData = user.data();
        if ((userData === null || userData === void 0 ? void 0 : userData.role) !== "student") {
            throw new https_1.HttpsError("permission-denied", "فقط الطلاب يمكنهم إنشاء مشاريع");
        }
        // التحقق من وجود المشرف
        const supervisor = await db
            .collection("users")
            .doc(data.supervisorId)
            .get();
        if (!supervisor.exists || ((_a = supervisor.data()) === null || _a === void 0 ? void 0 : _a.role) !== "supervisor") {
            throw new https_1.HttpsError("invalid-argument", "المشرف غير موجود أو غير صالح");
        }
        // إنشاء المشروع
        const projectData = {
            title: data.title,
            description: data.description,
            type: data.type,
            status: "planning",
            studentId: auth.uid,
            supervisorId: data.supervisorId,
            timeline: data.timeline.map((milestone, index) => (Object.assign(Object.assign({ id: `milestone_${Date.now()}_${index}` }, milestone), { completed: false, progress: 0 }))),
            progress: 0,
            tags: data.tags,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const projectRef = await db.collection("projects").add(projectData);
        return {
            success: true,
            data: Object.assign({ id: projectRef.id }, projectData),
            message: "تم إنشاء المشروع بنجاح",
        };
    }
    catch (error) {
        console.error("Error creating project:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء إنشاء المشروع");
    }
});
// تحديث المشروع
exports.updateProject = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من صلاحيات المستخدم
        const project = await db.collection("projects").doc(data.projectId).get();
        if (!project.exists) {
            throw new https_1.HttpsError("not-found", "المشروع غير موجود");
        }
        const projectData = project.data();
        const user = await db.collection("users").doc(auth.uid).get();
        const userData = user.data();
        const canEdit = projectData.studentId === auth.uid ||
            projectData.supervisorId === auth.uid ||
            (userData === null || userData === void 0 ? void 0 : userData.role) === "admin" ||
            (userData === null || userData === void 0 ? void 0 : userData.role) === "coordinator";
        if (!canEdit) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لتحديث هذا المشروع");
        }
        // تحديث المشروع
        await db
            .collection("projects")
            .doc(data.projectId)
            .update(Object.assign(Object.assign({}, data.updates), { updatedAt: new Date() }));
        return {
            success: true,
            message: "تم تحديث المشروع بنجاح",
        };
    }
    catch (error) {
        console.error("Error updating project:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء تحديث المشروع");
    }
});
// حذف المشروع
exports.deleteProject = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من صلاحيات المستخدم
        const project = await db.collection("projects").doc(data.projectId).get();
        if (!project.exists) {
            throw new https_1.HttpsError("not-found", "المشروع غير موجود");
        }
        const projectData = project.data();
        const user = await db.collection("users").doc(auth.uid).get();
        const userData = user.data();
        const canDelete = projectData.studentId === auth.uid || (userData === null || userData === void 0 ? void 0 : userData.role) === "admin";
        if (!canDelete) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لحذف هذا المشروع");
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
    }
    catch (error) {
        console.error("Error deleting project:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء حذف المشروع");
    }
});
// إرسال رسالة في المشروع
exports.sendMessage = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من صلاحيات المستخدم
        const project = await db.collection("projects").doc(data.projectId).get();
        if (!project.exists) {
            throw new https_1.HttpsError("not-found", "المشروع غير موجود");
        }
        const projectData = project.data();
        const canMessage = projectData.studentId === auth.uid ||
            projectData.supervisorId === auth.uid;
        if (!canMessage) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لإرسال رسائل في هذا المشروع");
        }
        // إنشاء الرسالة
        const messageData = {
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
            data: Object.assign({ id: messageRef.id }, messageData),
            message: "تم إرسال الرسالة بنجاح",
        };
    }
    catch (error) {
        console.error("Error sending message:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء إرسال الرسالة");
    }
});
// تحديث مرحلة المشروع
exports.updateMilestone = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من صلاحيات المستخدم
        const project = await db.collection("projects").doc(data.projectId).get();
        if (!project.exists) {
            throw new https_1.HttpsError("not-found", "المشروع غير موجود");
        }
        const projectData = project.data();
        const canEdit = projectData.studentId === auth.uid ||
            projectData.supervisorId === auth.uid;
        if (!canEdit) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لتحديث مراحل هذا المشروع");
        }
        // تحديث المرحلة
        const projectRef = db.collection("projects").doc(data.projectId);
        const projectDoc = await projectRef.get();
        const currentProject = projectDoc.data();
        const updatedTimeline = currentProject.timeline.map((milestone) => milestone.id === data.milestoneId
            ? Object.assign(Object.assign({}, milestone), data.updates) : milestone);
        // حساب التقدم العام
        const totalProgress = updatedTimeline.reduce((sum, milestone) => sum + milestone.progress, 0);
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
    }
    catch (error) {
        console.error("Error updating milestone:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء تحديث المرحلة");
    }
});
exports.projectFunctions = {
    createProject: exports.createProject,
    updateProject: exports.updateProject,
    deleteProject: exports.deleteProject,
    sendMessage: exports.sendMessage,
    updateMilestone: exports.updateMilestone,
};
//# sourceMappingURL=projects.js.map