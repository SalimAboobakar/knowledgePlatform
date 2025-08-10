import React, { createContext, useContext, useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User } from "../data/mockData";
import {
  onAuthStateChangedListener,
  getUserProfile,
} from "../services/authService";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دالة لتحديث بيانات المستخدم
  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const userProfile = await getUserProfile(firebaseUser);
        if (userProfile) {
          setUser(userProfile);
          setRole(userProfile.role);
        } else {
          // إذا لم يتم العثور على المستخدم في Firestore، نستخدم بيانات افتراضية
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "مستخدم جديد",
            email: firebaseUser.email || "",
            role: "student",
            department: "غير محدد",
            specialization: "غير محدد",
            avatar: firebaseUser.displayName?.charAt(0) || "م",
          });
          setRole("student");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("خطأ في جلب بيانات المستخدم");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(
      async (firebaseUser) => {
        setFirebaseUser(firebaseUser);

        if (firebaseUser) {
          try {
            console.log("🔍 AuthContext: Firebase user:", {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
            });
            
            const userProfile = await getUserProfile(firebaseUser);
            if (userProfile) {
              console.log("✅ AuthContext: User profile found:", userProfile);
              setUser(userProfile);
              setRole(userProfile.role);
            } else {
              console.log("⚠️ AuthContext: No user profile found, creating default");
              // إذا لم يتم العثور على المستخدم في Firestore، نستخدم بيانات افتراضية
              const defaultUser = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "مستخدم جديد",
                email: firebaseUser.email || "",
                role: "student" as const,
                department: "غير محدد",
                specialization: "غير محدد",
                avatar: firebaseUser.displayName?.charAt(0) || "م",
              };
              console.log("📝 AuthContext: Setting default user:", defaultUser);
              setUser(defaultUser);
              setRole("student");
            }
          } catch (error) {
            console.error("❌ AuthContext: Error fetching user profile:", error);
            setError("خطأ في جلب بيانات المستخدم");
            // استخدام بيانات افتراضية في حالة الخطأ
            const fallbackUser = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || "مستخدم جديد",
              email: firebaseUser.email || "",
              role: "student" as const,
              department: "غير محدد",
              specialization: "غير محدد",
              avatar: firebaseUser.displayName?.charAt(0) || "م",
            };
            console.log("🔄 AuthContext: Setting fallback user:", fallbackUser);
            setUser(fallbackUser);
            setRole("student");
          }
        } else {
          console.log("🚪 AuthContext: No Firebase user, clearing state");
          setUser(null);
          setRole(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    firebaseUser,
    user,
    role,
    loading,
    error,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
