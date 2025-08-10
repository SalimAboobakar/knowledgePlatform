"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authFunctions = exports.deleteUser = exports.updateUserRole = exports.createUserWithRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
// إنشاء مستخدم جديد مع الدور المحدد
exports.createUserWithRole = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من أن المستخدم الحالي هو admin أو coordinator
        const currentUser = await db.collection("users").doc(auth.uid).get();
        if (!currentUser.exists) {
            throw new https_1.HttpsError("permission-denied", "المستخدم غير موجود");
        }
        const currentUserData = currentUser.data();
        if (!["admin", "coordinator"].includes(currentUserData.role)) {
            throw new https_1.HttpsError("permission-denied", "ليس لديك صلاحية لإنشاء مستخدمين");
        }
        // إنشاء المستخدم في Firebase Auth
        const userRecord = await (0, auth_1.getAuth)().createUser({
            email: data.email,
            password: data.password,
            displayName: `${data.firstName} ${data.lastName}`,
        });
        // إنشاء وثيقة المستخدم في Firestore
        const userData = {
            email: data.email,
            role: data.role,
            profile: {
                firstName: data.firstName,
                lastName: data.lastName,
                university: data.university,
                department: data.department,
                specialization: data.specialization,
                phone: data.phone,
            },
            preferences: {
                language: "ar",
                notifications: true,
                theme: "light",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.collection("users").doc(userRecord.uid).set(userData);
        return {
            success: true,
            data: Object.assign({ uid: userRecord.uid }, userData),
            message: "تم إنشاء المستخدم بنجاح",
        };
    }
    catch (error) {
        console.error("Error creating user:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء إنشاء المستخدم");
    }
});
// تحديث دور المستخدم
exports.updateUserRole = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من أن المستخدم الحالي هو admin
        const currentUser = await db.collection("users").doc(auth.uid).get();
        if (!currentUser.exists) {
            throw new https_1.HttpsError("permission-denied", "المستخدم غير موجود");
        }
        const currentUserData = currentUser.data();
        if (currentUserData.role !== "admin") {
            throw new https_1.HttpsError("permission-denied", "فقط المدير يمكنه تحديث الأدوار");
        }
        // تحديث دور المستخدم في Firestore
        await db.collection("users").doc(data.userId).update({
            role: data.role,
            updatedAt: new Date(),
        });
        return {
            success: true,
            message: "تم تحديث دور المستخدم بنجاح",
        };
    }
    catch (error) {
        console.error("Error updating user role:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء تحديث دور المستخدم");
    }
});
// حذف المستخدم
exports.deleteUser = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
        }
        // التحقق من أن المستخدم الحالي هو admin
        const currentUser = await db.collection("users").doc(auth.uid).get();
        if (!currentUser.exists) {
            throw new https_1.HttpsError("permission-denied", "المستخدم غير موجود");
        }
        const currentUserData = currentUser.data();
        if (currentUserData.role !== "admin") {
            throw new https_1.HttpsError("permission-denied", "فقط المدير يمكنه حذف المستخدمين");
        }
        // حذف المستخدم من Firebase Auth
        await (0, auth_1.getAuth)().deleteUser(data.userId);
        // حذف وثيقة المستخدم من Firestore
        await db.collection("users").doc(data.userId).delete();
        return {
            success: true,
            message: "تم حذف المستخدم بنجاح",
        };
    }
    catch (error) {
        console.error("Error deleting user:", error);
        throw new https_1.HttpsError("internal", "حدث خطأ أثناء حذف المستخدم");
    }
});
exports.authFunctions = {
    createUserWithRole: exports.createUserWithRole,
    updateUserRole: exports.updateUserRole,
    deleteUser: exports.deleteUser,
};
//# sourceMappingURL=auth.js.map