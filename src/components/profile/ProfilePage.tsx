import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Grid,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { UserService } from "../../services/firebaseService";
import { User } from "../../data/mockData";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  studentId?: string;
  bio: string;
  avatar: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    studentId: "",
    bio: "",
    avatar: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [avatarData, setAvatarData] = useState({
    avatarText: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.email?.split("@")[0] || "",
        email: user.email || "",
        phone: "",
        department: "",
        specialization: "",
        studentId: "",
        bio: "",
        avatar: "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string | boolean) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // محاكاة حفظ البيانات
      setSnackbar({
        open: true,
        message: "تم حفظ الملف الشخصي بنجاح",
        severity: "success",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setSnackbar({
        open: true,
        message: "خطأ في حفظ الملف الشخصي",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: "كلمة المرور الجديدة غير متطابقة",
        severity: "error",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // هنا يمكن إضافة منطق تغيير كلمة المرور
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);

      setSnackbar({
        open: true,
        message: "تم تغيير كلمة المرور بنجاح",
        severity: "success",
      });
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      setSnackbar({
        open: true,
        message: "خطأ في تغيير كلمة المرور",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = () => {
    if (avatarData.avatarText.trim()) {
      setFormData((prev) => ({
        ...prev,
        avatar: avatarData.avatarText.trim(),
      }));
      setShowAvatarDialog(false);
      setSnackbar({
        open: true,
        message: "تم حفظ الصورة الشخصية",
        severity: "success",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "مدير";
      case "supervisor":
        return "مشرف";
      case "student":
        return "طالب";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "supervisor":
        return "warning";
      case "student":
        return "primary";
      default:
        return "default";
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          يجب تسجيل الدخول للوصول إلى الملف الشخصي
        </Alert>
      </Container>
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
        <PersonIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          الملف الشخصي
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* معلومات أساسية */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Box
                sx={{ position: "relative", display: "inline-block", mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: "3rem",
                    bgcolor: "primary.main",
                  }}
                >
                  {formData.avatar || user.email?.charAt(0) || "م"}
                </Avatar>
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "background.paper",
                    border: "2px solid",
                    borderColor: "primary.main",
                  }}
                  onClick={() => setShowAvatarDialog(true)}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </Box>

              <Typography variant="h5" gutterBottom>
                {user.email?.split("@")[0] || "مستخدم"}
              </Typography>

              <Chip label="مستخدم" color="primary" sx={{ mb: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>

              {formData.bio && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {formData.bio}
                </Typography>
              )}

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(!isEditing)}
                  sx={{ mr: 1 }}
                >
                  {isEditing ? "إلغاء التعديل" : "تعديل الملف"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => setShowPasswordDialog(true)}
                >
                  تغيير كلمة المرور
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* تفاصيل الملف الشخصي */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                المعلومات الشخصية
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="الاسم الكامل"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    value={formData.email}
                    disabled
                    margin="normal"
                    helperText="لا يمكن تغيير البريد الإلكتروني"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="رقم الطالب"
                    value={formData.studentId}
                    onChange={(e) =>
                      handleInputChange("studentId", e.target.value)
                    }
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="القسم"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="التخصص"
                    value={formData.specialization}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="نبذة شخصية"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    حفظ التغييرات
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    إلغاء
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* إحصائيات المستخدم */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                إحصائيات الحساب
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      المشاريع
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="success.main">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      مكتملة
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="warning.main">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      نشطة
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h4" color="info.main">
                      0%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متوسط التقدم
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* حوار تغيير كلمة المرور */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تغيير كلمة المرور</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="كلمة المرور الحالية"
            type={passwordData.showCurrentPassword ? "text" : "password"}
            value={passwordData.currentPassword}
            onChange={(e) =>
              handlePasswordChange("currentPassword", e.target.value)
            }
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() =>
                    handlePasswordChange(
                      "showCurrentPassword",
                      !passwordData.showCurrentPassword
                    )
                  }
                >
                  {passwordData.showCurrentPassword ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              ),
            }}
          />
          <TextField
            fullWidth
            label="كلمة المرور الجديدة"
            type={passwordData.showNewPassword ? "text" : "password"}
            value={passwordData.newPassword}
            onChange={(e) =>
              handlePasswordChange("newPassword", e.target.value)
            }
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() =>
                    handlePasswordChange(
                      "showNewPassword",
                      !passwordData.showNewPassword
                    )
                  }
                >
                  {passwordData.showNewPassword ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              ),
            }}
          />
          <TextField
            fullWidth
            label="تأكيد كلمة المرور الجديدة"
            type={passwordData.showConfirmPassword ? "text" : "password"}
            value={passwordData.confirmPassword}
            onChange={(e) =>
              handlePasswordChange("confirmPassword", e.target.value)
            }
            margin="normal"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() =>
                    handlePasswordChange(
                      "showConfirmPassword",
                      !passwordData.showConfirmPassword
                    )
                  }
                >
                  {passwordData.showConfirmPassword ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading}
          >
            تغيير كلمة المرور
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار تغيير الصورة الشخصية */}
      <Dialog
        open={showAvatarDialog}
        onClose={() => setShowAvatarDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تغيير الصورة الشخصية</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            أدخل حرف أو رمز ليكون صورتك الشخصية
          </Typography>
          <TextField
            fullWidth
            label="الصورة الشخصية"
            value={avatarData.avatarText}
            onChange={(e) => setAvatarData({ avatarText: e.target.value })}
            margin="normal"
            inputProps={{ maxLength: 2 }}
            helperText="أقصى حرفين"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAvatarDialog(false)}>إلغاء</Button>
          <Button onClick={handleSaveAvatar} variant="contained">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProfilePage;
