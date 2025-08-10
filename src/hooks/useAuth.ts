import { useAuthContext } from "../contexts/AuthContext";
import { useCallback } from "react";
import { signOutUser } from "../services/authService";

export function useAuth() {
  const ctx = useAuthContext();

  // هل المستخدم مسجل دخول؟
  const isAuthenticated = !!ctx.firebaseUser && !!ctx.user;

  // هل المستخدم من دور معين؟
  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!ctx.role) return false;
      if (Array.isArray(roles)) return roles.includes(ctx.role);
      return ctx.role === roles;
    },
    [ctx.role]
  );

  // حماية المسارات
  const canAccess = useCallback(
    (roles: string | string[]) => {
      if (!isAuthenticated) return false;
      return hasRole(roles);
    },
    [isAuthenticated, hasRole]
  );

  // دالة تسجيل الخروج
  const logout = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error: any) {
      console.error("Error signing out:", error);
    }
  }, []);

  return {
    ...ctx,
    isAuthenticated,
    hasRole,
    canAccess,
    logout,
  };
}
