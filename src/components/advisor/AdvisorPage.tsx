import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material";
import {
  Send,
  SmartToy,
  Person,
  Lightbulb,
  Assignment,
  Help,
  Add,
  ContentCopy,
  Book,
  School,
  TrendingUp,
  Psychology,
  Science,
  Computer,
  Business,
  HealthAndSafety,
  Engineering,
  Security,
  Storage,
  NetworkCheck,
  Code,
  Web,
  PhoneAndroid,
  PsychologyAlt,
  Public,
  AccountBalance,
  Gavel,
  LocalHospital,
  Medication,
  Biotech,
  Agriculture,
  Landscape,
  Architecture,
  Build,
  Calculate,
  Functions,
  Language,
  Translate,
  History,
  Museum,
  MusicNote,
  TheaterComedy,
  SportsEsports,
  FitnessCenter,
  Restaurant,
  Hotel,
  Flight,
  DirectionsCar,
  Train,
  LocalShipping,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import {
  geminiService,
  ChatMessage,
  ResearchTopic,
} from "../../services/geminiService";

// تعريف هيكل المجالات الرئيسية والمجالات الفرعية
interface FieldCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  subFields: SubField[];
}

interface SubField {
  id: string;
  name: string;
  description: string;
}

const fieldCategories: FieldCategory[] = [
  {
    id: "computer-science",
    name: "علوم الحاسوب وتكنولوجيا المعلومات",
    icon: <Computer />,
    subFields: [
      {
        id: "software-engineering",
        name: "هندسة البرمجيات",
        description: "تطوير وتصميم البرمجيات والأنظمة",
      },
      {
        id: "artificial-intelligence",
        name: "الذكاء الاصطناعي",
        description: "تعلم الآلة والذكاء الاصطناعي",
      },
      {
        id: "data-science",
        name: "علم البيانات",
        description: "تحليل البيانات والبيانات الضخمة",
      },
      {
        id: "cybersecurity",
        name: "الأمن السيبراني",
        description: "أمن المعلومات والشبكات",
      },
      {
        id: "web-development",
        name: "تطوير الويب",
        description: "تطوير المواقع والتطبيقات الويب",
      },
      {
        id: "mobile-development",
        name: "تطوير التطبيقات المحمولة",
        description: "تطوير تطبيقات الهواتف",
      },
      {
        id: "network-engineering",
        name: "هندسة الشبكات",
        description: "تصميم وإدارة الشبكات",
      },
      {
        id: "database-systems",
        name: "أنظمة قواعد البيانات",
        description: "تصميم وإدارة قواعد البيانات",
      },
      {
        id: "cloud-computing",
        name: "الحوسبة السحابية",
        description: "خدمات الحوسبة السحابية",
      },
      {
        id: "game-development",
        name: "تطوير الألعاب",
        description: "تصميم وتطوير الألعاب الإلكترونية",
      },
    ],
  },
  {
    id: "engineering",
    name: "الهندسة",
    icon: <Engineering />,
    subFields: [
      {
        id: "civil-engineering",
        name: "الهندسة المدنية",
        description: "تصميم وبناء البنية التحتية",
      },
      {
        id: "mechanical-engineering",
        name: "الهندسة الميكانيكية",
        description: "تصميم الآلات والأنظمة الميكانيكية",
      },
      {
        id: "electrical-engineering",
        name: "الهندسة الكهربائية",
        description: "تصميم الأنظمة الكهربائية",
      },
      {
        id: "chemical-engineering",
        name: "الهندسة الكيميائية",
        description: "تصنيع المواد والعمليات الكيميائية",
      },
      {
        id: "industrial-engineering",
        name: "الهندسة الصناعية",
        description: "تحسين العمليات الصناعية",
      },
      {
        id: "biomedical-engineering",
        name: "الهندسة الطبية الحيوية",
        description: "تطوير الأجهزة الطبية",
      },
      {
        id: "environmental-engineering",
        name: "الهندسة البيئية",
        description: "حماية البيئة والموارد الطبيعية",
      },
      {
        id: "aerospace-engineering",
        name: "الهندسة الجوية والفضائية",
        description: "تصميم الطائرات والمركبات الفضائية",
      },
    ],
  },
  {
    id: "business",
    name: "إدارة الأعمال والاقتصاد",
    icon: <Business />,
    subFields: [
      {
        id: "management",
        name: "إدارة الأعمال",
        description: "إدارة الشركات والمؤسسات",
      },
      {
        id: "marketing",
        name: "التسويق",
        description: "استراتيجيات التسويق والمبيعات",
      },
      {
        id: "finance",
        name: "التمويل والمحاسبة",
        description: "إدارة المالية والمحاسبة",
      },
      {
        id: "entrepreneurship",
        name: "ريادة الأعمال",
        description: "إنشاء وإدارة المشاريع الناشئة",
      },
      {
        id: "human-resources",
        name: "إدارة الموارد البشرية",
        description: "إدارة شؤون الموظفين",
      },
      {
        id: "supply-chain",
        name: "إدارة سلسلة التوريد",
        description: "إدارة اللوجستيات والتوريد",
      },
      {
        id: "international-business",
        name: "الأعمال الدولية",
        description: "التجارة الدولية والأسواق العالمية",
      },
      {
        id: "e-commerce",
        name: "التجارة الإلكترونية",
        description: "إدارة المتاجر الإلكترونية",
      },
    ],
  },
  {
    id: "health-sciences",
    name: "العلوم الصحية والطبية",
    icon: <HealthAndSafety />,
    subFields: [
      { id: "medicine", name: "الطب", description: "التشخيص والعلاج الطبي" },
      { id: "pharmacy", name: "الصيدلة", description: "تصنيع وتطوير الأدوية" },
      { id: "nursing", name: "التمريض", description: "الرعاية التمريضية" },
      {
        id: "public-health",
        name: "الصحة العامة",
        description: "تعزيز الصحة المجتمعية",
      },
      {
        id: "nutrition",
        name: "التغذية",
        description: "علم التغذية والحميات الغذائية",
      },
      {
        id: "physiotherapy",
        name: "العلاج الطبيعي",
        description: "إعادة التأهيل والعلاج الطبيعي",
      },
      {
        id: "medical-laboratory",
        name: "المختبرات الطبية",
        description: "الفحوصات المخبرية الطبية",
      },
      {
        id: "radiology",
        name: "الأشعة",
        description: "التشخيص بالأشعة والتصوير الطبي",
      },
    ],
  },
  {
    id: "social-sciences",
    name: "العلوم الاجتماعية والإنسانية",
    icon: <Psychology />,
    subFields: [
      {
        id: "psychology",
        name: "علم النفس",
        description: "دراسة السلوك والعقل البشري",
      },
      {
        id: "sociology",
        name: "علم الاجتماع",
        description: "دراسة المجتمع والعلاقات الاجتماعية",
      },
      {
        id: "political-science",
        name: "العلوم السياسية",
        description: "دراسة السياسة والحكم",
      },
      {
        id: "economics",
        name: "الاقتصاد",
        description: "دراسة الموارد والثروة",
      },
      {
        id: "education",
        name: "التربية والتعليم",
        description: "طرق التدريس وتطوير التعليم",
      },
      {
        id: "communication",
        name: "الإعلام والاتصال",
        description: "وسائل الإعلام والتواصل",
      },
      {
        id: "anthropology",
        name: "الأنثروبولوجيا",
        description: "دراسة الثقافات والمجتمعات البشرية",
      },
      {
        id: "geography",
        name: "الجغرافيا",
        description: "دراسة الأرض والبيئة البشرية",
      },
    ],
  },
  {
    id: "natural-sciences",
    name: "العلوم الطبيعية",
    icon: <Science />,
    subFields: [
      { id: "physics", name: "الفيزياء", description: "دراسة المادة والطاقة" },
      {
        id: "chemistry",
        name: "الكيمياء",
        description: "دراسة المواد والتفاعلات الكيميائية",
      },
      {
        id: "biology",
        name: "علم الأحياء",
        description: "دراسة الكائنات الحية",
      },
      {
        id: "mathematics",
        name: "الرياضيات",
        description: "دراسة الأرقام والأنماط",
      },
      {
        id: "astronomy",
        name: "علم الفلك",
        description: "دراسة الفضاء والأجرام السماوية",
      },
      {
        id: "geology",
        name: "علم الجيولوجيا",
        description: "دراسة الأرض والصخور",
      },
      {
        id: "environmental-science",
        name: "العلوم البيئية",
        description: "دراسة البيئة والأنظمة البيئية",
      },
      {
        id: "marine-science",
        name: "العلوم البحرية",
        description: "دراسة المحيطات والكائنات البحرية",
      },
    ],
  },
  {
    id: "arts-humanities",
    name: "الفنون والآداب",
    icon: <TheaterComedy />,
    subFields: [
      {
        id: "literature",
        name: "الأدب",
        description: "دراسة النصوص الأدبية والكتابة الإبداعية",
      },
      {
        id: "history",
        name: "التاريخ",
        description: "دراسة الماضي والأحداث التاريخية",
      },
      {
        id: "philosophy",
        name: "الفلسفة",
        description: "دراسة الأفكار والمفاهيم الأساسية",
      },
      { id: "languages", name: "اللغات", description: "دراسة اللغات والترجمة" },
      {
        id: "fine-arts",
        name: "الفنون الجميلة",
        description: "الرسم والنحت والفنون البصرية",
      },
      {
        id: "music",
        name: "الموسيقى",
        description: "دراسة الموسيقى والتأليف الموسيقي",
      },
      {
        id: "theater",
        name: "المسرح",
        description: "الفنون المسرحية والتمثيل",
      },
      {
        id: "architecture",
        name: "العمارة",
        description: "تصميم المباني والمنشآت",
      },
    ],
  },
  {
    id: "agriculture",
    name: "الزراعة والموارد الطبيعية",
    icon: <Agriculture />,
    subFields: [
      {
        id: "crop-science",
        name: "علم المحاصيل",
        description: "زراعة وإنتاج المحاصيل",
      },
      {
        id: "animal-science",
        name: "علم الحيوان",
        description: "تربية وإدارة الحيوانات",
      },
      {
        id: "soil-science",
        name: "علم التربة",
        description: "دراسة التربة وخصائصها",
      },
      {
        id: "forestry",
        name: "الغابات",
        description: "إدارة الغابات والموارد الحرجية",
      },
      {
        id: "fisheries",
        name: "مصايد الأسماك",
        description: "إدارة المصايد والموارد المائية",
      },
      {
        id: "horticulture",
        name: "البستنة",
        description: "زراعة النباتات والزهور",
      },
      {
        id: "agricultural-economics",
        name: "الاقتصاد الزراعي",
        description: "الاقتصاد في القطاع الزراعي",
      },
      {
        id: "food-science",
        name: "علوم الغذاء",
        description: "تطوير وتصنيع الأغذية",
      },
    ],
  },
  {
    id: "tourism-hospitality",
    name: "السياحة والضيافة",
    icon: <Hotel />,
    subFields: [
      {
        id: "tourism-management",
        name: "إدارة السياحة",
        description: "إدارة الوجهات السياحية",
      },
      {
        id: "hotel-management",
        name: "إدارة الفنادق",
        description: "إدارة الفنادق والمنشآت السياحية",
      },
      {
        id: "restaurant-management",
        name: "إدارة المطاعم",
        description: "إدارة المطاعم والخدمات الغذائية",
      },
      {
        id: "event-management",
        name: "إدارة الفعاليات",
        description: "تنظيم وإدارة الفعاليات",
      },
      {
        id: "travel-agency",
        name: "وكالات السفر",
        description: "خدمات السفر والسياحة",
      },
      {
        id: "cultural-tourism",
        name: "السياحة الثقافية",
        description: "السياحة التراثية والثقافية",
      },
      {
        id: "ecotourism",
        name: "السياحة البيئية",
        description: "السياحة المستدامة والبيئية",
      },
      {
        id: "adventure-tourism",
        name: "السياحة المغامرة",
        description: "سياحة المغامرات والأنشطة الخارجية",
      },
    ],
  },
  {
    id: "transportation-logistics",
    name: "النقل واللوجستيات",
    icon: <LocalShipping />,
    subFields: [
      {
        id: "logistics-management",
        name: "إدارة اللوجستيات",
        description: "إدارة سلاسل التوريد والنقل",
      },
      {
        id: "supply-chain",
        name: "إدارة سلسلة التوريد",
        description: "تحسين سلاسل التوريد",
      },
      {
        id: "transportation-planning",
        name: "تخطيط النقل",
        description: "تخطيط أنظمة النقل",
      },
      {
        id: "aviation",
        name: "الطيران",
        description: "إدارة الطيران والملاحة الجوية",
      },
      {
        id: "maritime",
        name: "الملاحة البحرية",
        description: "إدارة الشحن البحري",
      },
      {
        id: "railway",
        name: "السكك الحديدية",
        description: "إدارة النقل بالسكك الحديدية",
      },
      {
        id: "urban-transport",
        name: "النقل الحضري",
        description: "تخطيط النقل في المدن",
      },
      {
        id: "fleet-management",
        name: "إدارة الأساطيل",
        description: "إدارة أساطيل المركبات",
      },
    ],
  },
];

const AdvisorPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedTopics, setSuggestedTopics] = useState<ResearchTopic[]>([]);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubField, setSelectedSubField] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("intermediate");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // إضافة رسالة ترحيب
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `مرحباً ${user?.name || "طالب"}! 👋

أنا مرشدك الأكاديمي الذكي، ويمكنني مساعدتك في:

🔍 **اختيار مواضيع البحوث والرسائل العلمية**
💡 **تطوير أفكار المشاريع**
🎯 **توجيهك في مجالات الدراسة المختلفة**
📚 **تقديم نصائح حول منهجية البحث**
✍️ **مساعدتك في كتابة المقترحات البحثية**

يمكنك أن تسألني أي سؤال يتعلق بدراستك أو مشاريعك البحثية. سأكون سعيداً بمساعدتك! 🚀`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user?.name, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.sendMessage(inputMessage);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestTopics = async () => {
    if (!selectedCategory || !selectedSubField) {
      setSnackbar({
        open: true,
        message: "يرجى اختيار المجال والمجال الفرعي",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const category = fieldCategories.find(
        (cat) => cat.id === selectedCategory
      );
      const subField = category?.subFields.find(
        (sub) => sub.id === selectedSubField
      );

      const response = await geminiService.suggestResearchTopics(
        subField?.name || "",
        selectedLevel
      );
      setSuggestedTopics(response);
      setShowTopicDialog(true);
    } catch (err) {
      setError("حدث خطأ في اقتراح المواضيع. يرجى المحاولة مرة أخرى.");
      console.error("Error suggesting topics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = async (topic: ResearchTopic) => {
    const message = `أريد العمل على موضوع: ${topic.title}\n\nالوصف: ${topic.description}\n\nالمجال: ${topic.category}\n\nيرجى مساعدتي في تطوير هذا الموضوع وتقديم خطة بحث مفصلة.`;
    setInputMessage(message);
    setShowTopicDialog(false);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setSnackbar({
      open: true,
      message: "تم نسخ النص إلى الحافظة",
      severity: "success",
    });
  };

  const quickQuestions = [
    "كيف أطور فكرة مشروعي؟",
    "ما هي أفضل المنهجيات البحثية؟",
    "كيف أجد المراجع المناسبة؟",
    "ما هي خطوات كتابة المقترح البحثي؟",
    "كيف أختار موضوع البحث المناسب؟",
    "ما هي طرق جمع البيانات في البحث؟",
    "كيف أكتب المراجعة الأدبية؟",
    "ما هي معايير تقييم جودة البحث؟",
  ];

  const levels = [
    { value: "beginner", label: "مبتدئ" },
    { value: "intermediate", label: "متوسط" },
    { value: "advanced", label: "متقدم" },
  ];

  // الحصول على المجالات الفرعية للمجال المختار
  const selectedCategoryData = fieldCategories.find(
    (cat) => cat.id === selectedCategory
  );
  const availableSubFields = selectedCategoryData?.subFields || [];

  return (
    <Box
      sx={{ p: 3, height: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <SmartToy color="primary" />
          المساعد الأكاديمي
        </Typography>
        <Typography variant="body1" color="text.secondary">
          مساعدك الأكاديمي الشخصي لمساعدتك في البحوث والمشاريع
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Lightbulb color="primary" />
          اقتراح مواضيع بحثية
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>المجال الرئيسي</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubField(""); // إعادة تعيين المجال الفرعي
                }}
                label="المجال الرئيسي"
              >
                {fieldCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {category.icon}
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>المجال الفرعي</InputLabel>
              <Select
                value={selectedSubField}
                onChange={(e) => setSelectedSubField(e.target.value)}
                label="المجال الفرعي"
                disabled={!selectedCategory}
              >
                {availableSubFields.map((subField) => (
                  <MenuItem key={subField.id} value={subField.id}>
                    <Box>
                      <Typography variant="body2">{subField.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subField.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>المستوى</InputLabel>
              <Select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                label="المستوى"
              >
                {levels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              onClick={handleSuggestTopics}
              disabled={isLoading || !selectedCategory || !selectedSubField}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Add />}
              fullWidth
            >
              اقتراح مواضيع
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Questions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Help color="primary" />
          أسئلة سريعة
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {quickQuestions.map((question, index) => (
            <Chip
              key={index}
              label={question}
              onClick={() => setInputMessage(question)}
              variant="outlined"
              clickable
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Paper>

      {/* Chat Area */}
      <Paper
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", mb: 2 }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Assignment color="primary" />
            المحادثة
          </Typography>
        </Box>

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2, maxHeight: "400px" }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: "70%",
                  backgroundColor:
                    message.role === "user" ? "primary.main" : "grey.100",
                  color: message.role === "user" ? "white" : "text.primary",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor:
                        message.role === "user" ? "white" : "primary.main",
                      color: message.role === "user" ? "primary.main" : "white",
                      width: 32,
                      height: 32,
                    }}
                  >
                    {message.role === "user" ? <Person /> : <SmartToy />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, mt: 1, display: "block" }}
                    >
                      {message.timestamp.toLocaleTimeString("ar-EG")}
                    </Typography>
                  </Box>
                  {message.role === "assistant" && (
                    <IconButton
                      size="small"
                      onClick={() => handleCopyMessage(message.content)}
                      sx={{ color: "inherit" }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
              <Paper sx={{ p: 2, backgroundColor: "grey.100" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">جاري الكتابة...</Typography>
                </Box>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="... اكتب سؤالك هنا"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                startIcon={<Send />}
                sx={{ minWidth: 100 }}
              >
                إرسال
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Topics Dialog */}
      <Dialog
        open={showTopicDialog}
        onClose={() => setShowTopicDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Lightbulb color="primary" />
            المواضيع المقترحة
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {suggestedTopics.map((topic, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {topic.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {topic.description}
                    </Typography>
                    <Chip label={topic.category} size="small" sx={{ mr: 1 }} />
                    <Chip
                      label={topic.difficulty}
                      size="small"
                      color="primary"
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleTopicSelect(topic)}
                      startIcon={<Add />}
                    >
                      اختيار هذا الموضوع
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTopicDialog(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvisorPage;
