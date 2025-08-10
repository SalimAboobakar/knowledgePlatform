import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string | string[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  fallback,
}) => {
  const { isAuthenticated, loading, canAccess } = useAuth();

  // عرض شاشة التحميل
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          جاري التحميل...
        </Typography>
      </Box>
    );
  }

  // إذا لم يكن مسجل دخول
  if (!isAuthenticated) {
    return (
      <React.Fragment>
        {fallback || (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <Typography variant="h4" mb={2}>
              غير مصرح لك بالوصول
            </Typography>
            <Typography variant="body1" color="text.secondary">
              يرجى تسجيل الدخول للوصول إلى هذه الصفحة
            </Typography>
          </Box>
        )}
      </React.Fragment>
    );
  }

  // إذا كان هناك متطلبات دور معين
  if (roles && !canAccess(roles)) {
    return (
      <React.Fragment>
        {fallback || (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
          >
            <Typography variant="h4" mb={2}>
              غير مصرح لك بالوصول
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة
            </Typography>
          </Box>
        )}
      </React.Fragment>
    );
  }

  // إذا كان كل شيء على ما يرام، اعرض المحتوى
  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedRoute;
