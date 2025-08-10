import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  InputAdornment,
  IconButton,
  useTheme,
  Paper,
} from "@mui/material";
import {
  Person,
  School,
  Business,
  Phone,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
} from "@mui/icons-material";
import { registerUserWithData, RegisterData } from "../../services/authService";

const steps = ["المعلومات الأساسية", "اختيار الدور", "معلومات الجامعة"];

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<RegisterData>>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student",
    university: "",
    department: "",
    specialization: "",
    phone: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleNext = () => {
    setFormError(null);
    // التحقق من صحة البيانات قبل الانتقال للخطوة التالية
    if (activeStep === 0) {
      if (!formData.firstName?.trim()) {
        setFormError("الاسم الأول مطلوب");
        return;
      }
      if (!formData.lastName?.trim()) {
        setFormError("الاسم الأخير مطلوب");
        return;
      }
      if (!formData.email?.trim()) {
        setFormError("البريد الإلكتروني مطلوب");
        return;
      }
      if (!formData.email.includes("@")) {
        setFormError("البريد الإلكتروني غير صحيح");
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setFormError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.role) {
        setFormError("يجب اختيار الدور");
        return;
      }
    } else if (activeStep === 2) {
      if (!formData.university?.trim()) {
        setFormError("اسم الجامعة مطلوب");
        return;
      }
      if (!formData.department?.trim()) {
        setFormError("اسم القسم مطلوب");
        return;
      }
      if (!formData.specialization?.trim()) {
        setFormError("التخصص مطلوب");
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      await registerUserWithData(formData as RegisterData);
      setRegistrationSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error: any) {
      setFormError(
        error.message === "Firebase: Error (auth/email-already-in-use)."
          ? "البريد الإلكتروني مستخدم بالفعل"
          : "حدث خطأ في إنشاء الحساب"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
              المعلومات الشخصية
            </Typography>

            <TextField
              label="الاسم الأول"
              value={formData.firstName || ""}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="الاسم الأخير"
              value={formData.lastName || ""}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="البريد الإلكتروني"
              type="email"
              value={formData.email || ""}
              onChange={(e) => updateFormData("email", e.target.value)}
              fullWidth
              required
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
              value={formData.password || ""}
              onChange={(e) => updateFormData("password", e.target.value)}
              fullWidth
              required
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

            <TextField
              label="رقم الهاتف (اختياري)"
              value={formData.phone || ""}
              onChange={(e) => updateFormData("phone", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
              اختيار الدور في المنصة
            </Typography>

            <FormControl fullWidth>
              <InputLabel>الدور</InputLabel>
              <Select
                value={formData.role || ""}
                onChange={(e) => updateFormData("role", e.target.value)}
                label="الدور"
              >
                <MenuItem value="student">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <School />
                    طالب
                  </Box>
                </MenuItem>
                <MenuItem value="supervisor">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Business />
                    مشرف أكاديمي
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Business />
                    مدير النظام
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
              معلومات الجامعة
            </Typography>

            <TextField
              label="اسم الجامعة"
              value={formData.university || ""}
              onChange={(e) => updateFormData("university", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="اسم القسم"
              value={formData.department || ""}
              onChange={(e) => updateFormData("department", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="التخصص"
              value={formData.specialization || ""}
              onChange={(e) => updateFormData("specialization", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  if (registrationSuccess) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={600} color="success.main" mb={2}>
          تم إنشاء الحساب بنجاح! 🎉
        </Typography>
        <Typography variant="body1" color="text.secondary">
          سيتم تحويلك إلى صفحة تسجيل الدخول...
        </Typography>
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

      {/* Stepper */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: "#f8fafc",
          borderRadius: 3,
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          السابق
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            type="submit"
            variant="contained"
            disabled={formLoading}
            sx={{
              px: 4,
              py: 1.5,
              background: "#3b82f6",
              "&:hover": {
                background: "#2563eb",
              },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {formLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "إنشاء الحساب"
            )}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              px: 4,
              py: 1.5,
              background: "#3b82f6",
              "&:hover": {
                background: "#2563eb",
              },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            التالي
          </Button>
        )}
      </Box>

      {/* Switch to Login */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          لديك حساب بالفعل؟{" "}
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

export default RegisterForm;
