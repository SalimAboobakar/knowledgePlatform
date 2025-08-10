import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Grid,
  InputAdornment,
  Autocomplete,
  IconButton,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Close,
  Assignment,
  School,
  Person,
  CalendarToday,
  Add,
} from "@mui/icons-material";
import { Project, User } from "../../data/mockData";
import { useAuth } from "../../hooks/useAuth";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  project?: Project | null;
  students: User[];
  supervisors: User[];
  tags: string[];
  projectTypes: string[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onClose,
  onSubmit,
  project,
  students,
  supervisors,
  tags,
  projectTypes,
}) => {
  // console.log("ProjectForm props:", { students, supervisors, project });
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    status: "planning" as "planning" | "active" | "review" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    supervisorId: "",
    studentId: "",
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  // استخدام useRef لمنع التحديثات المتكررة
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // استخدام useRef بدلاً من useState لتجنب التحديثات المتكررة
  const searchSupervisorsRef = useRef("");
  const searchStudentsRef = useRef("");

  // تصفية المشرفين والطلاب حسب صلاحيات المستخدم الحالي
  const filteredSupervisors = React.useMemo(() => {
    console.log("🔍 Raw supervisors data:", supervisors);

    const filtered = supervisors.filter((supervisor) => {
      // التأكد من أن المستخدم مشرف فعلاً
      if (supervisor.role !== "supervisor") {
        console.log(
          "❌ Filtered out supervisor with role:",
          supervisor.role,
          supervisor.name
        );
        return false;
      }

      // التأكد من وجود البيانات المطلوبة
      if (!supervisor.name) {
        console.log("❌ Filtered out supervisor without name:", supervisor);
        return false;
      }

      // جميع المستخدمين يمكنهم رؤية المشرفين
      return true;
    });

    // إزالة التكرار حسب ID
    const uniqueSupervisors = filtered.filter(
      (supervisor, index, self) =>
        index === self.findIndex((s) => s.id === supervisor.id)
    );

    console.log("✅ Filtered supervisors:", uniqueSupervisors);
    return uniqueSupervisors;
  }, [supervisors]);

  const filteredStudents = React.useMemo(() => {
    const filtered = students.filter((student) => {
      // التأكد من أن المستخدم طالب فعلاً
      if (student.role !== "student") {
        return false;
      }

      // التأكد من وجود البيانات المطلوبة
      if (!student.name) {
        return false;
      }

      // المشرفون والإداريون يمكنهم رؤية جميع الطلاب
      return true;
    });

    // إزالة التكرار حسب ID
    const uniqueStudents = filtered.filter(
      (student, index, self) =>
        index === self.findIndex((s) => s.id === student.id)
    );

    return uniqueStudents;
  }, [students]);

  // تصفية إضافية حسب البحث
  const searchFilteredSupervisors = React.useMemo(() => {
    const filtered = filteredSupervisors.filter((supervisor) => {
      if (!searchSupervisorsRef.current) return true;
      const searchTerm = searchSupervisorsRef.current.toLowerCase();
      return (
        (supervisor.name || "").toLowerCase().includes(searchTerm) ||
        (supervisor.specialization || "").toLowerCase().includes(searchTerm) ||
        (supervisor.department || "").toLowerCase().includes(searchTerm)
      );
    });

    console.log(
      "🔍 Search filtered supervisors:",
      filtered.length,
      "Search term:",
      searchSupervisorsRef.current
    );
    return filtered;
  }, [filteredSupervisors]);

  const searchFilteredStudents = React.useMemo(() => {
    const filtered = filteredStudents.filter((student) => {
      if (!searchStudentsRef.current) return true;
      const searchTerm = searchStudentsRef.current.toLowerCase();
      return (
        (student.name || "").toLowerCase().includes(searchTerm) ||
        (student.specialization || "").toLowerCase().includes(searchTerm) ||
        (student.department || "").toLowerCase().includes(searchTerm) ||
        (student.studentId || "").toLowerCase().includes(searchTerm)
      );
    });

    // console.log("Search filtered students:", filtered, "Search term:", searchStudentsRef.current);
    return filtered;
  }, [filteredStudents]);

  useEffect(() => {
    if (!project) {
      // إعادة تعيين النموذج إذا لم يكن هناك مشروع
      // تعيين المشرف الحالي كقيمة افتراضية إذا كان مشرفاً
      const defaultSupervisorId =
        currentUser?.role === "supervisor" ? currentUser.id : "";

      setFormData({
        title: "",
        description: "",
        type: "",
        status: "planning" as "planning" | "active" | "review" | "completed",
        priority: "medium" as "low" | "medium" | "high",
        dueDate: "",
        supervisorId: defaultSupervisorId,
        studentId: "",
        tags: [] as string[],
      });

      console.log(
        "🎯 Setting default supervisor:",
        defaultSupervisorId,
        currentUser?.name
      );
    } else {
      // تحديث النموذج ببيانات المشروع
      setFormData({
        title: project.title,
        description: project.description,
        type: project.type,
        status: project.status,
        priority: project.priority || "medium",
        dueDate: project.dueDate,
        supervisorId: project.supervisorId,
        studentId: project.studentId,
        tags: project.tags,
      });
    }

    searchSupervisorsRef.current = "";
    searchStudentsRef.current = "";
  }, [
    project?.id,
    project?.title,
    project?.description,
    project?.type,
    project?.status,
    project?.priority,
    project?.dueDate,
    project?.supervisorId,
    project?.studentId,
    project?.tags,
  ]); // استخدام جميع الخصائص المهمة

  // تنظيف timeout عند إغلاق المكون
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    // التحقق من أن المشرف محدد (إما المشرف الحالي أو مشرف آخر)
    if (!formData.supervisorId) {
      console.error("❌ No supervisor selected");
      return false;
    }

    // التحقق من أن الطالب محدد
    if (!formData.studentId) {
      console.error("❌ No student selected");
      return false;
    }

    // التحقق من أن العنوان محدد
    if (!formData.title.trim()) {
      console.error("❌ No title provided");
      return false;
    }

    console.log("✅ Form validation passed");
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    } else {
      // إظهار رسالة خطأ للمستخدم
      alert("يرجى التأكد من تحديد المشرف والطالب وعنوان المشروع");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            {project ? "تعديل المشروع" : "إنشاء مشروع جديد"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* رسالة توضيحية للمشرفين */}
        {currentUser?.role === "supervisor" && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>ملاحظة:</strong> أنت المشرف الافتراضي لهذا المشروع. يمكنك
              اختيار مشرف آخر أو البقاء كمشرف. سيتم عرض الطلاب الذين يدرسون في
              نفس تخصصك فقط.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* العنوان */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="عنوان المشروع"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Assignment color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* الوصف */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="وصف المشروع"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              multiline
              rows={4}
              placeholder="اكتب وصفاً مفصلاً للمشروع..."
            />
          </Grid>

          {/* نوع المشروع والحالة */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>نوع المشروع</InputLabel>
              <Select
                value={formData.type}
                onChange={(e: any) => {
                  setFormData((prev) => ({ ...prev, type: e.target.value }));
                }}
                label="نوع المشروع"
              >
                {projectTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>حالة المشروع</InputLabel>
              <Select
                value={formData.status}
                onChange={(e: any) => {
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as any,
                  }));
                }}
                label="حالة المشروع"
              >
                <MenuItem value="planning">قيد التخطيط</MenuItem>
                <MenuItem value="active">نشط</MenuItem>
                <MenuItem value="review">قيد المراجعة</MenuItem>
                <MenuItem value="completed">مكتمل</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* الأولوية وتاريخ الاستحقاق */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>الأولوية</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e: any) => {
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as any,
                  }));
                }}
                label="الأولوية"
              >
                <MenuItem value="low">منخفضة</MenuItem>
                <MenuItem value="medium">متوسطة</MenuItem>
                <MenuItem value="high">عالية</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="تاريخ الاستحقاق"
              type="date"
              value={formData.dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }));
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="action" />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* المشرف والطالب */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={searchFilteredSupervisors}
              getOptionLabel={(option) =>
                `${option.name || "مستخدم بدون اسم"} (${option.id})`
              }
              value={
                formData.supervisorId && searchFilteredSupervisors.length > 0
                  ? searchFilteredSupervisors.find(
                      (s) => s.id === formData.supervisorId
                    ) || null
                  : null
              }
              onChange={(_, newValue) => {
                // إلغاء التحديث السابق إذا كان موجوداً
                if (updateTimeoutRef.current) {
                  clearTimeout(updateTimeoutRef.current);
                }

                // تأخير التحديث لمنع التحديثات المتكررة
                updateTimeoutRef.current = setTimeout(() => {
                  setFormData((prev) => ({
                    ...prev,
                    supervisorId: newValue?.id || "",
                  }));
                }, 50);
              }}
              onInputChange={(_, value) => {
                searchSupervisorsRef.current = value;
              }}
              inputValue={searchSupervisorsRef.current}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="المشرف"
                  placeholder={
                    currentUser?.role === "supervisor"
                      ? `أنت المشرف (${currentUser.name})`
                      : "ابحث عن مشرف..."
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  helperText={
                    currentUser?.role === "supervisor" &&
                    formData.supervisorId === currentUser.id
                      ? "أنت المشرف الافتراضي لهذا المشروع"
                      : ""
                  }
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "0.875rem",
                          bgcolor: "primary.main",
                        }}
                      >
                        {option.avatar ||
                          (option.name ? option.name.charAt(0) : "م")}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {option.name || "مستخدم بدون اسم"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.specialization || "تخصص غير محدد"} •{" "}
                          {option.department || "قسم غير محدد"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter(
                  (option) =>
                    (option.name || "").toLowerCase().includes(searchTerm) ||
                    (option.specialization || "")
                      .toLowerCase()
                      .includes(searchTerm) ||
                    (option.department || "").toLowerCase().includes(searchTerm)
                );
              }}
              noOptionsText={
                searchSupervisorsRef.current
                  ? "لا توجد نتائج للبحث"
                  : currentUser?.role === "supervisor"
                  ? "أنت المشرف الافتراضي للمشروع"
                  : "لا توجد مشرفين متاحين"
              }
              loadingText="جاري البحث..."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={searchFilteredStudents}
              getOptionLabel={(option) =>
                `${option.name || "مستخدم بدون اسم"} (${option.id})`
              }
              value={
                formData.studentId && searchFilteredStudents.length > 0
                  ? searchFilteredStudents.find(
                      (s) => s.id === formData.studentId
                    ) || null
                  : null
              }
              onChange={(_, newValue) => {
                // إلغاء التحديث السابق إذا كان موجوداً
                if (updateTimeoutRef.current) {
                  clearTimeout(updateTimeoutRef.current);
                }

                // تأخير التحديث لمنع التحديثات المتكررة
                updateTimeoutRef.current = setTimeout(() => {
                  setFormData((prev) => ({
                    ...prev,
                    studentId: newValue?.id || "",
                  }));
                }, 50);
              }}
              onInputChange={(_, value) => {
                searchStudentsRef.current = value;
              }}
              inputValue={searchStudentsRef.current}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="الطالب"
                  placeholder="ابحث عن طالب..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <School color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: "0.875rem",
                          bgcolor: "success.main",
                        }}
                      >
                        {option.avatar ||
                          (option.name ? option.name.charAt(0) : "ط")}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {option.name || "مستخدم بدون اسم"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.specialization || "تخصص غير محدد"} •{" "}
                          {option.department || "قسم غير محدد"}
                          {option.studentId && ` • ${option.studentId}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              }}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase();
                return options.filter(
                  (option) =>
                    (option.name || "").toLowerCase().includes(searchTerm) ||
                    (option.specialization || "")
                      .toLowerCase()
                      .includes(searchTerm) ||
                    (option.department || "")
                      .toLowerCase()
                      .includes(searchTerm) ||
                    (option.studentId || "").toLowerCase().includes(searchTerm)
                );
              }}
              noOptionsText={
                searchStudentsRef.current
                  ? "لا توجد نتائج للبحث"
                  : "لا توجد طلاب متاحين"
              }
              loadingText="جاري البحث..."
            />
          </Grid>

          {/* العلامات */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" mb={2}>
              العلامات
            </Typography>

            {/* العلامات المختارة */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>

            {/* إضافة علامة جديدة */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Autocomplete
                freeSolo
                options={tags}
                value={newTag || ""}
                onChange={(_: any, value: any) => {
                  const newValue = value || "";
                  if (newValue !== newTag) {
                    setNewTag(newValue);
                  }
                }}
                onInputChange={(_: any, value: string) => {
                  if (value !== newTag) {
                    setNewTag(value);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="أضف علامة جديدة..."
                    size="small"
                    onKeyPress={handleKeyPress}
                    sx={{ flexGrow: 1 }}
                  />
                )}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                size="small"
              >
                إضافة
              </Button>
            </Box>

            {/* العلامات المقترحة */}
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                mb={1}
                display="block"
              >
                علامات مقترحة:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {tags
                  .filter((tag) => !formData.tags.includes(tag))
                  .slice(0, 10)
                  .map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (!formData.tags.includes(tag)) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, tag],
                          });
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {project ? "تحديث المشروع" : "إنشاء المشروع"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectForm;
