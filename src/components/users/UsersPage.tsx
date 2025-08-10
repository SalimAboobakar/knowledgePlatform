import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stack,
} from "@mui/material";
import {
  Search,
  ViewModule,
  ViewList,
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  School,
  Security,
  Email,
  CalendarToday,
  AdminPanelSettings,
  SupervisorAccount,
  Group,
  PersonAdd,
  LocationOn,
  Phone,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../data/mockData";
import { UserService } from "../../services/firebaseService";

interface UsersPageProps {}

const UsersPage: React.FC<UsersPageProps> = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // جلب البيانات من Firebase
  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser || currentUser.role !== "admin") {
        return;
      }

      try {
        setLoading(true);
        const allUsers = await UserService.getAllUsers();
        setUsers(allUsers);
        setError(null);
      } catch (err) {
        console.error("Error loading users:", err);
        setError("خطأ في تحميل البيانات");
        setSnackbar({
          open: true,
          message: "خطأ في تحميل البيانات",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser]);

  // تصفية المستخدمين حسب الصلاحيات
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.specialization || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "all" || user.department === departmentFilter;

    // الإداريون فقط يمكنهم رؤية جميع المستخدمين
    const hasPermission = currentUser?.role === "admin";

    return matchesSearch && matchesRole && matchesDepartment && hasPermission;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // ترتيب حسب الدور أولاً، ثم حسب الاسم
    const roleOrder = { admin: 1, supervisor: 2, student: 3 };
    const aRoleOrder = roleOrder[a.role as keyof typeof roleOrder] || 4;
    const bRoleOrder = roleOrder[b.role as keyof typeof roleOrder] || 4;

    if (aRoleOrder !== bRoleOrder) {
      return aRoleOrder - bRoleOrder;
    }

    return (a.name || "").localeCompare(b.name || "");
  });

  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: users.length,
      color: "primary.main",
      icon: <Group />,
    },
    {
      title: "الطلاب",
      value: users.filter((u) => u.role === "student").length,
      color: "success.main",
      icon: <Person />,
    },
    {
      title: "المشرفون",
      value: users.filter((u) => u.role === "supervisor").length,
      color: "warning.main",
      icon: <SupervisorAccount />,
    },
    {
      title: "الإداريون",
      value: users.filter((u) => u.role === "admin").length,
      color: "error.main",
      icon: <AdminPanelSettings />,
    },
  ];

  const departments = Array.from(
    new Set(users.map((u) => u.department).filter(Boolean))
  ).sort();

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleCreateUser = () => {
    // فقط الإداريون يمكنهم إنشاء مستخدمين جدد
    if (currentUser?.role === "admin") {
      setEditingUser(null);
      setIsFormOpen(true);
    }
  };

  const handleEditUser = (user: User) => {
    // فقط الإداريون يمكنهم تعديل المستخدمين
    if (currentUser?.role === "admin") {
      setEditingUser(user);
      setIsFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async (userData: any) => {
    try {
      if (editingUser) {
        // تحديث مستخدم موجود
        await UserService.updateUser(editingUser.id, userData);
        setSnackbar({
          open: true,
          message: "تم تحديث المستخدم بنجاح",
          severity: "success",
        });
      } else {
        // إنشاء مستخدم جديد
        const userId = await UserService.createUser(userData);
        setSnackbar({
          open: true,
          message: "تم إنشاء المستخدم بنجاح",
          severity: "success",
        });
      }
      handleFormClose();

      // إعادة تحميل البيانات
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error saving user:", error);
      setSnackbar({
        open: true,
        message: "خطأ في حفظ المستخدم",
        severity: "error",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await UserService.deleteUser(userId);
      setSnackbar({
        open: true,
        message: "تم حذف المستخدم بنجاح",
        severity: "success",
      });

      // إعادة تحميل البيانات
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: "خطأ في حذف المستخدم",
        severity: "error",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "supervisor":
        return "warning";
      case "student":
        return "success";
      default:
        return "default";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "إداري";
      case "supervisor":
        return "مشرف";
      case "student":
        return "طالب";
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <AdminPanelSettings />;
      case "supervisor":
        return <SupervisorAccount />;
      case "student":
        return <Person />;
      default:
        return <Person />;
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          جاري تحميل البيانات...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            إدارة المستخدمين
          </Typography>
          <Chip
            icon={<Security />}
            label={currentUser.role === "admin" ? "إداري" : "مشرف"}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          {currentUser.role === "admin"
            ? "إدارة جميع المستخدمين في النظام"
            : "إدارة الطلاب المخصصين لك"}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color={stat.color}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters and Search */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="البحث في المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>الدور</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="الدور"
                >
                  <MenuItem value="all">جميع الأدوار</MenuItem>
                  <MenuItem value="student">طلاب</MenuItem>
                  <MenuItem value="supervisor">مشرفون</MenuItem>
                  {currentUser.role === "admin" && (
                    <MenuItem value="admin">إداريون</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>القسم</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="القسم"
                >
                  <MenuItem value="all">جميع الأقسام</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="عرض شبكي">
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                  >
                    <ViewModule />
                  </IconButton>
                </Tooltip>
                <Tooltip title="عرض قائمة">
                  <IconButton
                    onClick={() => setViewMode("list")}
                    color={viewMode === "list" ? "primary" : "default"}
                  >
                    <ViewList />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {currentUser.role === "admin" && (
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleCreateUser}
                  fullWidth
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  إضافة مستخدم
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Users Grid/List */}
      {viewMode === "grid" ? (
        <Grid container spacing={3}>
          {sortedUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
              <Card
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-4px)",
                  },
                }}
                onClick={() => handleUserClick(user)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        fontSize: "1.5rem",
                        bgcolor: `${getRoleColor(user.role)}.main`,
                      }}
                    >
                      {user.avatar || (user.name ? user.name.charAt(0) : "م")}
                    </Avatar>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={getRoleText(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {currentUser.role === "admin" && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* User Info */}
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    {user.name || "مستخدم بدون اسم"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {user.email || "بريد إلكتروني غير محدد"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <School fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {user.department || "قسم غير محدد"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {user.specialization || "تخصص غير محدد"}
                      </Typography>
                    </Box>
                    {user.phone && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {user.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Additional Info */}
                  {user.studentId && (
                    <Chip
                      label={`رقم الطالب: ${user.studentId}`}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                  {user.supervisorId && (
                    <Chip
                      label={`رقم المشرف: ${user.supervisorId}`}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack spacing={2}>
          {sortedUsers.map((user) => (
            <Card
              key={user.id}
              sx={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={() => handleUserClick(user)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        fontSize: "1.25rem",
                        bgcolor: `${getRoleColor(user.role)}.main`,
                      }}
                    >
                      {user.avatar || (user.name ? user.name.charAt(0) : "م")}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={0.5}>
                        {user.name || "مستخدم بدون اسم"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {user.email || "بريد إلكتروني غير محدد"}
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={getRoleText(user.role)}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {user.department || "قسم غير محدد"} -{" "}
                          {user.specialization || "تخصص غير محدد"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {currentUser.role === "admin" && (
                      <>
                        <Tooltip title="تعديل المستخدم">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف المستخدم">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="عرض التفاصيل">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Empty State */}
      {sortedUsers.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Group sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            لا توجد مستخدمين
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {currentUser.role === "admin"
              ? "لا توجد مستخدمين في النظام حالياً"
              : "لا توجد طلاب مخصصين لك حالياً"}
          </Typography>
          {currentUser.role === "admin" && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleCreateUser}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              إضافة مستخدم جديد
            </Button>
          )}
        </Box>
      )}

      {/* Floating Action Button - فقط للإداريين */}
      {currentUser.role === "admin" && (
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={handleCreateUser}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          إضافة مستخدم
        </Button>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: selectedUser
                  ? `${getRoleColor(selectedUser.role)}.main`
                  : "primary.main",
              }}
            >
              {selectedUser?.avatar ||
                (selectedUser?.name ? selectedUser.name.charAt(0) : "م")}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedUser?.name || "مستخدم بدون اسم"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email || "بريد إلكتروني غير محدد"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" mb={2}>
                  المعلومات الشخصية
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      الاسم
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.name || "مستخدم بدون اسم"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      البريد الإلكتروني
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.email || "بريد إلكتروني غير محدد"}
                    </Typography>
                  </Box>
                  {selectedUser.phone && (
                    <Box>
                      <Typography variant="subtitle2" color="primary">
                        رقم الهاتف
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" mb={2}>
                  المعلومات الأكاديمية
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      الدور
                    </Typography>
                    <Chip
                      icon={getRoleIcon(selectedUser.role)}
                      label={getRoleText(selectedUser.role)}
                      color={getRoleColor(selectedUser.role) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      القسم
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.department || "قسم غير محدد"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="primary">
                      التخصص
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.specialization || "تخصص غير محدد"}
                    </Typography>
                  </Box>
                  {selectedUser.studentId && (
                    <Box>
                      <Typography variant="subtitle2" color="primary">
                        رقم الطالب
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.studentId}
                      </Typography>
                    </Box>
                  )}
                  {selectedUser.supervisorId && (
                    <Box>
                      <Typography variant="subtitle2" color="primary">
                        رقم المشرف
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.supervisorId}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {currentUser.role === "admin" && selectedUser && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {
                setIsDetailsOpen(false);
                handleEditUser(selectedUser);
              }}
            >
              تعديل
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => setIsDetailsOpen(false)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default UsersPage;
