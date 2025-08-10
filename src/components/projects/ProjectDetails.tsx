import React, { useState, useEffect } from "react";
import TaskManagement from "./TaskManagement";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Tooltip,
  Divider,
  Badge,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Close,
  Edit,
  Share,
  Favorite,
  FavoriteBorder,
  CalendarToday,
  Person,
  School,
  Assignment,
  CheckCircle,
  RadioButtonUnchecked,
  Add,
  Delete,
  PriorityHigh,
  Schedule,
  Security,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import {
  Project,
  TodoItem,
  students,
  supervisors,
  checkUserPermissions,
} from "../../data/mockData";
import { ProjectService, UserService } from "../../services/firebaseService";

interface ProjectDetailsProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (project: Project) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// مكون To-Do List
const TodoList: React.FC<{
  todoList: TodoItem[];
  projectId: string;
  onUpdateTodo: (
    projectId: string,
    todoId: string,
    completed: boolean
  ) => Promise<void>;
  onAddTodo: (
    projectId: string,
    todo: Omit<TodoItem, "id" | "createdAt">
  ) => Promise<void>;
  onDeleteTodo: (projectId: string, todoId: string) => Promise<void>;
  canManageTodos: boolean;
  currentUserId: string;
}> = ({
  todoList,
  projectId,
  onUpdateTodo,
  onAddTodo,
  onDeleteTodo,
  canManageTodos,
  currentUserId,
}) => {
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    assignedTo: currentUserId,
  });

  const handleAddTodo = async () => {
    if (newTodo.title.trim()) {
      try {
        await onAddTodo(projectId, {
          ...newTodo,
          completed: false,
          assignedTo: currentUserId,
        });
        setNewTodo({
          title: "",
          description: "",
          priority: "medium",
          dueDate: "",
          assignedTo: currentUserId,
        });
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <PriorityHigh color="error" />;
      case "medium":
        return <Schedule color="warning" />;
      case "low":
        return <CheckCircle color="success" />;
      default:
        return <Schedule />;
    }
  };

  return (
    <Box>
      {/* إضافة مهمة جديدة - فقط للمشرفين والإداريين */}
      {canManageTodos && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" mb={2}>
            إضافة مهمة جديدة
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="عنوان المهمة"
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, title: e.target.value })
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="تاريخ الاستحقاق"
                type="date"
                value={newTodo.dueDate}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, dueDate: e.target.value })
                }
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>الأولوية</InputLabel>
                <Select
                  value={newTodo.priority}
                  onChange={(e) =>
                    setNewTodo({
                      ...newTodo,
                      priority: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  label="الأولوية"
                >
                  <MenuItem value="low">منخفضة</MenuItem>
                  <MenuItem value="medium">متوسطة</MenuItem>
                  <MenuItem value="high">عالية</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddTodo}
                disabled={!newTodo.title.trim()}
                fullWidth
              >
                إضافة المهمة
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="وصف المهمة"
                multiline
                rows={2}
                value={newTodo.description}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, description: e.target.value })
                }
                size="small"
              />
            </Grid>
          </Grid>
        </Card>
      )}

      {/* قائمة المهام */}
      <List>
        {todoList.map((todo, index) => (
          <React.Fragment key={todo.id}>
            <ListItem
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                backgroundColor: todo.completed
                  ? "action.hover"
                  : "background.paper",
                opacity: todo.completed ? 0.7 : 1,
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={todo.completed}
                  onChange={(e) =>
                    onUpdateTodo(projectId, todo.id, e.target.checked)
                  }
                  icon={<RadioButtonUnchecked />}
                  checkedIcon={<CheckCircle color="success" />}
                  disabled={!canManageTodos} // الطلاب فقط يمكنهم تحديث حالة المهام
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        textDecoration: todo.completed
                          ? "line-through"
                          : "none",
                        color: todo.completed
                          ? "text.secondary"
                          : "text.primary",
                      }}
                    >
                      {todo.title}
                    </Typography>
                    <Chip
                      icon={getPriorityIcon(todo.priority)}
                      label={
                        todo.priority === "high"
                          ? "عالية"
                          : todo.priority === "medium"
                          ? "متوسطة"
                          : "منخفضة"
                      }
                      color={getPriorityColor(todo.priority) as any}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box component="div">
                    <Box
                      component="div"
                      sx={{
                        mb: 1,
                        color: "text.secondary",
                        fontSize: "0.875rem",
                      }}
                    >
                      {todo.description}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Box
                        component="span"
                        sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                      >
                        تاريخ الاستحقاق:{" "}
                        {new Date(todo.dueDate).toLocaleDateString("ar-EG")}
                      </Box>
                      {todo.completed && todo.completedAt && (
                        <>
                          <CheckCircle fontSize="small" color="success" />
                          <Box
                            component="span"
                            sx={{ fontSize: "0.75rem", color: "success.main" }}
                          >
                            مكتملة في:{" "}
                            {new Date(todo.completedAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                {canManageTodos && (
                  <Tooltip title="حذف المهمة">
                    <IconButton
                      edge="end"
                      onClick={() => onDeleteTodo(projectId, todo.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItemSecondaryAction>
            </ListItem>
            {index < todoList.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {todoList.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            لا توجد مهام حالياً.{" "}
            {canManageTodos
              ? "أضف مهمة جديدة لبدء العمل على المشروع."
              : "سيتم إضافة المهام قريباً."}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  open,
  onClose,
  onEdit,
}) => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(project);
  const [allUsersList, setAllUsersList] = useState([
    ...students,
    ...supervisors,
  ]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // تحديث المشروع الحالي عند تغيير المشروع المحدد
  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  // جلب جميع المستخدمين
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await UserService.getAllUsers();
        setAllUsersList(users);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpdateTodo = async (
    projectId: string,
    todoId: string,
    completed: boolean
  ) => {
    try {
      await ProjectService.updateTodoStatus(projectId, todoId, completed);
      setSnackbar({
        open: true,
        message: completed ? "تم إكمال المهمة بنجاح" : "تم إلغاء إكمال المهمة",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      setSnackbar({
        open: true,
        message: "خطأ في تحديث المهمة",
        severity: "error",
      });
    }
  };

  const handleAddTodo = async (
    projectId: string,
    todo: Omit<TodoItem, "id" | "createdAt">
  ) => {
    try {
      await ProjectService.addTodoItem(projectId, todo);
      setSnackbar({
        open: true,
        message: "تم إضافة المهمة بنجاح",
        severity: "success",
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      setSnackbar({
        open: true,
        message: "خطأ في إضافة المهمة",
        severity: "error",
      });
    }
  };

  const handleDeleteTodo = async (projectId: string, todoId: string) => {
    try {
      await ProjectService.deleteTodoItem(projectId, todoId);
      setSnackbar({
        open: true,
        message: "تم حذف المهمة بنجاح",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      setSnackbar({
        open: true,
        message: "خطأ في حذف المهمة",
        severity: "error",
      });
    }
  };

  if (!currentProject) return null;

  const student = allUsersList.find((s) => s.id === currentProject.studentId);
  const supervisor = allUsersList.find(
    (s) => s.id === currentProject.supervisorId
  );

  // التحقق من الصلاحيات
  const canEdit = checkUserPermissions(user, currentProject, "edit");
  const canManageTodos = checkUserPermissions(
    user,
    currentProject,
    "manage_todos"
  );

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالية";
      case "medium":
        return "متوسطة";
      case "low":
        return "منخفضة";
      default:
        return priority;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Assignment sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              {currentProject.title}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="إضافة للمفضلة">
              <IconButton
                onClick={() => setIsFavorite(!isFavorite)}
                sx={{ color: "white" }}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
            <Tooltip title="إغلاق">
              <IconButton onClick={onClose} sx={{ color: "white" }}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 3 }}>
              <Tab label="نظرة عامة" />
              <Tab label="قائمة المهام" />
              <Tab label="الفريق" />
              <Tab label="الأنشطة" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* معلومات المشروع */}
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      وصف المشروع
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      {currentProject.description}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                      <Chip
                        label={getStatusText(currentProject.status)}
                        color={getStatusColor(currentProject.status) as any}
                        icon={<Assignment />}
                      />
                      <Chip
                        label={currentProject.type}
                        variant="outlined"
                        icon={<School />}
                      />
                      <Chip
                        label={getPriorityText(currentProject.priority)}
                        color={getPriorityColor(currentProject.priority) as any}
                        icon={<PriorityHigh />}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" mb={1}>
                        تقدم المشروع
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={currentProject.progress}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {currentProject.progress}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {currentProject.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* معلومات إضافية */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        معلومات المشروع
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday color="action" fontSize="small" />
                          <Typography variant="body2">
                            تاريخ الاستحقاق:{" "}
                            {new Date(
                              currentProject.dueDate
                            ).toLocaleDateString("ar-EG")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Assignment color="action" fontSize="small" />
                          <Typography variant="body2">
                            تاريخ الإنشاء:{" "}
                            {new Date(
                              currentProject.createdAt
                            ).toLocaleDateString("ar-EG")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Assignment color="action" fontSize="small" />
                          <Typography variant="body2">
                            آخر تحديث:{" "}
                            {new Date(
                              currentProject.updatedAt
                            ).toLocaleDateString("ar-EG")}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        إحصائيات سريعة
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            إجمالي المهام:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {currentProject.todoList.length}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            المهام المكتملة:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="success.main"
                          >
                            {
                              currentProject.todoList.filter(
                                (todo) => todo.completed
                              ).length
                            }
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            المهام المتبقية:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="warning.main"
                          >
                            {
                              currentProject.todoList.filter(
                                (todo) => !todo.completed
                              ).length
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TaskManagement
              project={currentProject}
              onUpdate={() => {
                // إعادة تحميل بيانات المشروع
                setCurrentProject({ ...currentProject });
                onEdit?.(currentProject);
              }}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {/* Team Members */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      أعضاء الفريق
                    </Typography>

                    <Grid container spacing={3}>
                      {/* المشرف */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mx: "auto",
                              mb: 2,
                              bgcolor: "primary.main",
                              fontSize: "2rem",
                            }}
                          >
                            {supervisor?.avatar}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600}>
                            {supervisor?.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                          >
                            مشرف المشروع
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                          >
                            {supervisor?.specialization}
                          </Typography>
                          <Button variant="outlined" size="small">
                            إرسال رسالة
                          </Button>
                        </Box>
                      </Grid>

                      {/* الطالب */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: "center", p: 2 }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mx: "auto",
                              mb: 2,
                              bgcolor: "secondary.main",
                              fontSize: "2rem",
                            }}
                          >
                            {student?.avatar}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600}>
                            {student?.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                          >
                            طالب
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                          >
                            {student?.specialization}
                          </Typography>
                          <Button variant="outlined" size="small">
                            إرسال رسالة
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Project Info */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      معلومات الاتصال
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box>
                        <Typography variant="subtitle2" color="primary" mb={1}>
                          المشرف
                        </Typography>
                        <Typography variant="body2" mb={1}>
                          {supervisor?.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {supervisor?.phone}
                        </Typography>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="secondary"
                          mb={1}
                        >
                          الطالب
                        </Typography>
                        <Typography variant="body2" mb={1}>
                          {student?.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student?.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  الأنشطة الحديثة
                </Typography>

                <List>
                  {currentProject.todoList
                    .filter((todo) => todo.completed)
                    .sort(
                      (a, b) =>
                        new Date(b.completedAt || "").getTime() -
                        new Date(a.completedAt || "").getTime()
                    )
                    .slice(0, 5)
                    .map((todo) => (
                      <ListItem key={todo.id}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={todo.title}
                          secondary={`تم إكمالها في ${new Date(
                            todo.completedAt || ""
                          ).toLocaleDateString("ar-EG")}`}
                        />
                      </ListItem>
                    ))}
                </List>

                {currentProject.todoList.filter((todo) => todo.completed)
                  .length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      لا توجد أنشطة حديثة حالياً.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() => {
              // سيتم إضافة وظيفة المشاركة لاحقاً
            }}
          >
            مشاركة
          </Button>
          {canEdit && onEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => onEdit(currentProject)}
            >
              تعديل
            </Button>
          )}
          <Button
            variant="contained"
            onClick={onClose}
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
    </>
  );
};

export default ProjectDetails;
