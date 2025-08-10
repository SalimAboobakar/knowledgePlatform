import React from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface MobileOptimizationsProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const MobileOptimizations: React.FC<MobileOptimizationsProps> = ({
  children,
  onNavigate,
  currentPage,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [speedDialOpen, setSpeedDialOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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

  const getMenuItems = () => {
    const baseItems = [
      {
        icon: <DashboardIcon />,
        text: "لوحة التحكم",
        page: "dashboard",
        active: currentPage === "dashboard",
      },
      {
        icon: <AssignmentIcon />,
        text: "المشاريع",
        page: "projects",
        active: currentPage === "projects",
      },
    ];

    if (user?.role === "admin" || user?.role === "supervisor") {
      baseItems.push({
        icon: <PersonIcon />,
        text: "إدارة المستخدمين",
        page: "users",
        active: currentPage === "users",
      });
    }

    baseItems.push(
      {
        icon: <ChatIcon />,
        text: "المراسلة",
        page: "chat",
        active: currentPage === "chat",
      },
      {
        icon: <BookIcon />,
        text: "المكتبة",
        page: "library",
        active: currentPage === "library",
      },
      {
        icon: <GroupIcon />,
        text: "الفريق",
        page: "team",
        active: currentPage === "team",
      },
      {
        icon: <AnalyticsIcon />,
        text: "التقارير",
        page: "reports",
        active: currentPage === "reports",
      },
      {
        icon: <SettingsIcon />,
        text: "الإعدادات",
        page: "settings",
        active: currentPage === "settings",
      },
      {
        icon: <HelpIcon />,
        text: "المساعدة",
        page: "help",
        active: currentPage === "help",
      }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  const speedDialActions = [
    {
      icon: <AssignmentIcon />,
      name: "مشروع جديد",
      action: () => onNavigate("projects"),
    },
    {
      icon: <ChatIcon />,
      name: "رسالة جديدة",
      action: () => onNavigate("chat"),
    },
    {
      icon: <PersonIcon />,
      name: "مستخدم جديد",
      action: () => onNavigate("users"),
    },
  ];

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Mobile App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "text.primary" }}
          >
            {menuItems.find((item) => item.page === currentPage)?.text ||
              "لوحة التحكم"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton>
              <SearchIcon />
            </IconButton>

            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
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
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          الملف الشخصي
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          الإعدادات
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          تسجيل الخروج
        </MenuItem>
      </Menu>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: "90vw",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight={600}>
              القائمة
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <List sx={{ pt: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              component="button"
              onClick={() => {
                onNavigate(item.page);
                setMobileMenuOpen(false);
              }}
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
              {item.active && (
                <Chip
                  label="نشط"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {children}
      </Box>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="إجراءات سريعة"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.action();
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </SpeedDial>

      {/* Mobile Bottom Navigation */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            py: 1,
          }}
        >
          {menuItems.slice(0, 4).map((item, index) => (
            <Box
              key={index}
              onClick={() => onNavigate(item.page)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 1,
                cursor: "pointer",
                borderRadius: 1,
                backgroundColor: item.active ? "primary.light" : "transparent",
                color: item.active ? "primary.main" : "text.secondary",
                minWidth: 60,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Box sx={{ fontSize: "1.5rem", mb: 0.5 }}>
                {item.icon}
              </Box>
              <Typography variant="caption" textAlign="center">
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom Spacing for Mobile Navigation */}
      <Box sx={{ height: 80 }} />
    </Box>
  );
};

export default MobileOptimizations; 