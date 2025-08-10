import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  useTheme,
  Paper,
} from "@mui/material";
import { Email, CheckCircle } from "@mui/icons-material";
import { resetPassword } from "../../services/authService";

interface ForgotPasswordFormProps {
  onSwitchToLogin?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await resetPassword(email);
      setResetSuccess(true);
    } catch (error: any) {
      setFormError(
        error.message === "Firebase: Error (auth/user-not-found)."
          ? "البريد الإلكتروني غير مسجل في النظام"
          : "حدث خطأ في إرسال رابط إعادة تعيين كلمة المرور"
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={600} color="success.main" mb={2}>
          تم إرسال رابط إعادة التعيين! 📧
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى
          التحقق من صندوق الوارد الخاص بك.
        </Typography>
        <Button
          onClick={onSwitchToLogin}
          variant="outlined"
          sx={{
            borderColor: "#3b82f6",
            color: "#3b82f6",
            "&:hover": {
              borderColor: "#2563eb",
              backgroundColor: "rgba(59, 130, 246, 0.04)",
            },
          }}
        >
          العودة لتسجيل الدخول
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: "#f8fafc",
          borderRadius: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary" textAlign="center">
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
        </Typography>
      </Paper>

      <TextField
        label="البريد الإلكتروني"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={formLoading}
        sx={{
          mb: 3,
          py: 1.5,
          background: "#3b82f6",
          "&:hover": {
            background: "#2563eb",
          },
        }}
      >
        {formLoading ? (
          <CircularProgress size={24} />
        ) : (
          "إرسال رابط إعادة التعيين"
        )}
      </Button>

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          تذكرت كلمة المرور؟{" "}
          <Button
            onClick={onSwitchToLogin}
            sx={{
              color: "#3b82f6",
              textTransform: "none",
              fontWeight: 600,
              p: 0,
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            تسجيل الدخول
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;
