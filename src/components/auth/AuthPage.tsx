import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Avatar,
  Divider,
  useTheme,
} from "@mui/material";
import {
  School,
  Person,
  Lock,
  AutoAwesome,
  Psychology,
  Chat,
  Analytics,
} from "@mui/icons-material";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuth } from "../../hooks/useAuth";

type AuthMode = "login" | "register" | "forgot";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();

  // إذا كان المستخدم مسجل دخول، اعرض رسالة ترحيب
  if (isAuthenticated && user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: 6,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: 4,
              border: "1px solid rgba(148, 163, 184, 0.1)",
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
              {user.profile?.firstName?.charAt(0) ||
                user.name?.charAt(0) ||
                user.avatar ||
                "م"}
            </Avatar>

            <Typography variant="h3" mb={2} fontWeight={700} color="primary">
              مرحباً بك! 🎓
            </Typography>

            <Typography
              variant="h5"
              mb={3}
              fontWeight={600}
              color="text.primary"
            >
              {user.profile?.firstName && user.profile?.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : user.name || "مستخدم جديد"}
            </Typography>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 3,
                py: 1,
                borderRadius: 20,
                bgcolor: "primary.main",
                color: "white",
                mb: 3,
              }}
            >
              <Person sx={{ fontSize: 20 }} />
              <Typography variant="body1" fontWeight={500}>
                {user.role === "student" ? "طالب" : "مشرف"}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" color="text.secondary" mb={1}>
              {user.profile?.university || "جامعة السلطان قابوس"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.profile?.department || user.department} •{" "}
              {user.profile?.specialization || user.specialization}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  const handleModeChange = (event: React.SyntheticEvent, newMode: AuthMode) => {
    setMode(newMode);
  };

  const handleSwitchToLogin = () => {
    setMode("login");
  };

  const handleRegistrationSuccess = () => {
    setMode("login");
  };

  const handleSwitchToRegister = () => {
    setMode("register");
  };

  const handleSwitchToForgot = () => {
    setMode("forgot");
  };

  const renderAuthForm = () => {
    switch (mode) {
      case "login":
        return (
          <LoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgot={handleSwitchToForgot}
          />
        );
      case "register":
        return (
          <RegisterForm
            onSuccess={handleRegistrationSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case "forgot":
        return <ForgotPasswordForm onSwitchToLogin={handleSwitchToLogin} />;
      default:
        return (
          <LoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgot={handleSwitchToForgot}
          />
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 0,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 4,
            border: "1px solid rgba(148, 163, 184, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", minHeight: 600 }}>
            {/* الجانب الأيسر - معلومات المنصة */}
            <Box
              sx={{
                flex: 1,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                p: 6,
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>\')',
                  opacity: 0.3,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 4,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  fontSize: "2.5rem",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <School />
              </Avatar>

              <Typography
                variant="h2"
                mb={2}
                fontWeight={700}
                sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                منصة عمان المعرفية
              </Typography>

              <Typography
                variant="h6"
                mb={6}
                sx={{ opacity: 0.9, fontWeight: 300 }}
              >
                منصة إدارة المشاريع الأكاديمية المتقدمة
              </Typography>

              <Box sx={{ maxWidth: 350, width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <AutoAwesome sx={{ mr: 2, color: "#FFD700" }} />
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    إدارة مشاريع ذكية
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Psychology sx={{ mr: 2, color: "#4CAF50" }} />
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    مساعد ذكي للأسئلة
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Chat sx={{ mr: 2, color: "#2196F3" }} />
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    مراسلة فورية
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Analytics sx={{ mr: 2, color: "#FF5722" }} />
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    تحليلات متقدمة
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* الجانب الأيمن - نموذج تسجيل الدخول */}
            <Box
              sx={{
                flex: 1,
                p: 6,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  mb={1}
                  color="text.primary"
                >
                  {mode === "login" && "تسجيل الدخول"}
                  {mode === "register" && "حساب جديد"}
                  {mode === "forgot" && "نسيت كلمة المرور"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {mode === "login" &&
                    "سجل دخولك للوصول إلى منصة عمان المعرفية"}
                  {mode === "register" &&
                    "أنشئ حسابك الجديد في منصة عمان المعرفية"}
                  {mode === "forgot" && "أعد تعيين كلمة المرور الخاصة بك"}
                </Typography>
              </Box>

              {/* Tabs */}
              <Box sx={{ mb: 4 }}>
                <Tabs
                  value={mode}
                  onChange={handleModeChange}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "text.secondary",
                      "&.Mui-selected": {
                        color: "primary.main",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      height: 3,
                      borderRadius: "3px 3px 0 0",
                      backgroundColor: "primary.main",
                    },
                  }}
                >
                  <Tab
                    icon={<Lock />}
                    label="تسجيل الدخول"
                    value="login"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<Person />}
                    label="حساب جديد"
                    value="register"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<Lock />}
                    label="نسيت كلمة المرور"
                    value="forgot"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* النموذج */}
              {renderAuthForm()}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthPage;
