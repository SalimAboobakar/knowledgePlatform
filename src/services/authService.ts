import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { UserService } from "./firebaseService";
import { User } from "../data/mockData";

// نوع بيانات التسجيل
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "supervisor";
  university: string;
  department: string;
  specialization: string;
  phone?: string;
}

// إنشاء مستخدم جديد
export const createUser = async (
  email: string,
  password: string,
  userData: Omit<User, "id" | "email" | "createdAt" | "updatedAt">
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // إنشاء ملف المستخدم في Firestore
    const userId = await UserService.createUser({
      ...userData,
      email,
    });

    // إرسال رسالة تأكيد البريد الإلكتروني
    await sendEmailVerification(firebaseUser);

    return { firebaseUser, userId };
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error(getErrorMessage(error?.code || "unknown"));
  }
};

// تسجيل الدخول
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in:", error);
    throw new Error(getErrorMessage(error?.code || "unknown"));
  }
};

// تسجيل الدخول (اسم بديل للتوافق)
export const loginUser = signInUser;

// تسجيل الدخول بـ Google
export const loginWithGoogle = async () => {
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import(
      "firebase/auth"
    );
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw new Error(getErrorMessage(error?.code || "unknown"));
  }
};

// إنشاء مستخدم جديد (اسم بديل للتوافق)
export const registerUser = createUser;

// دالة تسجيل جديدة تتوافق مع RegisterData
export const registerUserWithData = async (registerData: RegisterData) => {
  try {
    console.log("🚀 Starting user registration for:", registerData.email);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      registerData.email,
      registerData.password
    );
    const firebaseUser = userCredential.user;

    console.log("✅ Firebase Auth user created:", firebaseUser.uid);

    // تأكد من أن المستخدم مسجل الدخول
    console.log("🔐 Current auth state:", auth.currentUser?.uid);

    // تحويل RegisterData إلى User
    const userData: Omit<User, "id" | "createdAt" | "updatedAt"> = {
      name: `${registerData.firstName} ${registerData.lastName}`,
      email: registerData.email,
      role: registerData.role,
      department: registerData.department,
      specialization: registerData.specialization,
      avatar: registerData.firstName.charAt(0),
      phone: registerData.phone,
      profile: {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        university: registerData.university,
        department: registerData.department,
        specialization: registerData.specialization,
        phone: registerData.phone,
        avatar: registerData.firstName.charAt(0),
      },
    };

    console.log("📝 Creating Firestore document for user:", firebaseUser.uid);

    // إنشاء ملف المستخدم في Firestore مع البيانات المخصصة
    const user = await UserService.createUserWithCustomData(
      firebaseUser,
      userData
    );

    if (!user) {
      console.error(
        "❌ Failed to create Firestore document for user:",
        firebaseUser.uid
      );
      throw new Error("فشل في إنشاء ملف المستخدم في قاعدة البيانات");
    }

    console.log(
      "✅ Firestore document created successfully for user:",
      user.id
    );

    // إرسال رسالة تأكيد البريد الإلكتروني
    await sendEmailVerification(firebaseUser);

    return { firebaseUser, userId: user.id };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // معالجة خاصة لخطأ البريد الإلكتروني المستخدم
    if (error?.code === "auth/email-already-in-use") {
      throw new Error(
        "البريد الإلكتروني مستخدم بالفعل. يمكنك تسجيل الدخول بدلاً من إنشاء حساب جديد."
      );
    }

    throw new Error(getErrorMessage(error?.code || "unknown"));
  }
};

// إرسال رسالة تأكيد البريد الإلكتروني
export const sendVerificationEmail = async (user: FirebaseUser) => {
  try {
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    throw new Error(getErrorMessage(error?.code || "unknown"));
  }
};

// تسجيل الخروج
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw new Error(getErrorMessage(error?.code || "unknown"));
  }
};

// إعادة تعيين كلمة المرور
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Error resetting password:", error);
    throw new Error(getErrorMessage(error?.code || "unknown"));
  }
};

// جلب بيانات المستخدم من Firestore
export const getUserProfile = async (
  firebaseUser: FirebaseUser
): Promise<User | null> => {
  try {
    // Use the ensureUserDocument function to make sure the user document exists
    const user = await UserService.ensureUserDocument(firebaseUser);
    return user;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// الاستماع لتغييرات حالة المصادقة
export const onAuthStateChangedListener = (
  onUserChanged: (user: FirebaseUser | null) => void,
  onError: (error: Error) => void
) => {
  return onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      onUserChanged(firebaseUser);
    },
    (error) => {
      console.error("Auth state change error:", error);
      onError(error);
    }
  );
};

// تحويل رسائل الخطأ
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "البريد الإلكتروني غير مسجل في النظام";
    case "auth/wrong-password":
      return "كلمة المرور غير صحيحة";
    case "auth/email-already-in-use":
      return "البريد الإلكتروني مستخدم بالفعل";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة جداً";
    case "auth/invalid-email":
      return "البريد الإلكتروني غير صحيح";
    case "auth/too-many-requests":
      return "تم تجاوز عدد المحاولات المسموح، يرجى المحاولة لاحقاً";
    case "auth/network-request-failed":
      return "خطأ في الاتصال بالشبكة";
    case "auth/user-disabled":
      return "تم تعطيل الحساب";
    case "auth/operation-not-allowed":
      return "العملية غير مسموح بها";
    case "auth/invalid-credential":
      return "بيانات الاعتماد غير صحيحة";
    default:
      return "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى";
  }
};

// التحقق من صحة البريد الإلكتروني
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// التحقق من قوة كلمة المرور
export const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل",
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل",
    };
  }

  return { isValid: true, message: "كلمة المرور قوية" };
};
