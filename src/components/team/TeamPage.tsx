import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Group as GroupIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { UserService } from "../../services/firebaseService";
import { User } from "../../data/mockData";

interface TeamMember {
  id: string;
  user: User;
  role: "leader" | "member" | "mentor";
  joinDate: string;
  skills: string[];
  projects: number;
  completedTasks: number;
  rating: number;
  status: "active" | "inactive" | "pending";
}

interface Team {
  id: string;
  name: string;
  description: string;
  leader: User;
  members: TeamMember[];
  projects: string[];
  createdAt: string;
  updatedAt: string;
}

const mockTeams: Team[] = [
  {
    id: "1",
    name: "فريق تطوير الذكاء الاصطناعي",
    description: "فريق متخصص في تطوير حلول الذكاء الاصطناعي والتعلم الآلي",
    leader: {
      id: "1",
      name: "د. أحمد محمد",
      email: "ahmed@university.edu",
      role: "supervisor",
      department: "كلية الهندسة",
      specialization: "هندسة الحاسوب",
      avatar: "أح",
      phone: "+966501234567",
      studentId: "",
    },
    members: [
      {
        id: "1",
        user: {
          id: "2",
          name: "سارة أحمد",
          email: "sara@university.edu",
          role: "student",
          department: "كلية الهندسة",
          specialization: "هندسة البرمجيات",
          avatar: "سا",
          phone: "+966501234568",
          studentId: "2021001",
        },
        role: "member",
        joinDate: "2023-01-15",
        skills: ["Python", "Machine Learning", "Data Analysis"],
        projects: 3,
        completedTasks: 15,
        rating: 4.5,
        status: "active",
      },
      {
        id: "2",
        user: {
          id: "3",
          name: "محمد علي",
          email: "mohammed@university.edu",
          role: "student",
          department: "كلية الهندسة",
          specialization: "هندسة البرمجيات",
          avatar: "مح",
          phone: "+966501234569",
          studentId: "2021002",
        },
        role: "member",
        joinDate: "2023-02-01",
        skills: ["JavaScript", "React", "Node.js"],
        projects: 2,
        completedTasks: 12,
        rating: 4.2,
        status: "active",
      },
    ],
    projects: ["مشروع 1", "مشروع 2"],
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
  },
  {
    id: "2",
    name: "فريق تطوير الويب",
    description: "فريق متخصص في تطوير تطبيقات الويب الحديثة",
    leader: {
      id: "4",
      name: "د. فاطمة حسن",
      email: "fatima@university.edu",
      role: "supervisor",
      department: "كلية الهندسة",
      specialization: "هندسة البرمجيات",
      avatar: "فا",
      phone: "+966501234570",
      studentId: "",
    },
    members: [
      {
        id: "3",
        user: {
          id: "5",
          name: "علي أحمد",
          email: "ali@university.edu",
          role: "student",
          department: "كلية الهندسة",
          specialization: "هندسة البرمجيات",
          avatar: "عل",
          phone: "+966501234571",
          studentId: "2021003",
        },
        role: "member",
        joinDate: "2023-01-20",
        skills: ["HTML", "CSS", "JavaScript", "React"],
        projects: 4,
        completedTasks: 20,
        rating: 4.8,
        status: "active",
      },
    ],
    projects: ["مشروع 3", "مشروع 4"],
    createdAt: "2023-01-10",
    updatedAt: "2023-01-10",
  },
];

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
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

  const [newTeamData, setNewTeamData] = useState({
    name: "",
    description: "",
  });

  const [newMemberData, setNewMemberData] = useState({
    userId: "",
    role: "member",
  });

  const handleCreateTeam = async () => {
    if (!newTeamData.name.trim() || !newTeamData.description.trim()) {
      setSnackbar({
        open: true,
        message: "يرجى ملء جميع الحقول المطلوبة",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // محاكاة إنشاء فريق جديد
      const newTeam: Team = {
        id: Date.now().toString(),
        name: newTeamData.name,
        description: newTeamData.description,
        leader: {
          id: user?.email || "",
          name: user?.email?.split("@")[0] || "مستخدم",
          email: user?.email || "",
          role: "student",
          department: "",
          specialization: "",
          avatar: "",
        },
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTeams((prev) => [...prev, newTeam]);
      setShowCreateTeamDialog(false);
      setNewTeamData({ name: "", description: "" });

      setSnackbar({
        open: true,
        message: "تم إنشاء الفريق بنجاح",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error creating team:", error);
      setSnackbar({
        open: true,
        message: "خطأ في إنشاء الفريق",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberData.userId || !selectedTeam) {
      setSnackbar({
        open: true,
        message: "يرجى اختيار عضو للفريق",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // محاكاة إضافة عضو جديد
      const updatedTeams = teams.map((team) =>
        team.id === selectedTeam.id
          ? {
              ...team,
              members: [
                ...team.members,
                {
                  id: Date.now().toString(),
                  user: { id: newMemberData.userId, name: "عضو جديد" } as User,
                  role: newMemberData.role as "leader" | "member" | "mentor",
                  joinDate: new Date().toISOString(),
                  skills: [],
                  projects: 0,
                  completedTasks: 0,
                  rating: 0,
                  status: "active" as "active" | "inactive" | "pending",
                },
              ],
            }
          : team
      );

      setTeams(updatedTeams);
      setShowAddMemberDialog(false);
      setNewMemberData({ userId: "", role: "member" });

      setSnackbar({
        open: true,
        message: "تم إضافة العضو بنجاح",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error adding member:", error);
      setSnackbar({
        open: true,
        message: "خطأ في إضافة العضو",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "leader":
        return "قائد الفريق";
      case "member":
        return "عضو";
      case "mentor":
        return "مرشد";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "leader":
        return "error";
      case "member":
        return "primary";
      case "mentor":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "inactive":
        return "غير نشط";
      case "pending":
        return "في الانتظار";
      default:
        return status;
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
          <GroupIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            إدارة الفريق
          </Typography>
        </Box>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateTeamDialog(true)}
          >
            إنشاء فريق جديد
          </Button>
        )}
      </Box>

      {/* تبويبات العرض */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab label="جميع الفرق" />
          <Tab label="فرقي" />
          <Tab label="إحصائيات الفريق" />
        </Tabs>
      </Box>

      {/* عرض الفرق */}
      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                    {team.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.members.length} عضو
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {team.description}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                    {team.leader.avatar || team.leader.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {team.leader.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      قائد الفريق
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                >
                  {team.projects.slice(0, 2).map((project, index) => (
                    <Chip
                      key={index}
                      label={project}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                  {team.projects.length > 2 && (
                    <Chip
                      label={`+${team.projects.length - 2}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  تم الإنشاء:{" "}
                  {new Date(team.createdAt).toLocaleDateString("ar-EG")}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between" }}>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowAddMemberDialog(true);
                    }}
                    title="إضافة عضو"
                  >
                    <PersonAddIcon />
                  </IconButton>
                  <IconButton size="small" title="تعديل">
                    <EditIcon />
                  </IconButton>
                </Box>
                <Button size="small" variant="outlined">
                  عرض التفاصيل
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {teams.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <GroupIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لا توجد فرق متاحة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ابدأ بإنشاء فريق جديد
          </Typography>
        </Box>
      )}

      {/* حوار إنشاء فريق */}
      <Dialog
        open={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>إنشاء فريق جديد</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="اسم الفريق"
            value={newTeamData.name}
            onChange={(e) =>
              setNewTeamData({ ...newTeamData, name: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="وصف الفريق"
            value={newTeamData.description}
            onChange={(e) =>
              setNewTeamData({ ...newTeamData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateTeamDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleCreateTeam}
            variant="contained"
            disabled={loading}
          >
            إنشاء الفريق
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار إضافة عضو */}
      <Dialog
        open={showAddMemberDialog}
        onClose={() => setShowAddMemberDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>إضافة عضو للفريق</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="معرف المستخدم"
            value={newMemberData.userId}
            onChange={(e) =>
              setNewMemberData({ ...newMemberData, userId: e.target.value })
            }
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>دور العضو</InputLabel>
            <Select
              value={newMemberData.role}
              onChange={(e) =>
                setNewMemberData({ ...newMemberData, role: e.target.value })
              }
              label="دور العضو"
            >
              <MenuItem value="member">عضو</MenuItem>
              <MenuItem value="mentor">مرشد</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddMemberDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={loading}
          >
            إضافة العضو
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

export default TeamPage;
