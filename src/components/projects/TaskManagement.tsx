import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore,
  Add,
  Edit,
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
  Assignment,
  DateRange,
  Flag,
  Save,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { manageTaskByStudent } from "../../services/firebaseService";
import { Project, TodoItem } from "../../data/mockData";

interface TaskManagementProps {
  project: Project;
  onUpdate: () => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  project,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
    completed: false,
  });

  const isStudent = user?.role === "student";
  const canEditTasks =
    isStudent &&
    (project.studentId === user?.id ||
      project.students?.includes(user?.id || ""));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: string) => {
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

  const handleOpenTaskDialog = (task?: TodoItem) => {
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        completed: task.completed,
      });
    } else {
      setEditingTask(null);
      setTaskFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        completed: false,
      });
    }
    setTaskDialogOpen(true);
  };

  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setEditingTask(null);
    setError(null);
  };

  const handleSaveTask = async () => {
    if (!user || !canEditTasks) {
      setError("ليس لديك صلاحية لتعديل المهام");
      return;
    }

    if (!taskFormData.title.trim()) {
      setError("عنوان المهمة مطلوب");
      return;
    }

    if (!taskFormData.dueDate) {
      setError("تاريخ الاستحقاق مطلوب");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await manageTaskByStudent(project.id, {
        id: editingTask?.id,
        title: taskFormData.title,
        description: taskFormData.description,
        dueDate: taskFormData.dueDate,
        priority: taskFormData.priority,
        completed: taskFormData.completed,
        assignedTo: user.id,
      });

      if (result.success) {
        handleCloseTaskDialog();
        onUpdate();
      } else {
        setError("حدث خطأ أثناء حفظ المهمة");
      }
    } catch (error) {
      console.error("خطأ في حفظ المهمة:", error);
      setError("حدث خطأ أثناء حفظ المهمة");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskCompletion = async (task: TodoItem) => {
    if (!user || !canEditTasks) return;

    setLoading(true);
    try {
      const result = await manageTaskByStudent(project.id, {
        ...task,
        completed: !task.completed,
      });

      if (result.success) {
        onUpdate();
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة المهمة:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(dueDate) < new Date();
  };

  const completedTasks =
    project.todoList?.filter((task) => task.completed).length || 0;
  const totalTasks = project.todoList?.length || 0;
  const completionPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Box>
      {/* إحصائيات المهام */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            إحصائيات المهام
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2">التقدم العام</Typography>
              <Typography variant="body2">
                {completedTasks} من {totalTasks} (
                {Math.round(completionPercentage)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {canEditTasks && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenTaskDialog()}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              إضافة مهمة جديدة
            </Button>
          )}
        </CardContent>
      </Card>

      {/* قائمة المهام */}
      <Box>
        {project.todoList && project.todoList.length > 0 ? (
          project.todoList.map((task, index) => (
            <Accordion key={task.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: 2,
                  }}
                >
                  {canEditTasks ? (
                    <Checkbox
                      checked={task.completed}
                      onChange={() => handleToggleTaskCompletion(task)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : task.completed ? (
                    <CheckCircle color="success" />
                  ) : (
                    <RadioButtonUnchecked />
                  )}

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                        color: task.completed
                          ? "text.secondary"
                          : "text.primary",
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                      <Chip
                        label={getPriorityLabel(task.priority)}
                        color={getPriorityColor(task.priority) as any}
                        size="small"
                      />
                      {isOverdue(task.dueDate, task.completed) && (
                        <Chip label="متأخرة" color="error" size="small" />
                      )}
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2">
                      <strong>تاريخ الاستحقاق:</strong>{" "}
                      {formatDate(task.dueDate)}
                    </Typography>
                    {task.completedAt && (
                      <Typography variant="body2" color="success.main">
                        <strong>تم الإنجاز:</strong>{" "}
                        {formatDate(task.completedAt)}
                      </Typography>
                    )}
                  </Box>

                  {canEditTasks && (
                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleOpenTaskDialog(task)}
                      >
                        تعديل
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Assignment
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                لا توجد مهام حالياً
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {canEditTasks
                  ? "ابدأ بإضافة مهام جديدة لتنظيم عملك"
                  : "لم يتم إضافة أي مهام لهذا المشروع بعد"}
              </Typography>
              {canEditTasks && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenTaskDialog()}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  إضافة مهمة جديدة
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* حوار إضافة/تعديل المهمة */}
      <Dialog
        open={taskDialogOpen}
        onClose={handleCloseTaskDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Assignment color="primary" />
            <Typography variant="h6">
              {editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="عنوان المهمة"
              value={taskFormData.title}
              onChange={(e) =>
                setTaskFormData({ ...taskFormData, title: e.target.value })
              }
              required
            />

            <TextField
              fullWidth
              label="وصف المهمة"
              value={taskFormData.description}
              onChange={(e) =>
                setTaskFormData({
                  ...taskFormData,
                  description: e.target.value,
                })
              }
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="تاريخ الاستحقاق"
              type="date"
              value={taskFormData.dueDate}
              onChange={(e) =>
                setTaskFormData({ ...taskFormData, dueDate: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>الأولوية</InputLabel>
              <Select
                value={taskFormData.priority}
                onChange={(e) =>
                  setTaskFormData({
                    ...taskFormData,
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

            {editingTask && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={taskFormData.completed}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        completed: e.target.checked,
                      })
                    }
                  />
                }
                label="مهمة مكتملة"
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseTaskDialog} disabled={loading}>
            إلغاء
          </Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManagement;
