import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment,
  Chat,
  Notifications,
  Person,
  Settings,
  Logout,
  Search,
  School,
  TrendingUp,
  CalendarToday,
  Group,
  Book,
  Lightbulb,
  Analytics,
  AdminPanelSettings,
  SupervisorAccount,
  DarkMode,
  LightMode,
  SmartToy,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { useTheme as useCustomTheme } from "../common/ThemeProvider";
import {
  ProjectService,
  UserService,
  NotificationService,
} from "../../services/firebaseService";
import { Project, User } from "../../data/mockData";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import ProjectsPage from "../projects/ProjectsPage";
import UsersPage from "../users/UsersPage";
import SettingsPage from "../settings/SettingsPage";
import ReportsPage from "../reports/ReportsPage";
import HelpPage from "../help/HelpPage";
import ProfilePage from "../profile/ProfilePage";
import LibraryPage from "../library/LibraryPage";
import TeamPage from "../team/TeamPage";
import ChatPage from "../chat/ChatPage";
import NotificationSystem from "../common/NotificationSystem";
import AdvisorPage from "../advisor/AdvisorPage";

type ActivePage =
  | "dashboard"
  | "projects"
  | "users"
  | "chat"
  | "advisor"
  | "library"
  | "team"
  | "reports"
  | "settings"
  | "profile"
  | "help";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // البيانات الحقيقية
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  const handleRefreshData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // إعادة تحميل البيانات الحقيقية من Firebase
      const [projectsData, usersData] = await Promise.all([
        ProjectService.getProjectsByUserRole(user),
        UserService.getAllUsers(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error("خطأ في تحديث البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات الحقيقية من Firebase
  useEffect(() => {
    if (!user?.id) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // جلب المشاريع والمستخدمين حسب دور المستخدم
        const [projectsData, usersData] = await Promise.all([
          ProjectService.getProjectsByUserRole(user),
          UserService.getAllUsers(),
        ]);

        setProjects(projectsData);
        setUsers(usersData);

        // حساب الإشعارات غير المقروءة
        try {
          const notificationsRef = collection(db, "notifications");
          const notificationsQuery = query(
            notificationsRef,
            where("recipientId", "==", user.id),
            where("isRead", "==", false)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          setUnreadNotifications(notificationsSnapshot.size);

          // إنشاء إشعارات تجريبية إذا لم تكن موجودة (فقط مرة واحدة)
          if (notificationsSnapshot.size === 0) {
            try {
              // التحقق من وجود إشعارات أخرى للمستخدم
              const allNotificationsQuery = query(
                notificationsRef,
                where("recipientId", "==", user.id)
              );
              const allNotificationsSnapshot = await getDocs(
                allNotificationsQuery
              );

              if (allNotificationsSnapshot.size === 0) {
                await NotificationService.createSampleNotifications(user.id);
                // تحديث العدد بعد إنشاء الإشعارات
                const updatedSnapshot = await getDocs(notificationsQuery);
                setUnreadNotifications(updatedSnapshot.size);
              }
            } catch (error) {
              console.error("Error creating sample notifications:", error);
            }
          }
        } catch (error) {
          console.error("Error loading notifications:", error);
          setUnreadNotifications(0);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id, user]); // إضافة user كتبعية

  // إنشاء قائمة العناصر حسب دور المستخدم
  const getMenuItems = () => {
    const baseItems = [
      {
        icon: <DashboardIcon />,
        text: "لوحة التحكم",
        page: "dashboard" as ActivePage,
        active: activePage === "dashboard",
      },
      {
        icon: <Assignment />,
        text: "المشاريع",
        page: "projects" as ActivePage,
        active: activePage === "projects",
      },
    ];

    // إضافة صفحة إدارة المستخدمين للإداريين فقط
    if (user?.role === "admin") {
      baseItems.push({
        icon: <Group />,
        text: "إدارة المستخدمين",
        page: "users" as ActivePage,
        active: activePage === "users",
      });
    }

    // إضافة صفحة المساعد الأكاديمي لجميع المستخدمين
    baseItems.push({
      icon: <SmartToy />,
      text: "المساعد الأكاديمي",
      page: "advisor" as ActivePage,
      active: activePage === "advisor",
    });

    // إضافة باقي العناصر
    baseItems.push(
      {
        icon: <Chat />,
        text: "المراسلة",
        page: "chat" as ActivePage,
        active: activePage === "chat",
      },
      {
        icon: <Book />,
        text: "المكتبة",
        page: "library" as ActivePage,
        active: activePage === "library",
      },
      {
        icon: <Group />,
        text: "الفريق",
        page: "team" as ActivePage,
        active: activePage === "team",
      },
      {
        icon: <Analytics />,
        text: "التقارير",
        page: "reports" as ActivePage,
        active: activePage === "reports",
      },
      {
        icon: <Settings />,
        text: "الإعدادات",
        page: "settings" as ActivePage,
        active: activePage === "settings",
      },
      {
        icon: <Person />,
        text: "الملف الشخصي",
        page: "profile" as ActivePage,
        active: activePage === "profile",
      },
      {
        icon: <Lightbulb />,
        text: "المساعدة",
        page: "help" as ActivePage,
        active: activePage === "help",
      }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  // حساب الإحصائيات من البيانات الحقيقية
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const totalUsers = users.length;
  const students = users.filter((u) => u.role === "student").length;
  // const supervisors = users.filter((u) => u.role === "supervisor").length;

  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: totalUsers.toString(),
      icon: <Group sx={{ color: "#3b82f6" }} />,
      color: "#3b82f6",
      change: loading ? "..." : `${students} طالب`,
      changeType: "neutral",
    },
    {
      title: "المشاريع المكتملة",
      value: completedProjects.toString(),
      icon: <TrendingUp sx={{ color: "#16a34a" }} />,
      color: "#16a34a",
      change: loading ? "..." : "0+",
      changeType: "positive",
    },
    {
      title: "المشاريع النشطة",
      value: activeProjects.toString(),
      icon: <Assignment sx={{ color: "#3b82f6" }} />,
      color: "#3b82f6",
      change: loading ? "..." : "0+",
      changeType: "positive",
    },
  ];

  // جلب المشاريع الحديثة من البيانات الحقيقية
  const recentProjects = projects
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3)
    .map((project) => {
      // البحث عن المشرف
      const supervisor = users.find((u) => u.id === project.supervisorId);
      return {
        id: project.id,
        title: project.title,
        status: project.status,
        progress: project.progress,
        dueDate: project.dueDate,
        supervisor: supervisor?.name || "مشرف غير محدد",
      };
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#16a34a";
      case "review":
        return "#f59e0b";
      case "planning":
        return "#3b82f6";
      case "completed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "review":
        return "قيد المراجعة";
      case "planning":
        return "قيد التخطيط";
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

  const getRoleIcon = () => {
    switch (user?.role) {
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

  const drawer = (
    <Box sx={{ width: 280, margin: 0, padding: 0 }}>
      <Box sx={{ p: 1, textAlign: "center" }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mx: "auto",
            mb: 2,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            fontSize: "1.5rem",
          }}
        >
          {user?.avatar || user?.name?.charAt(0) || "م"}
        </Avatar>
        <Typography variant="h6" fontWeight={600}>
          {user?.name || "مستخدم"}
        </Typography>
        <Chip
          icon={getRoleIcon()}
          label={getRoleDisplayText()}
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      <Divider />

      <List sx={{ pt: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            component="button"
            onClick={() => setActivePage(item.page)}
            sx={{
              backgroundColor: item.active ? "primary.light" : "transparent",
              color: item.active ? "primary.contrastText" : "inherit",
              "&:hover": {
                backgroundColor: item.active ? "primary.main" : "action.hover",
              },
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            <ListItemIcon
              sx={{
                color: item.active ? "primary.contrastText" : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderDashboardContent = () => (
    <Box
      sx={{
        flexGrow: 1,
        p: 0.5,
        width: "100%",
        maxWidth: "none",
        overflow: "hidden",
        margin: 0,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "none", margin: 0, padding: 0 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            لوحة التحكم
          </Typography>
          <Typography variant="h5" fontWeight={600} mb={1}>
            مرحباً بك، {user?.name?.split(" ")[0] || "مستخدم"}! 👋
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            إليك نظرة عامة على مشاريعك وتقدمك الأكاديمي
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 2, width: "100%" }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card sx={{ height: "auto" }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: theme.palette.grey[100],
                            mr: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h4" fontWeight={700}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2">{stat.title}</Typography>
                        </Box>
                      </Box>
                      <Chip label={stat.change} size="small" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Content Sections */}
            <Grid container spacing={3} sx={{ width: "100%", mt: 0 }}>
              <Grid item xs={12} lg={8} xl={9}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      المشاريع الحديثة
                    </Typography>

                    {projects.length > 0 ? (
                      <Box>
                        {projects.slice(0, 3).map((project) => (
                          <Box
                            key={project.id}
                            sx={{
                              p: 2,
                              mb: 2,
                              border: "1px solid #e2e8f0",
                              borderRadius: 2,
                              backgroundColor: "#f8fafc",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              color="#1e293b"
                              mb={1}
                            >
                              {project.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="#64748b"
                              sx={{ mb: 2 }}
                            >
                              المشرف: {project.supervisorId || "غير محدد"}
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                color="#64748b"
                                sx={{ mb: 0.5 }}
                              >
                                التقدم
                              </Typography>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 8,
                                  backgroundColor: "#e2e8f0",
                                  borderRadius: 4,
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${project.progress || 0}%`,
                                    height: "100%",
                                    backgroundColor: "#3b82f6",
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              color="#64748b"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              تاريخ الاستحقاق: {project.dueDate}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                          color: "#64748b",
                        }}
                      >
                        <Typography variant="body1">
                          لا توجد مشاريع حالياً
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4} xl={3}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        النشاطات القادمة
                      </Typography>
                      <Button
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        عرض الكل
                      </Button>
                    </Box>

                    {projects.length > 0 ? (
                      <Box>
                        {projects.slice(0, 2).map((project) => (
                          <Box
                            key={project.id}
                            sx={{
                              p: 2,
                              mb: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2,
                              backgroundColor: theme.palette.success.light,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Assignment
                                sx={{
                                  color: "success.main",
                                  mr: 1,
                                  fontSize: 20,
                                }}
                              />
                              <Typography variant="subtitle2" fontWeight={600}>
                                مشروع
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {getStatusText(project.status)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              تاريخ الاستحقاق: {project.dueDate}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                        }}
                      >
                        <Typography variant="body1">
                          لا توجد نشاطات قادمة
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );

  const renderPageContent = () => {
    switch (activePage) {
      case "dashboard":
        return renderDashboardContent();
      case "projects":
        return <ProjectsPage />;
      case "users":
        return <UsersPage />;
      case "chat":
        return <ChatPage />;
      case "advisor":
        return <AdvisorPage />;
      case "library":
        return <LibraryPage />;
      case "team":
        return <TeamPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "profile":
        return <ProfilePage />;
      case "help":
        return <HelpPage />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              zIndex: 1200,
              margin: 0,
              padding: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "none",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            width: "100%",
            margin: 0,
            padding: 0,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", padding: "0 8px" }}>
            {/* Left Section */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 2 }}
                >
                  <DashboardIcon />
                </IconButton>
              )}

              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {menuItems.find((item) => item.page === activePage)?.text ||
                  "لوحة التحكم"}
              </Typography>
            </Box>

            {/* Right Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton>
                <Search />
              </IconButton>

              <IconButton onClick={toggleTheme}>
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>

              <IconButton onClick={() => setNotificationsOpen(true)}>
                <Badge badgeContent={unreadNotifications} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <IconButton onClick={handleLogout} sx={{ color: "error.main" }}>
                <Logout />
              </IconButton>

              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    fontSize: "0.875rem",
                  }}
                >
                  {user?.avatar || user?.name?.charAt(0) || "م"}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            الملف الشخصي
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            الإعدادات
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            تسجيل الخروج
          </MenuItem>
        </Menu>

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            width: "100%",
            maxWidth: "none",
          }}
        >
          {renderPageContent()}
        </Box>
      </Box>

      {/* Notification System */}
      <NotificationSystem
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;
