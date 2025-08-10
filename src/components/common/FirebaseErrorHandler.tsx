import React from "react";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface FirebaseErrorHandlerProps {
  error: any;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
}

const FirebaseErrorHandler: React.FC<FirebaseErrorHandlerProps> = ({
  error,
  onRetry,
  title = "خطأ في تحميل البيانات",
  showDetails = false,
}) => {
  const getErrorMessage = (error: any): string => {
    if (!error) return "حدث خطأ غير معروف";

    // أخطاء Firebase الشائعة
    if (error.code === "permission-denied") {
      return "ليس لديك صلاحية للوصول إلى هذه البيانات";
    }

    if (error.code === "unavailable") {
      return "الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً";
    }

    if (error.code === "resource-exhausted") {
      return "تم استنفاذ الموارد، يرجى المحاولة لاحقاً";
    }

    if (error.code === "failed-precondition") {
      return "فشل في استيفاء الشروط المطلوبة";
    }

    if (error.code === "aborted") {
      return "تم إلغاء العملية";
    }

    if (error.code === "out-of-range") {
      return "البيانات المطلوبة خارج النطاق المسموح";
    }

    if (error.code === "unimplemented") {
      return "هذه الميزة غير متاحة حالياً";
    }

    if (error.code === "internal") {
      return "خطأ داخلي في الخادم";
    }

    if (error.code === "data-loss") {
      return "فقدان البيانات";
    }

    if (error.code === "unauthenticated") {
      return "يجب تسجيل الدخول للوصول إلى هذه البيانات";
    }

    if (error.message?.includes("index")) {
      return "يحتاج الاستعلام إلى مؤشر مركب. يرجى إنشاء المؤشر المطلوب في Firebase Console.";
    }

    return error.message || "حدث خطأ غير متوقع";
  };

  const getErrorSeverity = (error: any): "error" | "warning" | "info" => {
    if (
      error.code === "permission-denied" ||
      error.code === "unauthenticated"
    ) {
      return "error";
    }

    if (error.code === "unavailable" || error.code === "resource-exhausted") {
      return "warning";
    }

    return "error";
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Alert
        severity={getErrorSeverity(error)}
        icon={<WarningIcon />}
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              إعادة المحاولة
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        <Typography variant="body2">{getErrorMessage(error)}</Typography>

        {showDetails && error.code && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              رمز الخطأ: {error.code}
            </Typography>
          </Box>
        )}

        {error.message?.includes("index") && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>الحل:</strong> افتح الرابط الذي يظهر في رسالة الخطأ وأنشئ
              المؤشر المطلوب في Firebase Console.
            </Typography>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default FirebaseErrorHandler;
