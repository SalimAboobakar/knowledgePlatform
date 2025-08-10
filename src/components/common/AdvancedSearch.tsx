import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  Grid,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface SearchFilters {
  query: string;
  category: "all" | "projects" | "users" | "documents" | "teams";
  status: "all" | "active" | "completed" | "planning" | "review";
  department: "all" | string;
  dateRange: "all" | "today" | "week" | "month" | "quarter" | "year";
  priority: "all" | "low" | "medium" | "high";
  sortBy: "relevance" | "date" | "name" | "status" | "priority";
  sortOrder: "asc" | "desc";
}

interface SearchResult {
  id: string;
  type: "project" | "user" | "document" | "team";
  title: string;
  description: string;
  status?: string;
  priority?: string;
  department?: string;
  date?: string;
  avatar?: string;
  icon: React.ReactNode;
  color: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onResultSelect,
  placeholder = "البحث في المشاريع والمستخدمين والوثائق...",
  showFilters = true,
}) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    status: "all",
    department: "all",
    dateRange: "all",
    priority: "all",
    sortBy: "relevance",
    sortOrder: "desc",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // نتائج البحث الفارغة - سيتم ملؤها من Firebase
  const [mockResults, setMockResults] = useState<SearchResult[]>([]);

  const departments = [
    "كلية الهندسة",
    "كلية الطب",
    "كلية العلوم",
    "كلية الآداب",
    "كلية الاقتصاد",
    "كلية القانون",
  ];

  const handleSearch = async () => {
    if (!filters.query.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // جلب البيانات الحقيقية من Firebase
      const { ProjectService, UserService } = await import(
        "../../services/firebaseService"
      );

      const [projects, users] = await Promise.all([
        ProjectService.getAllProjects(),
        UserService.getAllUsers(),
      ]);

      // تحويل البيانات إلى نتائج بحث
      const searchResults: SearchResult[] = [];

      // إضافة المشاريع
      projects.forEach((project) => {
        searchResults.push({
          id: project.id,
          type: "project",
          title: project.title,
          description: project.description,
          status: project.status,
          priority: project.priority,
          department: project.tags[0] || "غير محدد",
          date: project.updatedAt || new Date().toISOString(),
          icon: <AssignmentIcon />,
          color: "#6366f1",
        });
      });

      // إضافة المستخدمين
      users.forEach((user) => {
        searchResults.push({
          id: user.id,
          type: "user",
          title: user.name,
          description: `${
            user.role === "student"
              ? "طالب"
              : user.role === "supervisor"
              ? "مشرف"
              : "مدير"
          } - ${user.department}`,
          department: user.department,
          date: new Date().toISOString(),
          avatar: user.avatar,
          icon: <PersonIcon />,
          color: "#10b981",
        });
      });

      // فلترة النتائج حسب الاستعلام
      const filteredResults = searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          result.description
            .toLowerCase()
            .includes(filters.query.toLowerCase()) ||
          result.department?.toLowerCase().includes(filters.query.toLowerCase())
      );

      setSearchResults(filteredResults);
    } catch (error) {
      setError("فشل في البحث");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      query: "",
      category: "all",
      status: "all",
      department: "all",
      dateRange: "all",
      priority: "all",
      sortBy: "relevance",
      sortOrder: "desc",
    });
    setSearchResults([]);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "primary";
      case "planning":
        return "warning";
      case "review":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "completed":
        return "مكتمل";
      case "planning":
        return "قيد التخطيط";
      case "review":
        return "قيد المراجعة";
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
    <Box sx={{ width: "100%" }}>
      {/* Search Bar */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => handleFilterChange("query", e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.query && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange("query", "")}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !filters.query.trim()}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {loading ? <CircularProgress size={20} /> : "بحث"}
          </Button>
          {showFilters && (
            <Tooltip title="فلاتر متقدمة">
              <IconButton
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{
                  backgroundColor: showAdvancedFilters
                    ? "primary.main"
                    : "transparent",
                  color: showAdvancedFilters ? "white" : "inherit",
                  "&:hover": {
                    backgroundColor: showAdvancedFilters
                      ? "primary.dark"
                      : "action.hover",
                  },
                }}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Advanced Filters */}
        <Collapse in={showAdvancedFilters}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  label="الفئة"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="projects">المشاريع</MenuItem>
                  <MenuItem value="users">المستخدمين</MenuItem>
                  <MenuItem value="documents">الوثائق</MenuItem>
                  <MenuItem value="teams">الفرق</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="الحالة"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="active">نشط</MenuItem>
                  <MenuItem value="completed">مكتمل</MenuItem>
                  <MenuItem value="planning">قيد التخطيط</MenuItem>
                  <MenuItem value="review">قيد المراجعة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>القسم</InputLabel>
                <Select
                  value={filters.department}
                  onChange={(e) =>
                    handleFilterChange("department", e.target.value)
                  }
                  label="القسم"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>الفترة</InputLabel>
                <Select
                  value={filters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                  label="الفترة"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="today">اليوم</MenuItem>
                  <MenuItem value="week">الأسبوع</MenuItem>
                  <MenuItem value="month">الشهر</MenuItem>
                  <MenuItem value="quarter">الربع</MenuItem>
                  <MenuItem value="year">السنة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>الأولوية</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  label="الأولوية"
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="high">عالية</MenuItem>
                  <MenuItem value="medium">متوسطة</MenuItem>
                  <MenuItem value="low">منخفضة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ترتيب حسب</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  label="ترتيب حسب"
                >
                  <MenuItem value="relevance">الأهمية</MenuItem>
                  <MenuItem value="date">التاريخ</MenuItem>
                  <MenuItem value="name">الاسم</MenuItem>
                  <MenuItem value="status">الحالة</MenuItem>
                  <MenuItem value="priority">الأولوية</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>الترتيب</InputLabel>
                <Select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    handleFilterChange("sortOrder", e.target.value)
                  }
                  label="الترتيب"
                >
                  <MenuItem value="desc">تنازلي</MenuItem>
                  <MenuItem value="asc">تصاعدي</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                fullWidth
              >
                مسح الفلاتر
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Search Results */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {searchResults.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              نتائج البحث ({searchResults.length})
            </Typography>
            <List>
              {searchResults.map((result, index) => (
                <React.Fragment key={result.id}>
                  <ListItem
                    button
                    onClick={() => onResultSelect(result)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          backgroundColor: `${result.color}15`,
                          color: result.color,
                        }}
                      >
                        {result.avatar || result.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {result.title}
                          </Typography>
                          {result.status && (
                            <Chip
                              label={getStatusText(result.status)}
                              color={getStatusColor(result.status) as any}
                              size="small"
                            />
                          )}
                          {result.priority && (
                            <Chip
                              label={getPriorityText(result.priority)}
                              color={getPriorityColor(result.priority) as any}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            {result.description}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            {result.department && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {result.department}
                              </Typography>
                            )}
                            {result.date && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {result.date}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdvancedSearch;
