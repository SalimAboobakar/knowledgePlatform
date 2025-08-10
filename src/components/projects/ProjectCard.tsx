import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Tooltip,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Share,
  Archive,
  CalendarToday,
  Assignment,
} from "@mui/icons-material";
import { Project, students, supervisors } from "../../data/mockData";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleMenuClose();
    if (action === "edit" && onEdit) {
      onEdit();
    } else if (action === "view") {
      onClick();
    } else if (action === "delete" && onDelete) {
      onDelete();
    }
    console.log(`Action: ${action} for project: ${project.id}`);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "warning";
    return "error";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "default";
      case "active":
        return "primary";
      case "review":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planning":
        return "قيد التخطيط";
      case "active":
        return "نشط";
      case "review":
        return "قيد المراجعة";
      case "completed":
        return "مكتمل";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // الحصول على بيانات الطالب والمشرف
  const student = students.find((s) => s.id === project.studentId);
  const supervisor = supervisors.find((s) => s.id === project.supervisorId);

  return (
    <>
      <Card
        sx={{
          height: "100%",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 4,
            transform: "translateY(-4px)",
          },
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                mb={1}
                sx={{ lineHeight: 1.3 }}
              >
                {project.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, lineHeight: 1.4 }}
              >
                {project.description.length > 100
                  ? `${project.description.substring(0, 100)}...`
                  : project.description}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleMenuOpen} sx={{ ml: 1 }}>
              <MoreVert />
            </IconButton>
          </Box>

          {/* Status and Priority Chips */}
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <Chip
              label={getStatusText(project.status)}
              color={getStatusColor(project.status) as any}
              size="small"
            />
            <Chip
              label={getPriorityText(project.priority)}
              color={getPriorityColor(project.priority) as any}
              size="small"
              variant="outlined"
            />
            <Chip label={project.type} size="small" variant="outlined" />
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                التقدم
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              color={getProgressColor(project.progress) as any}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Tags */}
          <Box sx={{ display: "flex", gap: 0.5, mb: 2, flexWrap: "wrap" }}>
            {project.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            ))}
            {project.tags.length > 3 && (
              <Chip
                label={`+${project.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
          </Box>

          {/* Team Members */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: "0.7rem",
                  bgcolor: "primary.main",
                }}
              >
                {supervisor?.avatar}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {supervisor?.name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: "0.7rem",
                  bgcolor: "secondary.main",
                }}
              >
                {student?.avatar}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {student?.name}
              </Typography>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(project.dueDate)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Assignment sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {project.todoList.length} مهام
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => handleAction("view")}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>عرض التفاصيل</ListItemText>
        </MenuItem>
        {onEdit && (
          <MenuItem onClick={() => handleAction("edit")}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>تعديل</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleAction("share")}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>مشاركة</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction("archive")}>
          <ListItemIcon>
            <Archive fontSize="small" />
          </ListItemIcon>
          <ListItemText>أرشفة</ListItemText>
        </MenuItem>
        {onDelete && (
          <MenuItem
            onClick={() => handleAction("delete")}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>حذف</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ProjectCard;
