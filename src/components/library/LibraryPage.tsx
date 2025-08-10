import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Snackbar,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
  MenuItem,
} from "@mui/material";
import {
  Book as BookIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "book" | "article" | "thesis" | "report" | "presentation";
  author: string;
  department: string;
  year: number;
  fileSize: string;
  downloads: number;
  rating: number;
  tags: string[];
  fileUrl: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

const mockLibraryItems: LibraryItem[] = [
  {
    id: "1",
    title: "مقدمة في الذكاء الاصطناعي",
    description: "كتاب شامل يغطي أساسيات الذكاء الاصطناعي وتطبيقاته الحديثة",
    category: "الذكاء الاصطناعي",
    type: "book",
    author: "د. أحمد محمد",
    department: "كلية الهندسة",
    year: 2023,
    fileSize: "15.2 MB",
    downloads: 245,
    rating: 4.5,
    tags: ["ذكاء اصطناعي", "تعلم آلي", "برمجة"],
    fileUrl: "#",
    createdAt: "2023-01-15",
    updatedAt: "2023-01-15",
  },
  {
    id: "2",
    title: "تطوير تطبيقات الويب الحديثة",
    description: "دليل شامل لتطوير تطبيقات الويب باستخدام React و Node.js",
    category: "تطوير الويب",
    type: "article",
    author: "د. سارة أحمد",
    department: "كلية الهندسة",
    year: 2023,
    fileSize: "8.7 MB",
    downloads: 189,
    rating: 4.8,
    tags: ["React", "Node.js", "JavaScript", "تطوير الويب"],
    fileUrl: "#",
    createdAt: "2023-02-20",
    updatedAt: "2023-02-20",
  },
  {
    id: "3",
    title: "دراسة حول تأثير التكنولوجيا على التعليم",
    description:
      "بحث أكاديمي يدرس تأثير التكنولوجيا الحديثة على العملية التعليمية",
    category: "التعليم",
    type: "thesis",
    author: "د. محمد علي",
    department: "كلية التربية",
    year: 2022,
    fileSize: "12.3 MB",
    downloads: 156,
    rating: 4.2,
    tags: ["تعليم", "تكنولوجيا", "بحث أكاديمي"],
    fileUrl: "#",
    createdAt: "2022-12-10",
    updatedAt: "2022-12-10",
  },
  {
    id: "4",
    title: "إدارة المشاريع البرمجية",
    description: "عرض تقديمي شامل حول أفضل ممارسات إدارة المشاريع البرمجية",
    category: "إدارة المشاريع",
    type: "presentation",
    author: "د. فاطمة حسن",
    department: "كلية إدارة الأعمال",
    year: 2023,
    fileSize: "5.1 MB",
    downloads: 98,
    rating: 4.6,
    tags: ["إدارة مشاريع", "برمجيات", "عرض تقديمي"],
    fileUrl: "#",
    createdAt: "2023-03-05",
    updatedAt: "2023-03-05",
  },
];

const categories = [
  "جميع الفئات",
  "الذكاء الاصطناعي",
  "تطوير الويب",
  "التعليم",
  "إدارة المشاريع",
  "علوم البيانات",
  "الأمن السيبراني",
  "تطوير التطبيقات",
];

const types = [
  "جميع الأنواع",
  "كتاب",
  "مقال",
  "رسالة ماجستير",
  "تقرير",
  "عرض تقديمي",
];

const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [libraryItems, setLibraryItems] =
    useState<LibraryItem[]>(mockLibraryItems);
  const [filteredItems, setFilteredItems] =
    useState<LibraryItem[]>(mockLibraryItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("جميع الفئات");
  const [selectedType, setSelectedType] = useState("جميع الأنواع");
  const [selectedTab, setSelectedTab] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
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

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, selectedType, libraryItems]);

  const filterItems = () => {
    let filtered = libraryItems;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // فلترة حسب الفئة
    if (selectedCategory !== "جميع الفئات") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // فلترة حسب النوع
    if (selectedType !== "جميع الأنواع") {
      const typeMap: { [key: string]: string } = {
        كتاب: "book",
        مقال: "article",
        "رسالة ماجستير": "thesis",
        تقرير: "report",
        "عرض تقديمي": "presentation",
      };
      filtered = filtered.filter((item) => item.type === typeMap[selectedType]);
    }

    setFilteredItems(filtered);
  };

  const handleDownload = (item: LibraryItem) => {
    // محاكاة التحميل
    setSnackbar({
      open: true,
      message: `جاري تحميل: ${item.title}`,
      severity: "info",
    });

    // زيادة عدد التحميلات
    setLibraryItems((prev) =>
      prev.map((libItem) =>
        libItem.id === item.id
          ? { ...libItem, downloads: libItem.downloads + 1 }
          : libItem
      )
    );
  };

  const handleView = (item: LibraryItem) => {
    setSnackbar({
      open: true,
      message: `عرض: ${item.title}`,
      severity: "info",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book":
        return <BookIcon />;
      case "article":
        return <DescriptionIcon />;
      case "thesis":
        return <SchoolIcon />;
      case "report":
        return <DescriptionIcon />;
      case "presentation":
        return <TrendingUpIcon />;
      default:
        return <BookIcon />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "book":
        return "كتاب";
      case "article":
        return "مقال";
      case "thesis":
        return "رسالة ماجستير";
      case "report":
        return "تقرير";
      case "presentation":
        return "عرض تقديمي";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "book":
        return "primary";
      case "article":
        return "secondary";
      case "thesis":
        return "success";
      case "report":
        return "warning";
      case "presentation":
        return "info";
      default:
        return "default";
    }
  };

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <BookIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            المكتبة
          </Typography>
        </Box>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowUploadDialog(true)}
          >
            إضافة مادة
          </Button>
        )}
      </Box>

      {/* فلاتر البحث */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="البحث في المكتبة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="الفئة"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="النوع"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* تبويبات العرض */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab label="جميع المواد" />
          <Tab label="الأكثر تحميلاً" />
          <Tab label="الأحدث" />
          <Tab label="الأعلى تقييماً" />
        </Tabs>
      </Box>

      {/* عرض المواد */}
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{ mr: 1, bgcolor: `${getTypeColor(item.type)}.main` }}
                  >
                    {getTypeIcon(item.type)}
                  </Avatar>
                  <Chip
                    label={getTypeLabel(item.type)}
                    color={getTypeColor(item.type) as any}
                    size="small"
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {item.description}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.author}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <SchoolIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.department}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TimeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  <Typography variant="caption" color="text.secondary">
                    {item.year}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <StarIcon
                    sx={{ mr: 0.5, fontSize: 16, color: "warning.main" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.rating} ({item.downloads} تحميل)
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                >
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                  {item.tags.length > 3 && (
                    <Chip
                      label={`+${item.tags.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between" }}>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleView(item)}
                    title="عرض"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(item)}
                    title="تحميل"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {item.fileSize}
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredItems.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <BookIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لا توجد مواد متاحة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            جرب تغيير فلاتر البحث
          </Typography>
        </Box>
      )}

      {/* حوار إضافة مادة */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>إضافة مادة جديدة</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            سيتم إضافة نموذج رفع المواد قريباً
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>إلغاء</Button>
          <Button variant="contained" disabled>
            رفع المادة
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default LibraryPage;
