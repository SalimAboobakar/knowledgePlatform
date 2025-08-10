import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Alert,
  Snackbar,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  QuestionAnswer as FAQIcon,
  Book as GuideIcon,
  Support as SupportIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "كيف يمكنني إنشاء مشروع جديد؟",
    answer:
      "يمكنك إنشاء مشروع جديد من خلال الذهاب إلى صفحة المشاريع والضغط على زر 'إنشاء مشروع جديد'. ثم قم بملء النموذج بالمعلومات المطلوبة مثل عنوان المشروع والوصف والتخصص.",
    category: "المشاريع",
  },
  {
    question: "كيف يمكنني التواصل مع المشرف؟",
    answer:
      "يمكنك التواصل مع المشرف من خلال نظام الرسائل المدمج في كل مشروع. اذهب إلى تفاصيل المشروع وستجد قسم الرسائل في الأسفل.",
    category: "التواصل",
  },
  {
    question: "كيف يمكنني تحديث تقدم المشروع؟",
    answer:
      "يمكنك تحديث تقدم المشروع من خلال تحديث حالة المهام الفرعية. كل مهمة مكتملة تساهم في زيادة نسبة التقدم الإجمالية للمشروع.",
    category: "المشاريع",
  },
  {
    question: "كيف يمكنني تغيير كلمة المرور؟",
    answer:
      "يمكنك تغيير كلمة المرور من خلال الذهاب إلى الإعدادات ثم اختيار 'الأمان' وتفعيل خيار تغيير كلمة المرور.",
    category: "الحساب",
  },
  {
    question: "كيف يمكنني تصدير تقرير المشروع؟",
    answer:
      "يمكنك تصدير تقرير المشروع من صفحة التقارير والإحصائيات. اضغط على زر 'تصدير التقرير' لتحميل التقرير بصيغة نصية.",
    category: "التقارير",
  },
  {
    question: "ما هي أنواع المشاريع المتاحة؟",
    answer:
      "الأنواع المتاحة تشمل: مشروع تخرج، بحث علمي، دراسة حالة، مشروع تطبيقي، وغيرها من الأنواع الأكاديمية.",
    category: "المشاريع",
  },
  {
    question: "كيف يمكنني إضافة ملفات للمشروع؟",
    answer:
      "يمكنك إضافة ملفات للمشروع من خلال نظام إدارة الملفات المدمج. اذهب إلى تفاصيل المشروع وستجد قسم الملفات.",
    category: "الملفات",
  },
  {
    question: "كيف يمكنني البحث عن مشاريع سابقة؟",
    answer:
      "يمكنك البحث عن المشاريع من خلال صفحة المشاريع باستخدام فلاتر البحث المتاحة مثل التخصص أو الحالة أو التاريخ.",
    category: "البحث",
  },
];

const HelpPage: React.FC = () => {
  const { user } = useAuth();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // محاكاة إرسال الرسالة
    setSnackbar({
      open: true,
      message: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.",
      severity: "success",
    });

    // إعادة تعيين النموذج
    setContactForm({
      name: "",
      email: user?.email || "",
      subject: "",
      message: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const categories = Array.from(new Set(faqData.map((item) => item.category)));

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
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <HelpIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          المساعدة والدعم
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* الأسئلة الشائعة */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <FAQIcon sx={{ mr: 1 }} />
                <Typography variant="h5">الأسئلة الشائعة</Typography>
              </Box>

              {categories.map((category) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "primary.main" }}
                  >
                    {category}
                  </Typography>
                  {faqData
                    .filter((item) => item.category === category)
                    .map((item, index) => (
                      <Accordion key={index} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="body1" fontWeight={500}>
                            {item.question}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary">
                            {item.answer}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* معلومات الاتصال */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SupportIcon sx={{ mr: 1 }} />
                <Typography variant="h6">معلومات الاتصال</Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="البريد الإلكتروني"
                    secondary="salim.a.alhafidh@gmail.com"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="الهاتف" secondary="+968 92619995" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="العنوان"
                    secondary="وزارة التعليم العالي والبحث العلمي والابتكار"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* ساعات العمل */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ساعات العمل
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="الأحد - الخميس"
                    secondary="8:00 ص - 4:00 م"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="الجمعة - السبت" secondary="مغلق" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* نموذج الاتصال */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <SupportIcon sx={{ mr: 1 }} />
            <Typography variant="h5">تواصل معنا</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                إذا لم تجد إجابة لسؤالك في الأسئلة الشائعة، يمكنك التواصل معنا
                مباشرة من خلال النموذج التالي:
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
                  <Typography variant="body2">
                    استجابة سريعة خلال 24 ساعة
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
                  <Typography variant="body2">دعم فني متخصص</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleIcon sx={{ mr: 1, color: "success.main" }} />
                  <Typography variant="body2">حلول شاملة للمشاكل</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box component="form" onSubmit={handleContactSubmit}>
                <TextField
                  fullWidth
                  label="الاسم"
                  value={contactForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="الموضوع"
                  value={contactForm.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="الرسالة"
                  multiline
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SendIcon />}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  إرسال الرسالة
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* دليل سريع */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <GuideIcon sx={{ mr: 1 }} />
            <Typography variant="h5">دليل سريع</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  1
                </Typography>
                <Typography variant="body2">سجل دخول إلى حسابك</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  2
                </Typography>
                <Typography variant="body2">اذهب إلى صفحة المشاريع</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  3
                </Typography>
                <Typography variant="body2">
                  أنشئ مشروع جديد أو اختر مشروع موجود
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  4
                </Typography>
                <Typography variant="body2">ابدأ العمل على مشروعك</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* نصائح مفيدة */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            نصائح مفيدة
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2">
                  احفظ عملك بانتظام لتجنب فقدان البيانات
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="warning" icon={<WarningIcon />}>
                <Typography variant="body2">
                  تأكد من صحة معلومات المشروع قبل الإرسال
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="success" icon={<CheckCircleIcon />}>
                <Typography variant="body2">
                  تواصل مع المشرف بانتظام لتحديث التقدم
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default HelpPage;
