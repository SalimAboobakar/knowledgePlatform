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
  LinearProgress,
  Fab,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Search,
  ViewModule,
  ViewList,
  Add,
  Edit,
  Delete,
  Visibility,
  Assignment,
  CalendarToday,
  Security,
} from "@mui/icons-material";
import ProjectCard from "./ProjectCard";
import ProjectForm from "./ProjectForm";
import ProjectDetails from "./ProjectDetails";
import CreateProjectForm from "./CreateProjectForm";
import FirebaseErrorHandler from "../common/FirebaseErrorHandler";
import { useAuth } from "../../hooks/useAuth";
import {
  Project,
  academicTags,
  projectTypes,
  filterProjectsByUserRole,
  checkUserPermissions,
  allUsers,
} from "../../data/mockData";
import { ProjectService, UserService } from "../../services/firebaseService";

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsersList, setAllUsersList] = useState(allUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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

  // دالة جلب البيانات من Firebase
  const loadData = React.useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // جلب البيانات الحقيقية من Firebase

      // جلب المشاريع حسب دور المستخدم
      const userProjects = await ProjectService.getProjectsByUserRole(user);
      setProjects(userProjects);

      // جلب المستخدمين حسب دور المستخدم الحالي
      if (user.role === "admin") {
        // الإداريون يمكنهم رؤية جميع المستخدمين
        const users = await UserService.getAllUsers();
        setAllUsersList(users);
      } else if (user.role === "supervisor") {
        // المشرفون يمكنهم رؤية جميع الطلاب وجميع المشرفين
        try {
          const [allStudents, allSupervisors] = await Promise.all([
            UserService.getUsersByRole("student"),
            UserService.getUsersByRole("supervisor")
          ]);
          console.log("📚 Students loaded:", allStudents.length);
          console.log("👨‍🏫 Supervisors loaded:", allSupervisors.length);
          setAllUsersList([...allStudents, ...allSupervisors]);
        } catch (error) {
          console.error("خطأ في جلب المستخدمين:", error);
          setAllUsersList([]);
        }
      } else {
        // الطلاب يمكنهم رؤية مشرفيهم فقط
        try {
          const supervisors = await UserService.getUsersByRole("supervisor");
          // تصفية المشرفين حسب تخصص الطالب
          const filteredSupervisors = supervisors.filter(
            (supervisor) => supervisor.specialization === user.specialization
          );
          setAllUsersList(filteredSupervisors);
        } catch (error) {
          console.error("❌ Error loading supervisors from Firebase:", error);
          setAllUsersList([]);
        }
      }

      setError(null);
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      console.error("❌ Error details:", {
        message: err?.message || "Unknown error",
        stack: err?.stack,
        user: user,
      });
      setError("خطأ في تحميل البيانات");
      setSnackbar({
        open: true,
        message: `خطأ في تحميل البيانات: ${err?.message || "خطأ غير معروف"}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // جلب البيانات من Firebase
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // الاستماع للتغييرات في المشاريع - TEMPORARILY DISABLED
  useEffect(() => {
    if (!user) return;

    // تم تعطيل متابعة المشاريع مؤقتاً

    // TODO: Re-enable this once we've confirmed the permission issue is resolved
    // try {
    //   const unsubscribe = ProjectService.subscribeToProjects(
    //     user,
    //     (updatedProjects) => {
    //       console.log(
    //         "📋 Project subscription update received:",
    //         updatedProjects.length,
    //         "projects"
    //       );
    //       setProjects(updatedProjects);
    //     }
    //   );

    //   return () => {
    //     console.log("🔌 Cleaning up project subscription");
    //     unsubscribe();
    //   };
    // } catch (error) {
    //   console.error("❌ Error setting up project subscription:", error);
    // }
  }, [user]);

  // تصفية المشاريع حسب دور المستخدم
  const userProjects = filterProjectsByUserRole(projects, user);

  const filteredProjects = userProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "dueDate":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "progress":
        return b.progress - a.progress;
      case "updatedAt":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  const stats = [
    {
      title: "إجمالي المشاريع",
      value: userProjects.length,
      color: "primary.main",
      icon: <Assignment />,
    },
    {
      title: "المشاريع النشطة",
      value: userProjects.filter((p) => p.status === "active").length,
      color: "success.main",
      icon: <Assignment />,
    },
    {
      title: "قيد المراجعة",
      value: userProjects.filter((p) => p.status === "review").length,
      color: "warning.main",
      icon: <Assignment />,
    },
    {
      title: "مكتملة",
      value: userProjects.filter((p) => p.status === "completed").length,
      color: "info.main",
      icon: <Assignment />,
    },
  ];

  const handleProjectClick = (project: Project) => {
    if (checkUserPermissions(user, project, "view")) {
      setSelectedProject(project);
      setIsDetailsOpen(true);
    }
  };

  const handleCreateProject = () => {
    // فقط المشرفون والإداريون يمكنهم إنشاء مشاريع
    if (user?.role === "supervisor" || user?.role === "admin") {
      setEditingProject(null);
      setIsFormOpen(true);
    }
  };

  const handleEditProject = (project: Project) => {
    if (checkUserPermissions(user, project, "edit")) {
      setEditingProject(project);
      setIsFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleFormSubmit = async (projectData: any) => {
    try {
      if (editingProject) {
        // تحديث مشروع موجود
        await ProjectService.updateProject(editingProject.id, projectData);
        setSnackbar({
          open: true,
          message: "تم تحديث المشروع بنجاح",
          severity: "success",
        });
      } else {
        // إنشاء مشروع جديد
        await ProjectService.createProject({
          ...projectData,
          progress: 0,
          todoList: [],
        });
        setSnackbar({
          open: true,
          message: "تم إنشاء المشروع بنجاح",
          severity: "success",
        });
      }
      handleFormClose();
    } catch (error) {
      console.error("Error saving project:", error);
      setSnackbar({
        open: true,
        message: "خطأ في حفظ المشروع",
        severity: "error",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await ProjectService.deleteProject(projectId);
      setSnackbar({
        open: true,
        message: "تم حذف المشروع بنجاح",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      setSnackbar({
        open: true,
        message: "خطأ في حذف المشروع",
        severity: "error",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "default";
      case "active":
        return "primary";
      case "review":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planning":
        return "قيد التخطيط";
      case "active":
        return "نشط";
      case "review":
        return "قيد المراجعة";
      case "completed":
        return "مكتمل";
      default:
        return status;
    }
  };

  const getRoleDisplayText = () => {
    switch (user?.role) {
      case "student":
        return "طالب";
      case "supervisor":
        return "مشرف";
      case "admin":
        return "إداري";
      default:
        return "مستخدم";
    }
  };

  const students = React.useMemo(() => {
    const filtered = allUsersList.filter((u) => u.role === "student");
    // إزالة التكرار حسب ID
    const uniqueStudents = filtered.filter(
      (student, index, self) =>
        index === self.findIndex((s) => s.id === student.id)
    );
    // console.log("🔍 Students in ProjectsPage (unique):", uniqueStudents);
    return uniqueStudents;
  }, [allUsersList]);
  const supervisors = React.useMemo(() => {
    const filtered = allUsersList.filter((u) => u.role === "supervisor");
    // إزالة التكرار حسب ID
    const uniqueSupervisors = filtered.filter(
      (supervisor, index, self) =>
        index === self.findIndex((s) => s.id === supervisor.id)
    );
    console.log("👨‍🏫 Supervisors in ProjectsPage (unique):", uniqueSupervisors.length, uniqueSupervisors.map(s => s.name));
    return uniqueSupervisors;
  }, [allUsersList]);

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
    <Box
      sx={{
        p: 0.5,
        width: "100%",
        maxWidth: "none",
        overflow: "hidden",
        margin: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            إدارة المشاريع
          </Typography>
          <Chip
            icon={<Security />}
            label={getRoleDisplayText()}
            color="primary"
            variant="outlined"
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          {user?.role === "student" && "مشاريعك الأكاديمية"}
          {user?.role === "supervisor" && "المشاريع التي تشرف عليها"}
          {user?.role === "admin" && "جميع المشاريع الأكاديمية"}
        </Typography>
      </Box>

      {/* Error Handler */}
      {error && (
        <FirebaseErrorHandler
          error={{ message: error }}
          onRetry={() => {
            setError(null);
            setLoading(true);
            // إعادة تحميل البيانات
            if (user) {
              loadData();
            }
          }}
          title="خطأ في تحميل المشاريع"
        />
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 2, width: "100%" }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} lg={2} key={index}>
            <Card
              sx={{
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                },
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
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="البحث في المشاريع..."
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
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="الحالة"
                >
                  <MenuItem value="all">جميع الحالات</MenuItem>
                  <MenuItem value="planning">قيد التخطيط</MenuItem>
                  <MenuItem value="active">نشط</MenuItem>
                  <MenuItem value="review">قيد المراجعة</MenuItem>
                  <MenuItem value="completed">مكتمل</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>الأولوية</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="الأولوية"
                >
                  <MenuItem value="all">جميع الأولويات</MenuItem>
                  <MenuItem value="high">عالية</MenuItem>
                  <MenuItem value="medium">متوسطة</MenuItem>
                  <MenuItem value="low">منخفضة</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>ترتيب حسب</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="ترتيب حسب"
                >
                  <MenuItem value="updatedAt">آخر تحديث</MenuItem>
                  <MenuItem value="title">العنوان</MenuItem>
                  <MenuItem value="dueDate">تاريخ الاستحقاق</MenuItem>
                  <MenuItem value="progress">التقدم</MenuItem>
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
          </Grid>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      {sortedProjects.length > 0 &&
        (viewMode === "grid" ? (
          <Grid container spacing={3} sx={{ width: "100%", mt: 0 }}>
            {sortedProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={project.id}>
                <ProjectCard
                  project={project}
                  onClick={() => handleProjectClick(project)}
                  onEdit={
                    checkUserPermissions(user, project, "edit")
                      ? () => handleEditProject(project)
                      : undefined
                  }
                  onDelete={
                    checkUserPermissions(user, project, "delete")
                      ? () => handleDeleteProject(project.id)
                      : undefined
                  }
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={2}>
            {sortedProjects.map((project) => (
              <Card
                key={project.id}
                sx={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={() => handleProjectClick(project)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {project.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mb: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={getStatusText(project.status)}
                          color={getStatusColor(project.status) as any}
                          size="small"
                        />
                        <Chip
                          label={project.type}
                          variant="outlined"
                          size="small"
                        />
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(project.dueDate).toLocaleDateString(
                              "ar-EG"
                            )}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Assignment fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {project.todoList.length} مهام
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            التقدم
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {project.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {checkUserPermissions(user, project, "edit") && (
                        <Tooltip title="تعديل المشروع">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                      {checkUserPermissions(user, project, "delete") && (
                        <Tooltip title="حذف المشروع">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="عرض التفاصيل">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProjectClick(project);
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
        ))}

      {/* Empty State */}
      {sortedProjects.length === 0 && (
        <Card
          sx={{
            textAlign: "center",
            py: 8,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "2px dashed",
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "#4a5568" : "#cbd5e1",
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Assignment
              sx={{
                fontSize: 64,
                color: "text.secondary",
                mb: 2,
                opacity: 0.6,
              }}
            />
            <Typography variant="h6" color="text.secondary" mb={1}>
              لا توجد مشاريع
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {user?.role === "student" && "لا توجد مشاريع مخصصة لك حالياً"}
              {user?.role === "supervisor" &&
                "لا توجد مشاريع تشرف عليها حالياً"}
              {user?.role === "admin" && "لا توجد مشاريع في النظام حالياً"}
            </Typography>
            {(user?.role === "supervisor" || user?.role === "admin") && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateProject}
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  },
                }}
              >
                إنشاء مشروع جديد
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button - للمشرفين */}
      {user?.role === "supervisor" && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setIsCreateFormOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Floating Action Button - للإداريين */}
      {user?.role === "admin" && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreateProject}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Dialogs */}
      <ProjectForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        project={editingProject}
        students={students}
        supervisors={supervisors}
        tags={academicTags}
        projectTypes={projectTypes}
      />

      {/* Debug info */}
      {isFormOpen && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: "1px solid #ddd",
            borderRadius: 1,
            bgcolor: "#f5f5f5",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            معلومات التصحيح:
          </Typography>
          <Typography variant="body2">
            عدد المستخدمين الإجمالي: {allUsersList.length}
          </Typography>
          <Typography variant="body2">
            عدد الطلاب:{" "}
            {allUsersList.filter((u) => u.role === "student").length}
          </Typography>
          <Typography variant="body2">
            عدد المشرفين:{" "}
            {allUsersList.filter((u) => u.role === "supervisor").length}
          </Typography>
          <Typography variant="body2">
            دور المستخدم الحالي: {user?.role}
          </Typography>
          <Typography variant="body2">
            تخصص المستخدم الحالي: {user?.specialization || "غير محدد"}
          </Typography>
        </Box>
      )}

      {/* أدوات الإدارة محذوفة - النظام يعمل بالبيانات الحقيقية */}
      <ProjectDetails
        project={selectedProject}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={
          selectedProject && checkUserPermissions(user, selectedProject, "edit")
            ? handleEditProject
            : undefined
        }
      />

      {/* نموذج إنشاء مشروع جديد للمشرفين */}
      <CreateProjectForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: "تم إنشاء المشروع بنجاح",
            severity: "success",
          });
          loadData();
        }}
      />

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

export default ProjectsPage;
