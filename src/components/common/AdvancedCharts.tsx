import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  Group,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface ProgressData {
  label: string;
  value: number;
  target: number;
  color: string;
  icon: React.ReactNode;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}) => (
  <Card
    sx={{
      height: "100%",
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      border: "1px solid",
      borderColor: "divider",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={700} color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      <Chip
        label={change}
        size="small"
        color={
          changeType === "positive"
            ? "success"
            : changeType === "negative"
            ? "error"
            : "default"
        }
        variant="outlined"
        icon={
          changeType === "positive" ? (
            <TrendingUp fontSize="small" />
          ) : changeType === "negative" ? (
            <TrendingDown fontSize="small" />
          ) : undefined
        }
      />
    </CardContent>
  </Card>
);

interface ProgressChartProps {
  data: ProgressData[];
  title: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, title }) => (
  <Card
    sx={{
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <CardContent>
      <Typography variant="h6" fontWeight={600} mb={3}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {data.map((item, index) => (
          <Box key={index}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ color: item.color }}>{item.icon}</Box>
                <Typography variant="body2" fontWeight={500}>
                  {item.label}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {item.value}/{item.target}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(item.value / item.target) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: item.color,
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
);

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  title: string;
  total: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, total }) => {
  const radius = 60;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(radius, radius, radius, endAngle);
    const end = polarToCartesian(radius, radius, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  let currentAngle = 0;
  const arcs = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = currentAngle;
    const endAngle = currentAngle + (percentage * 360) / 100;
    currentAngle = endAngle;

    return {
      ...item,
      startAngle,
      endAngle,
      percentage,
      path: createArc(startAngle, endAngle),
    };
  });

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3} textAlign="center">
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <svg width={radius * 2} height={radius * 2}>
              {arcs.map((arc, index) => (
                <path
                  key={index}
                  d={arc.path}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
          {arcs.map((arc, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: arc.color,
                  }}
                />
                <Typography variant="body2">{arc.label}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {arc.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

interface AdvancedChartsProps {
  projectStats: {
    total: number;
    active: number;
    completed: number;
    planning: number;
  };
  userStats: {
    students: number;
    supervisors: number;
    admins: number;
  };
  progressData: ProgressData[];
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  projectStats,
  userStats,
  progressData,
}) => {
  const statsCards = [
    {
      title: "المشاريع النشطة",
      value: projectStats.active,
      change: "+2",
      changeType: "positive" as const,
      icon: <Assignment color="primary" />,
      color: "primary.main",
    },
    {
      title: "المشاريع المكتملة",
      value: projectStats.completed,
      change: "+8",
      changeType: "positive" as const,
      icon: <CheckCircle color="success" />,
      color: "success.main",
    },
    {
      title: "الطلاب النشطين",
      value: userStats.students,
      change: "+5",
      changeType: "positive" as const,
      icon: <Group color="info" />,
      color: "info.main",
    },
    {
      title: "المشاريع قيد التخطيط",
      value: projectStats.planning,
      change: "3",
      changeType: "neutral" as const,
      icon: <Schedule color="warning" />,
      color: "warning.main",
    },
  ];

  const projectDistributionData = [
    { label: "نشط", value: projectStats.active, color: "#6366f1" },
    { label: "مكتمل", value: projectStats.completed, color: "#10b981" },
    { label: "قيد التخطيط", value: projectStats.planning, color: "#f59e0b" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        الإحصائيات المتقدمة
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <DonutChart
            data={projectDistributionData}
            title="توزيع المشاريع"
            total={projectStats.total}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ProgressChart data={progressData} title="تقدم المشاريع" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedCharts;
