import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    messages: boolean;
    reminders: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "supervisors";
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "auto";
    language: "ar" | "en";
    fontSize: "small" | "medium" | "large";
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    loginNotifications: boolean;
  };
}

const defaultSettings: Settings = {
  notifications: {
    email: true,
    push: true,
    projectUpdates: true,
    messages: true,
    reminders: true,
  },
  privacy: {
    profileVisibility: "supervisors",
    showEmail: true,
    showPhone: false,
    allowMessages: true,
  },
  appearance: {
    theme: "light",
    language: "ar",
    fontSize: "medium",
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
  },
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  const handleSettingChange = (
    section: keyof Settings,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // حفظ الإعدادات محلياً
      localStorage.setItem("userSettings", JSON.stringify(settings));

      // محاكاة حفظ الإعدادات في Firebase
      console.log("Settings saved:", settings);

      setSnackbar({
        open: true,
        message: "تم حفظ الإعدادات بنجاح",
        severity: "success",
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "خطأ في حفظ الإعدادات",
        severity: "error",
      });
    }
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("userSettings");
    setSnackbar({
      open: true,
      message: "تم إعادة تعيين الإعدادات",
      severity: "info",
    });
  };

  if (!user) {
    return (
      <Box
        sx={{
          p: 0.5,
          width: "100%",
          maxWidth: "none",
          overflow: "hidden",
          margin: 0,
        }}
      >
        <Alert severity="warning">يجب تسجيل الدخول للوصول إلى الإعدادات</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 0.5,
        width: "100%",
        maxWidth: "none",
        overflow: "hidden",
        margin: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <SettingsIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          الإعدادات
        </Typography>
      </Box>

      {/* معلومات المستخدم */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h6">معلومات الحساب</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
                  {user.email?.charAt(0) || "م"}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {user.email?.split("@")[0] || "مستخدم"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Chip
                    label="مستخدم"
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "إلغاء التعديل" : "تعديل الإعدادات"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* إعدادات الإشعارات */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">الإشعارات</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications",
                          "email",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="إشعارات البريد الإلكتروني"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications",
                          "push",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="إشعارات الموقع"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.projectUpdates}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications",
                          "projectUpdates",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="تحديثات المشاريع"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.messages}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications",
                          "messages",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="الرسائل الجديدة"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.reminders}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications",
                          "reminders",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="التذكيرات"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* إعدادات الخصوصية */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">الخصوصية</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>رؤية الملف الشخصي</InputLabel>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) =>
                      handleSettingChange(
                        "privacy",
                        "profileVisibility",
                        e.target.value
                      )
                    }
                    label="رؤية الملف الشخصي"
                  >
                    <MenuItem value="public">عام</MenuItem>
                    <MenuItem value="supervisors">المشرفون فقط</MenuItem>
                    <MenuItem value="private">خاص</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showEmail}
                      onChange={(e) =>
                        handleSettingChange(
                          "privacy",
                          "showEmail",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="إظهار البريد الإلكتروني"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showPhone}
                      onChange={(e) =>
                        handleSettingChange(
                          "privacy",
                          "showPhone",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="إظهار رقم الهاتف"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.allowMessages}
                      onChange={(e) =>
                        handleSettingChange(
                          "privacy",
                          "allowMessages",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="السماح بالرسائل"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* إعدادات المظهر */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PaletteIcon sx={{ mr: 1 }} />
                <Typography variant="h6">المظهر</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>المظهر</InputLabel>
                  <Select
                    value={settings.appearance.theme}
                    onChange={(e) =>
                      handleSettingChange("appearance", "theme", e.target.value)
                    }
                    label="المظهر"
                  >
                    <MenuItem value="light">فاتح</MenuItem>
                    <MenuItem value="dark">داكن</MenuItem>
                    <MenuItem value="auto">تلقائي</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>اللغة</InputLabel>
                  <Select
                    value={settings.appearance.language}
                    onChange={(e) =>
                      handleSettingChange(
                        "appearance",
                        "language",
                        e.target.value
                      )
                    }
                    label="اللغة"
                  >
                    <MenuItem value="ar">العربية</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>حجم الخط</InputLabel>
                  <Select
                    value={settings.appearance.fontSize}
                    onChange={(e) =>
                      handleSettingChange(
                        "appearance",
                        "fontSize",
                        e.target.value
                      )
                    }
                    label="حجم الخط"
                  >
                    <MenuItem value="small">صغير</MenuItem>
                    <MenuItem value="medium">متوسط</MenuItem>
                    <MenuItem value="large">كبير</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* إعدادات الأمان */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">الأمان</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) =>
                        handleSettingChange(
                          "security",
                          "twoFactorAuth",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="المصادقة الثنائية"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.loginNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "security",
                          "loginNotifications",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                    />
                  }
                  label="إشعارات تسجيل الدخول"
                />
                <TextField
                  label="مهلة الجلسة (دقائق)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  disabled={!isEditing}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* أزرار الحفظ */}
      {isEditing && (
        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            color="primary"
          >
            حفظ الإعدادات
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetSettings}
            color="warning"
          >
            إعادة تعيين
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
