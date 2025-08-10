import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import { Email, Refresh, CheckCircle } from "@mui/icons-material";
import { sendVerificationEmail } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const EmailVerificationPrompt: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!firebaseUser) return;

    setSending(true);
    setError(null);

    try {
      await sendVerificationEmail(firebaseUser);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "فشل إرسال بريد التحقق");
    } finally {
      setSending(false);
    }
  };

  if (!firebaseUser) {
    return null;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 6,
          maxWidth: 500,
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 3,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            fontSize: "2rem",
          }}
        >
          <Email />
        </Avatar>

        <Typography variant="h4" mb={2} fontWeight={700} color="primary">
          تحقق من بريدك الإلكتروني
        </Typography>

        <Typography variant="body1" mb={3} color="text.secondary">
          تم إرسال رابط التحقق إلى:
        </Typography>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200",
            mb: 3,
          }}
        >
          <Typography variant="body1" fontWeight={600} color="text.primary">
            {firebaseUser.email}
          </Typography>
        </Box>

        <Typography variant="body2" mb={4} color="text.secondary">
          يرجى فتح بريدك الإلكتروني والضغط على رابط التحقق لإكمال عملية التسجيل.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {sent && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<CheckCircle />}
          >
            تم إرسال بريد التحقق بنجاح
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Button
          variant="outlined"
          onClick={handleResendEmail}
          disabled={sending}
          fullWidth
          startIcon={sending ? <CircularProgress size={20} /> : <Refresh />}
          sx={{
            py: 1.5,
            borderColor: "#e2e8f0",
            color: "#374151",
            "&:hover": {
              borderColor: "#cbd5e1",
              backgroundColor: "#f8fafc",
            },
          }}
        >
          {sending ? "جاري الإرسال..." : "إعادة إرسال بريد التحقق"}
        </Button>

        <Typography
          variant="caption"
          display="block"
          mt={3}
          color="text.secondary"
          sx={{ opacity: 0.8 }}
        >
          لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها
        </Typography>
      </Paper>
    </Box>
  );
};

export default EmailVerificationPrompt;
