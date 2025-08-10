import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "project" | "message" | "system" | "reminder";
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
}

interface NotificationSystemProps {
  open: boolean;
  onClose: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  open,
  onClose,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      // جلب الإشعارات من Firebase
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("recipientId", "==", user.id)
        // إزالة orderBy مؤقتاً لتجنب الحاجة للـ index
      );

      const querySnapshot = await getDocs(q);
      const notificationsData: Notification[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsData.push({
          id: doc.id,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category,
          isRead: data.isRead,
          createdAt: data.createdAt?.toDate() || new Date(),
          actionUrl: data.actionUrl,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
        });
      });

      // ترتيب الإشعارات حسب التاريخ (الأحدث أولاً)
      notificationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("خطأ في تحميل الإشعارات");

      // استخدام بيانات تجريبية في حالة الخطأ
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "مشروع جديد تم تعيينه",
          message: "تم تعيينك كمشرف على مشروع 'تطوير تطبيق إدارة المشاريع'",
          type: "info",
          category: "project",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 دقيقة مضت
          senderId: "admin1",
          senderName: "د. أحمد محمد",
          senderAvatar: "أح",
        },
        {
          id: "2",
          title: "رسالة جديدة",
          message: "لديك رسالة جديدة من الطالب محمد علي",
          type: "info",
          category: "message",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // ساعتان مضتا
          senderId: "student1",
          senderName: "محمد علي",
          senderAvatar: "مح",
        },
        {
          id: "3",
          title: "تذكير: موعد تسليم",
          message: "تذكير: مشروع 'تحليل البيانات' مستحق غداً",
          type: "warning",
          category: "reminder",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // يوم مضى
        },
        {
          id: "4",
          title: "مشروع مكتمل",
          message: "تم إكمال مشروع 'نظام الذكاء الاصطناعي' بنجاح",
          type: "success",
          category: "project",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // يومان مضيا
        },
      ];
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // تحميل الإشعارات
  useEffect(() => {
    if (open && user?.id) {
      loadNotifications();
    }
  }, [open, user?.id, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      // تحديث في Firebase
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { isRead: true });

      // تحديث في الواجهة
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // تحديث جميع الإشعارات غير المقروءة في Firebase
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      const updatePromises = unreadNotifications.map((notification) => {
        const notificationRef = doc(db, "notifications", notification.id);
        return updateDoc(notificationRef, { isRead: true });
      });

      await Promise.all(updatePromises);

      // تحديث في الواجهة
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // حذف من Firebase
      const notificationRef = doc(db, "notifications", notificationId);
      await deleteDoc(notificationRef);

      // حذف من الواجهة
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (category: string, type: string) => {
    switch (category) {
      case "project":
        return <AssignmentIcon />;
      case "message":
        return <MessageIcon />;
      case "reminder":
        return <ScheduleIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "success.main";
      case "warning":
        return "warning.main";
      case "error":
        return "error.main";
      default:
        return "info.main";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: "90vw",
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            الإشعارات
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Tooltip title="تحديد الكل كمقروء">
                <IconButton onClick={markAllAsRead} size="small">
                  <MarkReadIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <NotificationsIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary">
              لا توجد إشعارات جديدة
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "action.hover",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: getNotificationColor(
                          notification.type
                        ),
                        color: "white",
                      }}
                    >
                      {notification.senderAvatar ||
                        getNotificationIcon(
                          notification.category,
                          notification.type
                        )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={notification.isRead ? 400 : 600}
                          sx={{ flex: 1 }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={
                            notification.category === "project"
                              ? "مشروع"
                              : notification.category === "message"
                              ? "رسالة"
                              : notification.category === "reminder"
                              ? "تذكير"
                              : "نظام"
                          }
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(notification.createdAt, {
                              addSuffix: true,
                              locale: ar,
                            })}
                          </Typography>
                          {notification.senderName && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              من: {notification.senderName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {!notification.isRead && (
                      <Tooltip title="تحديد كمقروء">
                        <IconButton
                          size="small"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="حذف">
                      <IconButton
                        size="small"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationSystem;
