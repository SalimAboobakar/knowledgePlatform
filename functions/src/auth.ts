import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { User, RegisterForm } from "./types";

const db = getFirestore();

// إنشاء مستخدم جديد مع الدور المحدد
export const createUserWithRole = onCall<RegisterForm>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم الحالي هو admin أو coordinator
    const currentUser = await db.collection("users").doc(auth.uid).get();
    if (!currentUser.exists) {
      throw new HttpsError("permission-denied", "المستخدم غير موجود");
    }

    const currentUserData = currentUser.data() as User;
    if (!["admin", "coordinator"].includes(currentUserData.role)) {
      throw new HttpsError(
        "permission-denied",
        "ليس لديك صلاحية لإنشاء مستخدمين"
      );
    }

    // إنشاء المستخدم في Firebase Auth
    const userRecord = await getAuth().createUser({
      email: data.email,
      password: data.password,
      displayName: `${data.firstName} ${data.lastName}`,
    });

    // إنشاء وثيقة المستخدم في Firestore
    const userData: Omit<User, "uid"> = {
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
      data: {
        uid: userRecord.uid,
        ...userData,
      },
      message: "تم إنشاء المستخدم بنجاح",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء إنشاء المستخدم");
  }
});

// تحديث دور المستخدم
export const updateUserRole = onCall<{ userId: string; role: User["role"] }>(
  async (request: any) => {
    try {
      const { data, auth } = request;

      if (!auth) {
        throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
      }

      // التحقق من أن المستخدم الحالي هو admin
      const currentUser = await db.collection("users").doc(auth.uid).get();
      if (!currentUser.exists) {
        throw new HttpsError("permission-denied", "المستخدم غير موجود");
      }

      const currentUserData = currentUser.data() as User;
      if (currentUserData.role !== "admin") {
        throw new HttpsError(
          "permission-denied",
          "فقط المدير يمكنه تحديث الأدوار"
        );
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
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new HttpsError("internal", "حدث خطأ أثناء تحديث دور المستخدم");
    }
  }
);

// حذف المستخدم
export const deleteUser = onCall<{ userId: string }>(async (request: any) => {
  try {
    const { data, auth } = request;

    if (!auth) {
      throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
    }

    // التحقق من أن المستخدم الحالي هو admin
    const currentUser = await db.collection("users").doc(auth.uid).get();
    if (!currentUser.exists) {
      throw new HttpsError("permission-denied", "المستخدم غير موجود");
    }

    const currentUserData = currentUser.data() as User;
    if (currentUserData.role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "فقط المدير يمكنه حذف المستخدمين"
      );
    }

    // حذف المستخدم من Firebase Auth
    await getAuth().deleteUser(data.userId);

    // حذف وثيقة المستخدم من Firestore
    await db.collection("users").doc(data.userId).delete();

    return {
      success: true,
      message: "تم حذف المستخدم بنجاح",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new HttpsError("internal", "حدث خطأ أثناء حذف المستخدم");
  }
});

export const authFunctions = {
  createUserWithRole,
  updateUserRole,
  deleteUser,
};
