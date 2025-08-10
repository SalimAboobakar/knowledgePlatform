"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileFunctions = exports.getUserFiles = exports.getProjectFiles = exports.deleteFile = exports.confirmFileUpload = exports.uploadFile = void 0;
const https_1 = require("firebase-functions/v2/https");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
const storage = (0, storage_1.getStorage)();
// رفع ملف
exports.uploadFile = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من وجود المستخدم
        const user = await db.collection("users").doc(auth.uid).get();
        if (!user.exists) {
            throw new https_1.HttpsError("permission-denied", "المستخدم غير موجود");
        }
        // التحقق من صحة نوع الملف
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/gif",
            "text/plain",
            "application/zip",
            "application/x-rar-compressed",
        ];
        if (!allowedTypes.includes(data.fileType)) {
            throw new https_1.HttpsError("invalid-argument", "نوع الملف غير مسموح به");
        }
        // التحقق من حجم الملف (حد أقصى 10 ميجابايت)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (data.fileSize > maxSize) {
            throw new https_1.HttpsError("invalid-argument", "حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
        }
        // إذا كان الملف مرتبط بمشروع، التحقق من الصلاحيات
        if (data.projectId) {
            const project = await db.collection("projects").doc(data.projectId).get();
            if (!project.exists) {
                throw new https_1.HttpsError("not-found", "المشروع غير موجود");
            }
            const projectData = project.data();
            const canUpload = (projectData === null || projectData === void 0 ? void 0 : projectData.studentId) === auth.uid ||
                (projectData === null || projectData === void 0 ? void 0 : projectData.supervisorId) === auth.uid;
            if (!canUpload) {
                throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لرفع ملفات لهذا المشروع");
            }
        }
        // إنشاء معرف فريد للملف
        const fileId = `file_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        const filePath = `files/${fileId}/${data.fileName}`;
        // إنشاء URL للتوقيع (لرفع الملف من العميل)
        const bucket = storage.bucket();
        const file = bucket.file(filePath);
        const [signedUrl] = await file.getSignedUrl({
            action: "write",
            expires: Date.now() + 15 * 60 * 1000,
            contentType: data.fileType,
        });
        // حفظ بيانات الملف في Firestore
        const fileMetadata = {
            name: data.fileName,
            size: data.fileSize,
            type: data.fileType,
            uploadedBy: auth.uid,
            projectId: data.projectId,
            createdAt: new Date(),
        };
        await db.collection("files").doc(fileId).set(fileMetadata);
        return {
            success: true,
            data: Object.assign({ fileId: fileId, uploadUrl: signedUrl, filePath: filePath }, fileMetadata),
            message: "تم إنشاء رابط الرفع بنجاح",
        };
    }
    catch (error) {
        console.error("Error creating upload URL:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء إنشاء رابط الرفع");
    }
});
// تأكيد رفع الملف
exports.confirmFileUpload = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من وجود الملف
        const fileDoc = await db.collection("files").doc(data.fileId).get();
        if (!fileDoc.exists) {
            throw new https_1.HttpsError("not-found", "الملف غير موجود");
        }
        const fileData = fileDoc.data();
        if (fileData.uploadedBy !== auth.uid) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لتحديث هذا الملف");
        }
        // التحقق من وجود الملف في التخزين
        const bucket = storage.bucket();
        const filePath = `files/${data.fileId}/${fileData.name}`;
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        if (!exists) {
            throw new https_1.HttpsError("not-found", "الملف غير موجود في التخزين");
        }
        // إنشاء URL عام للقراءة
        const [publicUrl] = await file.getSignedUrl({
            action: "read",
            expires: "03-01-2500", // تاريخ بعيد جداً
        });
        // تحديث URL الملف
        await db.collection("files").doc(data.fileId).update({
            url: publicUrl,
        });
        return {
            success: true,
            message: "تم تأكيد رفع الملف بنجاح",
            data: {
                fileId: data.fileId,
                url: publicUrl,
            },
        };
    }
    catch (error) {
        console.error("Error confirming file upload:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء تأكيد رفع الملف");
    }
});
// حذف ملف
exports.deleteFile = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من وجود الملف
        const fileDoc = await db.collection("files").doc(data.fileId).get();
        if (!fileDoc.exists) {
            throw new https_1.HttpsError("not-found", "الملف غير موجود");
        }
        const fileData = fileDoc.data();
        const user = await db.collection("users").doc(auth.uid).get();
        const userData = user.data();
        const canDelete = fileData.uploadedBy === auth.uid || (userData === null || userData === void 0 ? void 0 : userData.role) === "admin";
        if (!canDelete) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لحذف هذا الملف");
        }
        // حذف الملف من التخزين
        const bucket = storage.bucket();
        const filePath = `files/${data.fileId}/${fileData.name}`;
        const file = bucket.file(filePath);
        try {
            await file.delete();
        }
        catch (storageError) {
            console.warn("File not found in storage, continuing with metadata deletion:", storageError);
        }
        // حذف بيانات الملف من Firestore
        await db.collection("files").doc(data.fileId).delete();
        return {
            success: true,
            message: "تم حذف الملف بنجاح",
        };
    }
    catch (error) {
        console.error("Error deleting file:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء حذف الملف");
    }
});
// الحصول على ملفات المشروع
exports.getProjectFiles = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من صلاحيات الوصول للمشروع
        const project = await db.collection("projects").doc(data.projectId).get();
        if (!project.exists) {
            throw new https_1.HttpsError("not-found", "المشروع غير موجود");
        }
        const projectData = project.data();
        const canAccess = (projectData === null || projectData === void 0 ? void 0 : projectData.studentId) === auth.uid ||
            (projectData === null || projectData === void 0 ? void 0 : projectData.supervisorId) === auth.uid;
        if (!canAccess) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية للوصول لملفات هذا المشروع");
        }
        // الحصول على ملفات المشروع
        const files = await db
            .collection("files")
            .where("projectId", "==", data.projectId)
            .orderBy("createdAt", "desc")
            .get();
        const fileList = files.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            data: fileList,
            message: "تم جلب ملفات المشروع بنجاح",
        };
    }
    catch (error) {
        console.error("Error getting project files:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء جلب ملفات المشروع");
    }
});
// الحصول على ملفات المستخدم
exports.getUserFiles = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // بناء الاستعلام
        let query = db
            .collection("files")
            .where("uploadedBy", "==", auth.uid)
            .orderBy("createdAt", "desc");
        if (data.limit) {
            query = query.limit(data.limit);
        }
        else {
            query = query.limit(50); // افتراضي
        }
        const snapshot = await query.get();
        const files = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            data: files,
            message: "تم جلب ملفات المستخدم بنجاح",
        };
    }
    catch (error) {
        console.error("Error getting user files:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء جلب ملفات المستخدم");
    }
});
exports.fileFunctions = {
    uploadFile: exports.uploadFile,
    confirmFileUpload: exports.confirmFileUpload,
    deleteFile: exports.deleteFile,
    getProjectFiles: exports.getProjectFiles,
    getUserFiles: exports.getUserFiles,
};
//# sourceMappingURL=files.js.map