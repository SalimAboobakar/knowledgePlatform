import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
} from "@mui/icons-material";
import { signInUser, loginWithGoogle } from "../../services/authService";

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToForgot?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgot,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      await signInUser(formData.email, formData.password);
    } catch (error: any) {
      setFormError(
        error.message === "Firebase: Error (auth/user-not-found)."
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : error.message === "Firebase: Error (auth/wrong-password)."
          ? "كلمة المرور غير صحيحة"
          : "حدث خطأ في تسجيل الدخول"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      setFormError("حدث خطأ في تسجيل الدخول بحساب Google");
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {formError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formError}
        </Alert>
      )}

      {/* Google Sign In Button */}
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleSignIn}
        sx={{
          mb: 3,
          py: 1.5,
          borderColor: "#e2e8f0",
          color: "#64748b",
          "&:hover": {
            borderColor: "#cbd5e1",
            backgroundColor: "#f8fafc",
          },
        }}
        startIcon={<Google />}
      >
        تسجيل الدخول بحساب Google
      </Button>

      <Divider
        sx={{ mb: 3, "&::before, &::after": { borderColor: "#e2e8f0" } }}
      >
        <Typography variant="body2" color="text.secondary">
          أو
        </Typography>
      </Divider>

      <TextField
        label="البريد الإلكتروني"
        type="email"
        value={formData.email}
        onChange={(e) => updateFormData("email", e.target.value)}
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

      <TextField
        label="كلمة المرور"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={(e) => updateFormData("password", e.target.value)}
        fullWidth
        required
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          mb: 3,
          py: 1.5,
          background: "#3b82f6",
          "&:hover": {
            background: "#2563eb",
          },
        }}
      >
        {loading ? <CircularProgress size={24} /> : "تسجيل الدخول"}
      </Button>

      <Box sx={{ textAlign: "center" }}>
        <Button
          onClick={onSwitchToForgot}
          sx={{
            color: "#3b82f6",
            textTransform: "none",
            fontWeight: 600,
            mb: 2,
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          نسيت كلمة المرور؟
        </Button>
      </Box>

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          ليس لديك حساب؟{" "}
          <Button
            onClick={onSwitchToRegister}
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
            إنشاء حساب جديد
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;
