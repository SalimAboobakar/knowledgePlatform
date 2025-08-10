// بيانات حقيقية للطلاب والمشرفين والمشاريع
export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "supervisor" | "admin";
  department: string;
  specialization: string;
  avatar: string;
  phone?: string;
  studentId?: string; // للطلاب
  supervisorId?: string; // للمشرفين
  bio?: string;
  projects?: Project[];
  // بيانات إضافية للتوافق مع النظام الجديد
  profile?: {
    firstName: string;
    lastName: string;
    university: string;
    department: string;
    specialization: string;
    phone?: string;
    avatar?: string;
  };
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  assignedTo: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "planning" | "active" | "review" | "completed";
  priority: "low" | "medium" | "high";
  progress: number; // 0-100
  studentId: string;
  supervisorId: string;
  students?: string[]; // قائمة معرفات الطلاب المشاركين في المشروع
  todoList: TodoItem[];
  tags: string[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// البيانات ستُحمل من Firebase
export const students: User[] = [];

// البيانات ستُحمل من Firebase
export const supervisors: User[] = [];

// البيانات ستُحمل من Firebase
export const admins: User[] = [];

// جميع المستخدمين
export const allUsers: User[] = [...students, ...supervisors, ...admins];

// العلامات العلمية المتنوعة
export const academicTags = [
  // تقنية المعلومات
  "برمجة",
  "قواعد البيانات",
  "الذكاء الاصطناعي",
  "أمن المعلومات",
  "تطوير الويب",
  "تطبيقات الجوال",
  "البيانات الضخمة",
  "الحوسبة السحابية",
  "إنترنت الأشياء",

  // الطب والعلوم الصحية
  "طب عام",
  "طب أسنان",
  "صيدلة",
  "تمريض",
  "علاج طبيعي",
  "صحة عامة",
  "طب الأطفال",
  "طب النساء",
  "طب القلب",
  "طب الأعصاب",

  // العلوم الطبيعية
  "كيمياء",
  "فيزياء",
  "رياضيات",
  "أحياء",
  "جيولوجيا",
  "فلك",
  "كيمياء حيوية",
  "فيزياء طبية",
  "إحصاء",
  "بيولوجيا جزيئية",

  // الهندسة
  "هندسة مدنية",
  "هندسة ميكانيكية",
  "هندسة كهربائية",
  "هندسة كيميائية",
  "هندسة صناعية",
  "هندسة معمارية",
  "هندسة بيئية",
  "هندسة نووية",

  // العلوم الإنسانية
  "لغة عربية",
  "لغة إنجليزية",
  "تاريخ",
  "جغرافيا",
  "فلسفة",
  "علم نفس",
  "علم اجتماع",
  "علوم سياسية",
  "اقتصاد",
  "إدارة أعمال",

  // التربية والتعليم
  "تربية خاصة",
  "مناهج وطرق تدريس",
  "إدارة تربوية",
  "تقنيات التعليم",
  "علم النفس التربوي",
  "التربية الإسلامية",

  // الزراعة والبيئة
  "علوم زراعية",
  "هندسة زراعية",
  "علوم بيئية",
  "إدارة موارد طبيعية",
  "تكنولوجيا الأغذية",
  "علوم التربة",

  // القانون
  "قانون مدني",
  "قانون جنائي",
  "قانون تجاري",
  "قانون دستوري",
  "قانون دولي",
  "قانون إداري",
];

// أنواع المشاريع الأكاديمية
export const projectTypes = [
  "مشروع تخرج",
  "بحث علمي",
  "دراسة حالة",
  "تطبيق عملي",
  "رسالة ماجستير",
  "أطروحة دكتوراه",
  "مشروع تطويري",
  "دراسة مسحية",
  "تجربة مخبرية",
  "تحليل إحصائي",
];

// إنشاء بيانات مشاريع حقيقية مع To-Do List
export const projects: Project[] = [
  {
    id: "project-1",
    title: "تطوير نظام إدارة المستشفيات الذكي",
    description:
      "تطوير نظام متكامل لإدارة المستشفيات باستخدام تقنيات الذكاء الاصطناعي لتحسين كفاءة الخدمات الطبية وتقليل الأخطاء البشرية.",
    type: "مشروع تخرج",
    status: "active",
    priority: "high",
    progress: 65,
    studentId: "student-1",
    supervisorId: "supervisor-1",
    todoList: [
      {
        id: "todo-1-1",
        title: "تحليل متطلبات النظام",
        description: "دراسة احتياجات المستشفى وتحديد المتطلبات الوظيفية",
        completed: true,
        dueDate: "2024-01-15",
        assignedTo: "student-1",
        priority: "high",
        createdAt: "2024-01-01",
        completedAt: "2024-01-10",
      },
      {
        id: "todo-1-2",
        title: "تصميم قاعدة البيانات",
        description: "تصميم هيكل قاعدة البيانات وعلاقات الجداول",
        completed: true,
        dueDate: "2024-01-30",
        assignedTo: "student-1",
        priority: "high",
        createdAt: "2024-01-01",
        completedAt: "2024-01-25",
      },
      {
        id: "todo-1-3",
        title: "تطوير واجهة المستخدم",
        description: "تصميم وتطوير واجهات المستخدم للنظام",
        completed: true,
        dueDate: "2024-02-15",
        assignedTo: "student-1",
        priority: "medium",
        createdAt: "2024-01-01",
        completedAt: "2024-02-10",
      },
      {
        id: "todo-1-4",
        title: "تطوير خوارزميات الذكاء الاصطناعي",
        description: "تطوير خوارزميات للتنبؤ بالأمراض وتحسين الجدولة",
        completed: false,
        dueDate: "2024-03-01",
        assignedTo: "student-1",
        priority: "high",
        createdAt: "2024-01-01",
      },
      {
        id: "todo-1-5",
        title: "اختبار النظام",
        description: "إجراء اختبارات شاملة للنظام وتصحيح الأخطاء",
        completed: false,
        dueDate: "2024-03-15",
        assignedTo: "student-1",
        priority: "medium",
        createdAt: "2024-01-01",
      },
      {
        id: "todo-1-6",
        title: "كتابة التقرير النهائي",
        description: "إعداد التقرير النهائي للمشروع",
        completed: false,
        dueDate: "2024-04-01",
        assignedTo: "student-1",
        priority: "low",
        createdAt: "2024-01-01",
      },
    ],
    tags: ["برمجة", "قواعد البيانات", "الذكاء الاصطناعي", "طب عام"],
    dueDate: "2024-04-15",
    createdAt: "2024-01-01",
    updatedAt: "2024-02-15",
  },
  {
    id: "project-2",
    title: "دراسة تأثير التغذية على نمو الأطفال",
    description:
      "بحث علمي لدراسة العلاقة بين التغذية ونمو الأطفال في المراحل العمرية المختلفة.",
    type: "بحث علمي",
    status: "active",
    priority: "medium",
    progress: 40,
    studentId: "student-2",
    supervisorId: "supervisor-2",
    todoList: [
      {
        id: "todo-2-1",
        title: "مراجعة الأدبيات العلمية",
        description:
          "جمع ومراجعة الدراسات السابقة في مجال التغذية ونمو الأطفال",
        completed: true,
        dueDate: "2024-01-20",
        assignedTo: "student-2",
        priority: "high",
        createdAt: "2024-01-05",
        completedAt: "2024-01-18",
      },
      {
        id: "todo-2-2",
        title: "تصميم الدراسة",
        description: "تحديد منهجية البحث وعينة الدراسة",
        completed: true,
        dueDate: "2024-02-01",
        assignedTo: "student-2",
        priority: "high",
        createdAt: "2024-01-05",
        completedAt: "2024-01-28",
      },
      {
        id: "todo-2-3",
        title: "جمع البيانات",
        description: "إجراء المقابلات وجمع البيانات من العينة",
        completed: false,
        dueDate: "2024-03-01",
        assignedTo: "student-2",
        priority: "high",
        createdAt: "2024-01-05",
      },
      {
        id: "todo-2-4",
        title: "تحليل البيانات",
        description: "تحليل البيانات إحصائياً واستخراج النتائج",
        completed: false,
        dueDate: "2024-03-15",
        assignedTo: "student-2",
        priority: "medium",
        createdAt: "2024-01-05",
      },
      {
        id: "todo-2-5",
        title: "كتابة البحث",
        description: "كتابة البحث العلمي مع النتائج والتوصيات",
        completed: false,
        dueDate: "2024-04-01",
        assignedTo: "student-2",
        priority: "medium",
        createdAt: "2024-01-05",
      },
    ],
    tags: ["طب عام", "طب الأطفال", "صحة عامة", "إحصاء"],
    dueDate: "2024-04-15",
    createdAt: "2024-01-05",
    updatedAt: "2024-02-01",
  },
  {
    id: "project-3",
    title: "تطوير مواد نانوية لتنقية المياه",
    description:
      "تصميم وتطوير مواد نانوية جديدة لتنقية المياه من الملوثات العضوية والمعادن الثقيلة.",
    type: "بحث علمي",
    status: "active",
    priority: "high",
    progress: 75,
    studentId: "student-3",
    supervisorId: "supervisor-3",
    todoList: [
      {
        id: "todo-3-1",
        title: "تحضير المواد النانوية",
        description: "تحضير المواد النانوية باستخدام طرق كيميائية مختلفة",
        completed: true,
        dueDate: "2024-01-10",
        assignedTo: "student-3",
        priority: "high",
        createdAt: "2024-01-02",
        completedAt: "2024-01-08",
      },
      {
        id: "todo-3-2",
        title: "توصيف المواد",
        description: "توصيف المواد النانوية باستخدام أجهزة التحليل المختلفة",
        completed: true,
        dueDate: "2024-01-25",
        assignedTo: "student-3",
        priority: "high",
        createdAt: "2024-01-02",
        completedAt: "2024-01-22",
      },
      {
        id: "todo-3-3",
        title: "اختبار كفاءة التنقية",
        description: "اختبار قدرة المواد على تنقية المياه من الملوثات",
        completed: true,
        dueDate: "2024-02-10",
        assignedTo: "student-3",
        priority: "high",
        createdAt: "2024-01-02",
        completedAt: "2024-02-05",
      },
      {
        id: "todo-3-4",
        title: "تحسين الأداء",
        description: "تحسين كفاءة المواد ودراسة العوامل المؤثرة",
        completed: false,
        dueDate: "2024-02-25",
        assignedTo: "student-3",
        priority: "medium",
        createdAt: "2024-01-02",
      },
      {
        id: "todo-3-5",
        title: "كتابة البحث",
        description: "كتابة البحث العلمي مع النتائج والتطبيقات",
        completed: false,
        dueDate: "2024-03-15",
        assignedTo: "student-3",
        priority: "medium",
        createdAt: "2024-01-02",
      },
    ],
    tags: ["كيمياء", "كيمياء حيوية", "علوم بيئية", "هندسة كيميائية"],
    dueDate: "2024-03-30",
    createdAt: "2024-01-02",
    updatedAt: "2024-02-10",
  },
  {
    id: "project-4",
    title: "تحليل النصوص الأدبية باستخدام الذكاء الاصطناعي",
    description:
      "تطوير نظام لتحليل النصوص الأدبية العربية باستخدام تقنيات معالجة اللغة الطبيعية.",
    type: "مشروع تخرج",
    status: "planning",
    priority: "medium",
    progress: 20,
    studentId: "student-4",
    supervisorId: "supervisor-4",
    todoList: [
      {
        id: "todo-4-1",
        title: "جمع النصوص الأدبية",
        description: "جمع مجموعة متنوعة من النصوص الأدبية العربية للتحليل",
        completed: true,
        dueDate: "2024-01-15",
        assignedTo: "student-4",
        priority: "high",
        createdAt: "2024-01-10",
        completedAt: "2024-01-12",
      },
      {
        id: "todo-4-2",
        title: "معالجة النصوص",
        description: "تنظيف ومعالجة النصوص للتحليل",
        completed: false,
        dueDate: "2024-02-01",
        assignedTo: "student-4",
        priority: "high",
        createdAt: "2024-01-10",
      },
      {
        id: "todo-4-3",
        title: "تطوير خوارزميات التحليل",
        description: "تطوير خوارزميات لتحليل النصوص الأدبية",
        completed: false,
        dueDate: "2024-02-15",
        assignedTo: "student-4",
        priority: "high",
        createdAt: "2024-01-10",
      },
      {
        id: "todo-4-4",
        title: "اختبار النظام",
        description: "اختبار النظام على النصوص المجمعة",
        completed: false,
        dueDate: "2024-03-01",
        assignedTo: "student-4",
        priority: "medium",
        createdAt: "2024-01-10",
      },
      {
        id: "todo-4-5",
        title: "كتابة التقرير",
        description: "كتابة التقرير النهائي للمشروع",
        completed: false,
        dueDate: "2024-03-15",
        assignedTo: "student-4",
        priority: "low",
        createdAt: "2024-01-10",
      },
    ],
    tags: ["لغة عربية", "الذكاء الاصطناعي", "معالجة اللغة الطبيعية", "برمجة"],
    dueDate: "2024-03-30",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    id: "project-5",
    title: "دراسة استراتيجيات التسويق الرقمي للشركات الناشئة",
    description:
      "تحليل استراتيجيات التسويق الرقمي الفعالة للشركات الناشئة في السوق المحلي.",
    type: "دراسة حالة",
    status: "review",
    priority: "low",
    progress: 90,
    studentId: "student-5",
    supervisorId: "supervisor-5",
    todoList: [
      {
        id: "todo-5-1",
        title: "جمع بيانات الشركات الناشئة",
        description: "جمع معلومات عن الشركات الناشئة واستراتيجياتها التسويقية",
        completed: true,
        dueDate: "2024-01-20",
        assignedTo: "student-5",
        priority: "high",
        createdAt: "2024-01-15",
        completedAt: "2024-01-18",
      },
      {
        id: "todo-5-2",
        title: "تحليل البيانات",
        description: "تحليل البيانات المجمعة واستخراج الأنماط",
        completed: true,
        dueDate: "2024-02-05",
        assignedTo: "student-5",
        priority: "high",
        createdAt: "2024-01-15",
        completedAt: "2024-02-01",
      },
      {
        id: "todo-5-3",
        title: "مقابلات مع رواد الأعمال",
        description: "إجراء مقابلات مع رواد الأعمال لمعرفة استراتيجياتهم",
        completed: true,
        dueDate: "2024-02-20",
        assignedTo: "student-5",
        priority: "medium",
        createdAt: "2024-01-15",
        completedAt: "2024-02-15",
      },
      {
        id: "todo-5-4",
        title: "كتابة الدراسة",
        description: "كتابة الدراسة مع النتائج والتوصيات",
        completed: true,
        dueDate: "2024-03-01",
        assignedTo: "student-5",
        priority: "medium",
        createdAt: "2024-01-15",
        completedAt: "2024-02-25",
      },
      {
        id: "todo-5-5",
        title: "مراجعة نهائية",
        description: "المراجعة النهائية للدراسة قبل التسليم",
        completed: false,
        dueDate: "2024-03-10",
        assignedTo: "student-5",
        priority: "low",
        createdAt: "2024-01-15",
      },
    ],
    tags: ["إدارة أعمال", "تسويق", "اقتصاد", "إدارة مالية"],
    dueDate: "2024-03-15",
    createdAt: "2024-01-15",
    updatedAt: "2024-02-25",
  },
];

// دالة لحساب نسبة الإنجاز بناءً على المهام المكتملة
export const calculateProgress = (todoList: TodoItem[]): number => {
  if (todoList.length === 0) return 0;
  const completedTasks = todoList.filter((todo) => todo.completed).length;
  return Math.round((completedTasks / todoList.length) * 100);
};

// دالة لتحديث حالة المهمة وحساب التقدم
export const updateTodoStatus = (
  projectId: string,
  todoId: string,
  completed: boolean
): Project[] => {
  return projects.map((project) => {
    if (project.id === projectId) {
      const updatedTodoList = project.todoList.map((todo) => {
        if (todo.id === todoId) {
          return {
            ...todo,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return todo;
      });

      return {
        ...project,
        todoList: updatedTodoList,
        progress: calculateProgress(updatedTodoList),
        updatedAt: new Date().toISOString(),
      };
    }
    return project;
  });
};

// دالة لإضافة مهمة جديدة
export const addTodoItem = (
  projectId: string,
  todo: Omit<TodoItem, "id" | "createdAt">
): Project[] => {
  return projects.map((project) => {
    if (project.id === projectId) {
      const newTodo: TodoItem = {
        ...todo,
        id: `todo-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const updatedTodoList = [...project.todoList, newTodo];

      return {
        ...project,
        todoList: updatedTodoList,
        progress: calculateProgress(updatedTodoList),
        updatedAt: new Date().toISOString(),
      };
    }
    return project;
  });
};

// دالة لحذف مهمة
export const deleteTodoItem = (
  projectId: string,
  todoId: string
): Project[] => {
  return projects.map((project) => {
    if (project.id === projectId) {
      const updatedTodoList = project.todoList.filter(
        (todo) => todo.id !== todoId
      );

      return {
        ...project,
        todoList: updatedTodoList,
        progress: calculateProgress(updatedTodoList),
        updatedAt: new Date().toISOString(),
      };
    }
    return project;
  });
};

// دالة لتصفية المشاريع حسب دور المستخدم
export const filterProjectsByUserRole = (
  projects: Project[],
  user: User | null
): Project[] => {
  if (!user) return [];

  switch (user.role) {
    case "student":
      return projects.filter((project) => project.studentId === user.id);
    case "supervisor":
      return projects.filter((project) => project.supervisorId === user.id);
    case "admin":
      return projects; // الإداريون يرون جميع المشاريع
    default:
      return [];
  }
};

// دالة للتحقق من صلاحيات المستخدم
export const checkUserPermissions = (
  user: User | null,
  project: Project,
  action: "view" | "edit" | "delete" | "manage_todos"
): boolean => {
  if (!user) return false;

  switch (user.role) {
    case "admin":
      return true; // الإداريون لديهم جميع الصلاحيات
    case "supervisor":
      if (project.supervisorId === user.id) {
        return (
          action === "view" || action === "edit" || action === "manage_todos"
        );
      }
      return false;
    case "student":
      if (project.studentId === user.id) {
        return action === "view" || action === "manage_todos";
      }
      return false;
    default:
      return false;
  }
};
