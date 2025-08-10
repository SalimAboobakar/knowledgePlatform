import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp,
  Assignment,
  Group,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import AdvancedCharts from "../common/AdvancedCharts";
import AdvancedSearch from "../common/AdvancedSearch";
import { ProjectService, UserService } from "../../services/firebaseService";
import { Project, User } from "../../data/mockData";

interface AdvancedDashboardProps {
  onNavigate: (page: string) => void;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
  });
  const [userStats, setUserStats] = useState({
    students: 0,
    supervisors: 0,
    admins: 0,
  });
  const [progressData, setProgressData] = useState([
    {
      label: "تطوير التطبيق",
      value: 75,
      target: 100,
      color: "#6366f1",
      icon: <Assignment />,
    },
    {
      label: "تحليل البيانات",
      value: 90,
      target: 100,
      color: "#10b981",
      icon: <TrendingUp />,
    },
    {
      label: "نظام الذكاء الاصطناعي",
      value: 25,
      target: 100,
      color: "#f59e0b",
      icon: <Schedule />,
    },
  ]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب البيانات من Firebase
      const [projects, users] = await Promise.all([
        ProjectService.getAllProjects(),
        UserService.getAllUsers(),
      ]);

      // حساب إحصائيات المشاريع
      const projectStatsData = {
        total: projects.length,
        active: projects.filter(p => p.status === "active").length,
        completed: projects.filter(p => p.status === "completed").length,
        planning: projects.filter(p => p.status === "planning").length,
      };

      // حساب إحصائيات المستخدمين
      const userStatsData = {
        students: users.filter(u => u.role === "student").length,
        supervisors: users.filter(u => u.role === "supervisor").length,
        admins: users.filter(u => u.role === "admin").length,
      };

      setProjectStats(projectStatsData);
      setUserStats(userStatsData);

      // تحديث بيانات التقدم
      const updatedProgressData = projects.slice(0, 3).map((project, index) => ({
        label: project.title,
        value: project.progress,
        target: 100,
        color: ["#6366f1", "#10b981", "#f59e0b"][index % 3],
        icon: [<Assignment />, <TrendingUp />, <Schedule />][index % 3],
      }));

      setProgressData(updatedProgressData);
    } catch (error) {
      setError("فشل في تحميل بيانات لوحة التحكم");
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResult = (result: any) => {
    // التنقل إلى الصفحة المناسبة حسب نوع النتيجة
    switch (result.type) {
      case "project":
        onNavigate("projects");
        break;
      case "user":
        onNavigate("users");
        break;
      case "document":
        onNavigate("library");
        break;
      case "team":
        onNavigate("team");
        break;
      default:
        break;
    }
  };

  const handleSearch = (filters: any) => {
    console.log("Search filters:", filters);
    // يمكن إضافة منطق البحث المتقدم هنا
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          مرحباً بك، {user?.name?.split(" ")[0] || "مستخدم"}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          إليك نظرة شاملة على منصة النجاح مع الميزات المتقدمة الجديدة
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="لوحة التحكم المتقدمة" />
          <Tab label="البحث المتقدم" />
          <Tab label="الإحصائيات التفصيلية" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={3}>
            لوحة التحكم المتقدمة
          </Typography>
          
          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Assignment sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {projectStats.total}
                      </Typography>
                      <Typography variant="body2">
                        إجمالي المشاريع
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {projectStats.completed}
                      </Typography>
                      <Typography variant="body2">
                        المشاريع المكتملة
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Group sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {userStats.students + userStats.supervisors}
                      </Typography>
                      <Typography variant="body2">
                        المستخدمين النشطين
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  color: "white",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {Math.round(
                          (projectStats.completed / projectStats.total) * 100
                        )}%
                      </Typography>
                      <Typography variant="body2">
                        معدل الإنجاز
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Advanced Charts */}
          <AdvancedCharts
            projectStats={projectStats}
            userStats={userStats}
            progressData={progressData}
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={3}>
            البحث المتقدم
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            ابحث في جميع محتويات المنصة باستخدام الفلاتر المتقدمة
          </Typography>
          
          <AdvancedSearch
            onSearch={handleSearch}
            onResultSelect={handleSearchResult}
            placeholder="ابحث في المشاريع والمستخدمين والوثائق والفرق..."
            showFilters={true}
          />
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={3}>
            الإحصائيات التفصيلية
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    توزيع المشاريع حسب الحالة
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>نشط</Typography>
                      <Typography fontWeight={600}>{projectStats.active}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>مكتمل</Typography>
                      <Typography fontWeight={600}>{projectStats.completed}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>قيد التخطيط</Typography>
                      <Typography fontWeight={600}>{projectStats.planning}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    توزيع المستخدمين حسب الدور
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>طلاب</Typography>
                      <Typography fontWeight={600}>{userStats.students}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>مشرفين</Typography>
                      <Typography fontWeight={600}>{userStats.supervisors}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>إداريين</Typography>
                      <Typography fontWeight={600}>{userStats.admins}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default AdvancedDashboard; 