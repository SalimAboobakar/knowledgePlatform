import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  Stack,
} from "@mui/material";
import {
  Add,
  Assignment,
  Group,
  DateRange,
  Description,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import {
  UserService,
  createProjectBySupervisor,
} from "../../services/firebaseService";
import { User } from "../../data/mockData";

interface CreateProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    dueDate: "",
    selectedStudents: [] as User[],
  });

  const projectTypes = [
    "مشروع تخرج",
    "مشروع بحثي",
    "مشروع تطبيقي",
    "مشروع تدريبي",
    "مشروع تعاوني",
    "مشروع ابتكاري",
  ];

  // جلب الطلاب المتاحين
  useEffect(() => {
    const loadStudents = async () => {
      if (!user || user.role !== "supervisor") return;

      try {
        const allStudents = await UserService.getUsersByRole("student");
        // المشرف يمكنه رؤية جميع الطلاب
        setStudents(allStudents);
      } catch (error) {
        console.error("خطأ في جلب الطلاب:", error);
        setError("خطأ في جلب قائمة الطلاب");
      }
    };

    if (open) {
      loadStudents();
    }
  }, [open, user]);

  const handleSubmit = async () => {
    if (!user || user.role !== "supervisor") {
      setError("ليس لديك صلاحية لإنشاء مشاريع");
      return;
    }

    // التحقق من صحة البيانات
    if (!formData.title.trim()) {
      setError("عنوان المشروع مطلوب");
      return;
    }
    if (!formData.description.trim()) {
      setError("وصف المشروع مطلوب");
      return;
    }
    if (!formData.type) {
      setError("نوع المشروع مطلوب");
      return;
    }
    if (!formData.dueDate) {
      setError("تاريخ الاستحقاق مطلوب");
      return;
    }
    if (formData.selectedStudents.length === 0) {
      setError("يجب اختيار طالب واحد على الأقل");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createProjectBySupervisor(user.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        dueDate: formData.dueDate,
        students: formData.selectedStudents.map((student) => student.id),
      });

      if (result.success) {
        // إعادة تعيين النموذج
        setFormData({
          title: "",
          description: "",
          type: "",
          dueDate: "",
          selectedStudents: [],
        });
        onSuccess();
        onClose();
      } else {
        setError("حدث خطأ أثناء إنشاء المشروع");
      }
    } catch (error) {
      console.error("خطأ في إنشاء المشروع:", error);
      setError("حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: "",
        description: "",
        type: "",
        dueDate: "",
        selectedStudents: [],
      });
      setError(null);
      onClose();
    }
  };

  // تنسيق التاريخ للإدخال
  const formatDateForInput = () => {
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    return nextMonth.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Assignment color="primary" />
          <Typography variant="h6">إنشاء مشروع جديد</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* عنوان المشروع */}
          <TextField
            fullWidth
            label="عنوان المشروع"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            InputProps={{
              startAdornment: (
                <Assignment sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />

          {/* وصف المشروع */}
          <TextField
            fullWidth
            label="وصف المشروع"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            multiline
            rows={4}
            required
            InputProps={{
              startAdornment: (
                <Description
                  sx={{
                    mr: 1,
                    color: "text.secondary",
                    alignSelf: "flex-start",
                    mt: 1,
                  }}
                />
              ),
            }}
          />

          {/* نوع المشروع */}
          <FormControl fullWidth required>
            <InputLabel>نوع المشروع</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              label="نوع المشروع"
            >
              {projectTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* تاريخ الاستحقاق */}
          <TextField
            fullWidth
            label="تاريخ الاستحقاق"
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            required
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: formatDateForInput(),
            }}
            InputProps={{
              startAdornment: (
                <DateRange sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />

          {/* اختيار الطلاب */}
          <FormControl fullWidth required>
            <Autocomplete
              multiple
              options={students}
              value={formData.selectedStudents}
              onChange={(_, newValue) =>
                setFormData({ ...formData, selectedStudents: newValue })
              }
              getOptionLabel={(option) => option.name || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="الطلاب المشاركين"
                  placeholder="اختر الطلاب..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Group sx={{ mr: 1, color: "text.secondary" }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.id}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email} - {option.department}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText="لا توجد طلاب متاحين"
            />
          </FormControl>

          {/* معلومات إضافية */}
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" color="primary" gutterBottom>
              معلومات المشرف
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>الاسم:</strong> {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>التخصص:</strong> {user?.specialization}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>القسم:</strong> {user?.department}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {loading ? "جاري الإنشاء..." : "إنشاء المشروع"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectForm;
