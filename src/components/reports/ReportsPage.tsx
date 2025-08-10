import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { ProjectService, UserService } from "../../services/firebaseService";
import { Project, User } from "../../data/mockData";

interface ReportData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalUsers: number;
  students: number;
  supervisors: number;
  admins: number;
  averageProgress: number;
  projectsByStatus: { [key: string]: number };
  projectsByType: { [key: string]: number };
  projectsByDepartment: { [key: string]: number };
  recentProjects: Project[];
  topPerformers: User[];
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, filterPeriod, filterDepartment]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب البيانات
      const [projects, users] = await Promise.all([
        ProjectService.getAllProjects(),
        UserService.getAllUsers(),
      ]);

      // فلترة البيانات حسب الفترة
      let filteredProjects = projects;
      if (filterPeriod !== "all") {
        const now = new Date();
        const filterDate = new Date();

        switch (filterPeriod) {
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
          case "quarter":
            filterDate.setMonth(now.getMonth() - 3);
            break;
          case "year":
            filterDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        filteredProjects = projects.filter(
          (project) => new Date(project.createdAt) >= filterDate
        );
      }

      // فلترة حسب القسم
      if (filterDepartment !== "all") {
        filteredProjects = filteredProjects.filter((project) => {
          const projectUser = users.find((u) => u.id === project.studentId);
          return projectUser?.department === filterDepartment;
        });
      }

      // حساب الإحصائيات
      const totalProjects = filteredProjects.length;
      const activeProjects = filteredProjects.filter(
        (p) => p.status === "active"
      ).length;
      const completedProjects = filteredProjects.filter(
        (p) => p.status === "completed"
      ).length;
      const averageProgress =
        totalProjects > 0
          ? Math.round(
              filteredProjects.reduce((sum, p) => sum + p.progress, 0) /
                totalProjects
            )
          : 0;

      // تجميع البيانات حسب الحالة
      const projectsByStatus = filteredProjects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // تجميع البيانات حسب النوع
      const projectsByType = filteredProjects.reduce((acc, project) => {
        acc[project.type] = (acc[project.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // تجميع البيانات حسب القسم
      const projectsByDepartment = filteredProjects.reduce((acc, project) => {
        const projectUser = users.find((u) => u.id === project.studentId);
        const department = projectUser?.department || "غير محدد";
        acc[department] = (acc[department] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // المشاريع الحديثة
      const recentProjects = filteredProjects
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      // أفضل الأداء
      const topPerformers = users
        .filter((u) => u.role === "student")
        .map((student) => {
          const studentProjects = filteredProjects.filter(
            (p) => p.studentId === student.id
          );
          const avgProgress =
            studentProjects.length > 0
              ? studentProjects.reduce((sum, p) => sum + p.progress, 0) /
                studentProjects.length
              : 0;
          return { ...student, avgProgress };
        })
        .sort((a, b) => (b as any).avgProgress - (a as any).avgProgress)
        .slice(0, 5);

      setReportData({
        totalProjects,
        activeProjects,
        completedProjects,
        totalUsers: users.length,
        students: users.filter((u) => u.role === "student").length,
        supervisors: users.filter((u) => u.role === "supervisor").length,
        admins: users.filter((u) => u.role === "admin").length,
        averageProgress,
        projectsByStatus,
        projectsByType,
        projectsByDepartment,
        recentProjects,
        topPerformers: topPerformers as User[],
      });
    } catch (error: any) {
      console.error("Error loading report data:", error);
      setError("خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) return;

    const reportText = `
تقرير المشاريع الأكاديمية
========================

إحصائيات عامة:
- إجمالي المشاريع: ${reportData.totalProjects}
- المشاريع النشطة: ${reportData.activeProjects}
- المشاريع المكتملة: ${reportData.completedProjects}
- متوسط التقدم: ${reportData.averageProgress}%

المستخدمين:
- إجمالي المستخدمين: ${reportData.totalUsers}
- الطلاب: ${reportData.students}
- المشرفون: ${reportData.supervisors}
- المديرون: ${reportData.admins}

المشاريع حسب الحالة:
${Object.entries(reportData.projectsByStatus)
  .map(([status, count]) => `- ${status}: ${count}`)
  .join("\n")}

المشاريع حسب النوع:
${Object.entries(reportData.projectsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join("\n")}

المشاريع حسب القسم:
${Object.entries(reportData.projectsByDepartment)
  .map(([dept, count]) => `- ${dept}: ${count}`)
  .join("\n")}

تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}
    `;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير_المشاريع_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">يجب تسجيل الدخول للوصول إلى التقارير</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>جاري تحميل البيانات...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">لا توجد بيانات متاحة</Alert>
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AssessmentIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            التقارير والإحصائيات
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportReport}
        >
          تصدير التقرير
        </Button>
      </Box>

      {/* فلاتر */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">الفلاتر</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>الفترة الزمنية</InputLabel>
                <Select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  label="الفترة الزمنية"
                >
                  <MenuItem value="all">جميع الفترات</MenuItem>
                  <MenuItem value="week">آخر أسبوع</MenuItem>
                  <MenuItem value="month">آخر شهر</MenuItem>
                  <MenuItem value="quarter">آخر 3 أشهر</MenuItem>
                  <MenuItem value="year">آخر سنة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>القسم</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="القسم"
                >
                  <MenuItem value="all">جميع الأقسام</MenuItem>
                  <MenuItem value="كلية الهندسة">كلية الهندسة</MenuItem>
                  <MenuItem value="كلية الطب">كلية الطب</MenuItem>
                  <MenuItem value="كلية العلوم">كلية العلوم</MenuItem>
                  <MenuItem value="كلية الآداب">كلية الآداب</MenuItem>
                  <MenuItem value="كلية إدارة الأعمال">
                    كلية إدارة الأعمال
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* الإحصائيات العامة */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                <Box>
                  <Typography variant="h4">
                    {reportData.totalProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المشاريع
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUpIcon sx={{ mr: 1, color: "success.main" }} />
                <Box>
                  <Typography variant="h4">
                    {reportData.activeProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المشاريع النشطة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
                <Box>
                  <Typography variant="h4">
                    {reportData.completedProjects}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المشاريع المكتملة
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon sx={{ mr: 1, color: "info.main" }} />
                <Box>
                  <Typography variant="h4">{reportData.totalUsers}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المستخدمين
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* المشاريع حسب الحالة */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                المشاريع حسب الحالة
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>الحالة</TableCell>
                      <TableCell align="right">العدد</TableCell>
                      <TableCell align="right">النسبة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(reportData.projectsByStatus).map(
                      ([status, count]) => (
                        <TableRow key={status}>
                          <TableCell>
                            <Chip
                              label={
                                status === "active"
                                  ? "نشط"
                                  : status === "completed"
                                  ? "مكتمل"
                                  : status === "planning"
                                  ? "تخطيط"
                                  : "مراجعة"
                              }
                              color={
                                status === "active"
                                  ? "success"
                                  : status === "completed"
                                  ? "primary"
                                  : "default"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {Math.round(
                              (count / reportData.totalProjects) * 100
                            )}
                            %
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* المشاريع حسب النوع */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                المشاريع حسب النوع
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>النوع</TableCell>
                      <TableCell align="right">العدد</TableCell>
                      <TableCell align="right">النسبة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(reportData.projectsByType).map(
                      ([type, count]) => (
                        <TableRow key={type}>
                          <TableCell>{type}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {Math.round(
                              (count / reportData.totalProjects) * 100
                            )}
                            %
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* المشاريع الحديثة */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                المشاريع الحديثة
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>المشروع</TableCell>
                      <TableCell>الحالة</TableCell>
                      <TableCell align="right">التقدم</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.recentProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {project.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.type}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              project.status === "active"
                                ? "نشط"
                                : project.status === "completed"
                                ? "مكتمل"
                                : project.status === "planning"
                                ? "تخطيط"
                                : "مراجعة"
                            }
                            color={
                              project.status === "active"
                                ? "success"
                                : project.status === "completed"
                                ? "primary"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2">
                              {project.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* أفضل الأداء */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                أفضل الأداء
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>الطالب</TableCell>
                      <TableCell>القسم</TableCell>
                      <TableCell align="right">متوسط التقدم</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.topPerformers.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="body2" fontWeight={500}>
                              {student.name}
                            </Typography>
                            {index < 3 && (
                              <Chip
                                label={`#${index + 1}`}
                                color={
                                  index === 0
                                    ? "warning"
                                    : index === 1
                                    ? "default"
                                    : "default"
                                }
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {(student as any).avgProgress?.toFixed(1) || 0}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
