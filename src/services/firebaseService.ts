import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import { Project, User, TodoItem } from "../data/mockData";

// أنواع البيانات المحسنة
export interface FirebaseProject extends Omit<Project, "id"> {
  id?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseUser extends Omit<User, "id"> {
  id?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirebaseTodoItem extends Omit<TodoItem, "id"> {
  id?: string;
  createdAt: any;
  completedAt?: any;
}

// أنواع البيانات للرسائل والمحادثات
export interface Message {
  id?: string;
  senderId: string;
  content: string;
  timestamp: any;
  type: "text" | "file" | "image";
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
}

export interface Conversation {
  id?: string;
  participants: string[]; // array of user IDs
  lastMessage?: Message;
  unreadCount?: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: any;
  updatedAt: any;
}

// خدمة إدارة المشاريع
export class ProjectService {
  private static collectionName = "projects";

  // جلب جميع المشاريع
  static async getAllProjects(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  // جلب مشاريع حسب دور المستخدم
  static async getProjectsByUserRole(user: User): Promise<Project[]> {
    try {
      // جلب المشاريع حسب دور المستخدم

      // Validate user object
      if (!user || !user.id || !user.role) {
        console.warn("⚠️ Invalid user object:", user);
        return [];
      }

      let q;

      switch (user.role) {
        case "student":
          console.log("👨‍🎓 Fetching projects for student with ID:", user.id);
          q = query(
            collection(db, this.collectionName),
            where("studentId", "==", user.id)
          );
          break;
        case "supervisor":
          // المشرف - جلب المشاريع التي يشرف عليها
          q = query(
            collection(db, this.collectionName),
            where("supervisorId", "==", user.id)
          );
          break;
        case "admin":
          console.log("👨‍💼 Fetching all projects for admin");
          q = query(collection(db, this.collectionName));
          break;
        default:
          console.warn("⚠️ Unknown user role:", user.role);
          return [];
      }

      const querySnapshot = await getDocs(q);
      // معالجة نتائج المشاريع

      const projects = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      // ترتيب النتائج محلياً بدلاً من استخدام orderBy في Firestore
      return projects.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0);
        const dateB = new Date(b.updatedAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error: any) {
      console.error("Error fetching projects by user role:", error);
      console.error("Error details:", {
        user: user,
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }

  // جلب مشروع واحد
  static async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const docRef = doc(db, this.collectionName, projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Project;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching project:", error);
      throw error;
    }
  }

  // إنشاء مشروع جديد
  static async createProject(
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const projectRef = await addDoc(collection(db, this.collectionName), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return projectRef.id;
    } catch (error: any) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  // تحديث مشروع
  static async updateProject(
    projectId: string,
    projectData: Partial<Project>
  ): Promise<void> {
    try {
      const projectRef = doc(db, this.collectionName, projectId);
      await updateDoc(projectRef, {
        ...projectData,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  // حذف مشروع
  static async deleteProject(projectId: string): Promise<void> {
    try {
      const projectRef = doc(db, this.collectionName, projectId);
      await deleteDoc(projectRef);
    } catch (error: any) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  // إضافة طالب إلى مشروع
  static async addStudentToProject(
    projectId: string,
    studentId: string
  ): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error("المشروع غير موجود");
      }

      // إضافة الطالب إلى قائمة الطلاب إذا لم يكن موجوداً
      const students = project.students || [];
      if (!students.includes(studentId)) {
        students.push(studentId);
        await this.updateProject(projectId, { students });
      }
    } catch (error: any) {
      console.error("Error adding student to project:", error);
      throw error;
    }
  }

  // إضافة مهمة جديدة إلى مشروع
  static async addTask(projectId: string, task: any): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error("المشروع غير موجود");
      }

      const todoList = project.todoList || [];
      todoList.push(task);

      await this.updateProject(projectId, {
        todoList,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error adding task:", error);
      throw error;
    }
  }

  // تحديث مهمة موجودة
  static async updateTask(projectId: string, updatedTask: any): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error("المشروع غير موجود");
      }

      const todoList = project.todoList || [];
      const taskIndex = todoList.findIndex(
        (task) => task.id === updatedTask.id
      );

      if (taskIndex !== -1) {
        todoList[taskIndex] = updatedTask;
        await this.updateProject(projectId, {
          todoList,
          updatedAt: new Date().toISOString(),
        });
      } else {
        throw new Error("المهمة غير موجودة");
      }
    } catch (error: any) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  // حذف مهمة من مشروع
  static async deleteTask(projectId: string, taskId: string): Promise<void> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error("المشروع غير موجود");
      }

      const todoList =
        project.todoList?.filter((task) => task.id !== taskId) || [];
      await this.updateProject(projectId, {
        todoList,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  // تحديث حالة مهمة
  static async updateTodoStatus(
    projectId: string,
    todoId: string,
    completed: boolean
  ): Promise<void> {
    try {
      const projectRef = doc(db, this.collectionName, projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const project = projectSnap.data() as Project;
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

        // حساب التقدم الجديد
        const progress = this.calculateProgress(updatedTodoList);

        await updateDoc(projectRef, {
          todoList: updatedTodoList,
          progress,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error: any) {
      console.error("Error updating todo status:", error);
      throw error;
    }
  }

  // إضافة مهمة جديدة
  static async addTodoItem(
    projectId: string,
    todoData: Omit<TodoItem, "id" | "createdAt">
  ): Promise<void> {
    try {
      const projectRef = doc(db, this.collectionName, projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const project = projectSnap.data() as Project;
        const newTodo: TodoItem = {
          ...todoData,
          id: `todo-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        const updatedTodoList = [...project.todoList, newTodo];
        const progress = this.calculateProgress(updatedTodoList);

        await updateDoc(projectRef, {
          todoList: updatedTodoList,
          progress,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error: any) {
      console.error("Error adding todo item:", error);
      throw error;
    }
  }

  // حذف مهمة
  static async deleteTodoItem(
    projectId: string,
    todoId: string
  ): Promise<void> {
    try {
      const projectRef = doc(db, this.collectionName, projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const project = projectSnap.data() as Project;
        const updatedTodoList = project.todoList.filter(
          (todo) => todo.id !== todoId
        );
        const progress = this.calculateProgress(updatedTodoList);

        await updateDoc(projectRef, {
          todoList: updatedTodoList,
          progress,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error: any) {
      console.error("Error deleting todo item:", error);
      throw error;
    }
  }

  // حساب نسبة التقدم
  private static calculateProgress(todoList: TodoItem[]): number {
    if (todoList.length === 0) return 0;
    const completedTasks = todoList.filter((todo) => todo.completed).length;
    return Math.round((completedTasks / todoList.length) * 100);
  }

  // الاستماع للتغييرات في المشاريع
  static subscribeToProjects(
    user: User,
    callback: (projects: Project[]) => void
  ) {
    try {
      console.log("🔍 Setting up project subscription for user:", {
        id: user.id,
        role: user.role,
        email: user.email,
      });

      // Validate user object
      if (!user || !user.id || !user.role) {
        console.warn("⚠️ Invalid user object for subscription:", user);
        callback([]);
        return () => {};
      }

      let q;

      switch (user.role) {
        case "student":
          console.log(
            "👨‍🎓 Subscribing to projects for student with ID:",
            user.id
          );
          q = query(
            collection(db, this.collectionName),
            where("studentId", "==", user.id)
          );
          break;
        case "supervisor":
          console.log(
            "👨‍🏫 Subscribing to projects for supervisor with ID:",
            user.id
          );
          q = query(
            collection(db, this.collectionName),
            where("supervisorId", "==", user.id)
          );
          break;
        case "admin":
          console.log("👨‍💼 Subscribing to all projects for admin");
          q = query(collection(db, this.collectionName));
          break;
        default:
          console.warn("⚠️ Unknown user role for subscription:", user.role);
          callback([]);
          return () => {};
      }

      return onSnapshot(
        q,
        (querySnapshot) => {
          console.log(
            `📋 Project subscription update: ${querySnapshot.docs.length} projects`
          );
          const projects = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Project[];

          // ترتيب النتائج محلياً
          const sortedProjects = projects.sort((a, b) => {
            const dateA = new Date(a.updatedAt || 0);
            const dateB = new Date(b.updatedAt || 0);
            return dateB.getTime() - dateA.getTime();
          });

          callback(sortedProjects);
        },
        (error) => {
          console.error("❌ Project subscription error:", error);
          console.error("❌ Error details:", {
            user: user,
            error: error.message,
            code: error.code,
            stack: error.stack,
          });
          // Return empty array on error
          callback([]);
        }
      );
    } catch (error) {
      console.error("❌ Error setting up project subscription:", error);
      callback([]);
      return () => {};
    }
  }
}

// خدمة إدارة المستخدمين
export class UserService {
  private static collectionName = "users";

  // Utility function to ensure user document exists
  static async ensureUserDocument(firebaseUser: any): Promise<User | null> {
    try {
      console.log(
        "🔍 Ensuring user document for:",
        firebaseUser.email,
        "UID:",
        firebaseUser.uid
      );

      // First try to get the user by Firebase UID (this should be the document ID)
      let user = await this.getUserById(firebaseUser.uid);

      if (!user) {
        // If not found by UID, try by email
        user = await this.getUserByEmail(firebaseUser.email || "");
      }

      if (!user) {
        // If user doesn't exist, create a basic user document
        console.log("📝 Creating user document for:", firebaseUser.email);
        const userData: Omit<User, "id" | "createdAt" | "updatedAt"> = {
          name: firebaseUser.displayName || "مستخدم جديد",
          email: firebaseUser.email || "",
          role: "student" as const,
          department: "غير محدد",
          specialization: "غير محدد",
          avatar: firebaseUser.displayName?.charAt(0) || "م",
          phone: "",
          studentId: "",
        };

        // Create the document with the Firebase UID as the document ID
        const userRef = doc(db, this.collectionName, firebaseUser.uid);
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log("✅ User document created with UID:", firebaseUser.uid);
        user = await this.getUserById(firebaseUser.uid);
      } else {
        console.log("✅ User document found:", user.id);
      }

      return user;
    } catch (error) {
      console.error("❌ Error ensuring user document:", error);
      return null;
    }
  }

  // دالة جديدة لإنشاء مستخدم مع البيانات المخصصة من التسجيل
  static async createUserWithCustomData(
    firebaseUser: any,
    customUserData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User | null> {
    try {
      console.log(
        "🔍 Creating user with custom data for:",
        firebaseUser.email,
        "UID:",
        firebaseUser.uid
      );

      console.log("📝 Custom user data:", customUserData);

      // Create the document with the Firebase UID as the document ID
      const userRef = doc(db, this.collectionName, firebaseUser.uid);

      const finalUserData = {
        ...customUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("📄 Final user data to write:", finalUserData);

      await setDoc(userRef, finalUserData);

      console.log(
        "✅ User document created with custom data, UID:",
        firebaseUser.uid
      );
      const user = await this.getUserById(firebaseUser.uid);
      return user;
    } catch (error: any) {
      console.error("❌ Error creating user with custom data:", error);
      console.error("❌ Error details:", {
        firebaseUser: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        },
        customUserData,
        error: error.message,
        code: error.code,
      });
      return null;
    }
  }

  // جلب جميع المستخدمين
  static async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (error: any) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // جلب مستخدم بواسطة المعرف
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.collectionName, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as User;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  // جلب مستخدم بواسطة البريد الإلكتروني
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (!email) {
        console.warn("getUserByEmail called with empty email");
        return null;
      }

      const q = query(
        collection(db, this.collectionName),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as User;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching user by email:", error);
      // Don't throw the error, just return null to avoid breaking the auth flow
      return null;
    }
  }

  // إنشاء مستخدم جديد
  static async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const userRef = await addDoc(collection(db, this.collectionName), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return userRef.id;
    } catch (error: any) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // تحديث مستخدم
  static async updateUser(
    userId: string,
    userData: Partial<User>
  ): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // حذف مستخدم
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await deleteDoc(userRef);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // جلب المستخدمين حسب الدور
  static async getUsersByRole(
    role: "student" | "supervisor" | "admin"
  ): Promise<User[]> {
    try {
      console.log(`🔍 Fetching users with role: ${role}`);
      
      // استخدام استعلام بسيط بدون orderBy
      const q = query(
        collection(db, this.collectionName),
        where("role", "==", role)
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      console.log(`📊 Raw users with role ${role}:`, users.length, users.map(u => ({ id: u.id, name: u.name, role: u.role })));

      // إزالة التكرار حسب ID وترتيب النتائج محلياً
      const uniqueUsers = users.filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );
      
      const sortedUsers = uniqueUsers.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      
      console.log(`✅ Final users with role ${role}:`, sortedUsers.length, sortedUsers.map(u => u.name));
      return sortedUsers;
    } catch (error: any) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  }

  // جلب الطلاب حسب التخصص
  static async getStudentsBySpecialization(
    specialization: string
  ): Promise<User[]> {
    try {
      console.log(
        "🔍 Searching for students with specialization:",
        specialization
      );

      // أولاً نجلب جميع الطلاب ثم نفلتر محلياً للتأكد من عدم وجود مشاكل في Firebase
      const q = query(
        collection(db, this.collectionName),
        where("role", "==", "student"),
        orderBy("name", "asc")
      );
      const querySnapshot = await getDocs(q);
      const allStudents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      console.log("📊 All students from Firebase:", allStudents);
      console.log(
        "📋 Available specializations:",
        Array.from(new Set(allStudents.map((s) => s.specialization)))
      );

      // فلترة محلية حسب التخصص
      const filteredStudents = allStudents.filter((student) => {
        const matches = student.specialization === specialization;
        console.log(
          `🎯 Student: ${student.name}, Specialization: "${student.specialization}", Matches: ${matches}`
        );
        return matches;
      });

      console.log("✅ Filtered students by specialization:", filteredStudents);
      console.log(
        `📈 Found ${filteredStudents.length} students for specialization: "${specialization}"`
      );

      return filteredStudents;
    } catch (error) {
      console.error("❌ Error fetching students by specialization:", error);
      return [];
    }
  }

  // جلب المشرفين حسب التخصص
  static async getSupervisorsBySpecialization(
    specialization: string
  ): Promise<User[]> {
    try {
      // استخدام استعلام بسيط بدون orderBy
      const q = query(
        collection(db, this.collectionName),
        where("role", "==", "supervisor"),
        where("specialization", "==", specialization)
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      // إزالة التكرار حسب ID وترتيب النتائج محلياً
      const uniqueUsers = users.filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );
      return uniqueUsers.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    } catch (error: any) {
      console.error("Error fetching supervisors by specialization:", error);
      throw error;
    }
  }

  // البحث في المستخدمين بالاسم أو التخصص
  static async searchUsers(
    searchTerm: string,
    role?: "student" | "supervisor" | "admin"
  ): Promise<User[]> {
    try {
      let q;

      if (role) {
        // استخدام استعلام بسيط بدون orderBy
        q = query(
          collection(db, this.collectionName),
          where("role", "==", role)
        );
      } else {
        q = query(collection(db, this.collectionName));
      }

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      // تصفية النتائج حسب مصطلح البحث
      const searchLower = searchTerm.toLowerCase();
      const filteredUsers = users.filter(
        (user) =>
          (user.name || "").toLowerCase().includes(searchLower) ||
          (user.specialization || "").toLowerCase().includes(searchLower) ||
          (user.department || "").toLowerCase().includes(searchLower) ||
          (user.studentId || "").toLowerCase().includes(searchLower) ||
          (user.supervisorId || "").toLowerCase().includes(searchLower)
      );

      // ترتيب النتائج محلياً
      return filteredUsers.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    } catch (error: any) {
      console.error("Error searching users:", error);
      throw error;
    }
  }
}

// خدمة رفع الملفات
export class FileService {
  // رفع ملف إلى Firebase Storage
  static async uploadFile(
    file: File,
    folder: string = "uploads"
  ): Promise<string> {
    try {
      // إنشاء اسم فريد للملف
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;

      // إنشاء مرجع للملف في Storage
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // رفع الملف
      const snapshot = await uploadBytes(storageRef, file);

      // الحصول على رابط التحميل
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("فشل في رفع الملف");
    }
  }

  // حذف ملف من Firebase Storage
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error("فشل في حذف الملف");
    }
  }

  // التحقق من نوع الملف المسموح
  static isAllowedFileType(file: File): boolean {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    return allowedTypes.includes(file.type);
  }

  // التحقق من حجم الملف
  static isFileSizeValid(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}

// خدمة إدارة المحادثات والرسائل
export class ChatService {
  private static conversationsCollection = "conversations";
  private static messagesCollection = "messages";

  // إنشاء محادثة جديدة
  static async createConversation(
    participants: string[],
    isGroup: boolean = false,
    groupName?: string,
    groupAvatar?: string
  ): Promise<string> {
    try {
      console.log("🔍 Creating conversation with:", {
        participants,
        isGroup,
        groupName,
        groupAvatar,
      });

      const conversationData: any = {
        participants,
        isGroup,
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // إضافة groupName فقط إذا كان موجوداً وليس undefined
      if (isGroup && groupName && groupName.trim() !== "") {
        conversationData.groupName = groupName;
        console.log("✅ Added groupName:", groupName);
      } else if (isGroup) {
        console.log("⚠️ Group chat but no valid groupName provided");
      }

      // إضافة groupAvatar فقط إذا كان موجوداً وليس undefined
      if (isGroup && groupAvatar && groupAvatar.trim() !== "") {
        conversationData.groupAvatar = groupAvatar;
        console.log("✅ Added groupAvatar:", groupAvatar);
      } else if (isGroup) {
        console.log("⚠️ Group chat but no valid groupAvatar provided");
      }

      console.log("📝 Final conversation data:", conversationData);

      // التحقق من عدم وجود قيم undefined في البيانات
      const cleanData = Object.fromEntries(
        Object.entries(conversationData).filter(
          ([key, value]) => value !== undefined
        )
      );

      console.log("🧹 Cleaned conversation data:", cleanData);

      const docRef = await addDoc(
        collection(db, this.conversationsCollection),
        cleanData
      );

      console.log("✅ Conversation created with ID:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("❌ Error creating conversation:", error);
      console.error("❌ Error details:", {
        participants,
        isGroup,
        groupName,
        groupAvatar,
        error: error.message,
      });
      throw error;
    }
  }

  // جلب محادثات المستخدم
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where("participants", "array-contains", userId)
        // إزالة orderBy لتجنب الحاجة لـ composite index
      );

      const querySnapshot = await getDocs(q);
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];

      // ترتيب محلي بدلاً من Firestore orderBy
      return conversations.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime(); // ترتيب تنازلي
      });
    } catch (error: any) {
      console.error("Error getting user conversations:", error);
      throw error;
    }
  }

  // الاستماع لتغييرات محادثات المستخدم
  static subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ) {
    const q = query(
      collection(db, this.conversationsCollection),
      where("participants", "array-contains", userId)
      // إزالة orderBy لتجنب الحاجة لـ composite index
    );

    return onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];

      // ترتيب محلي بدلاً من Firestore orderBy
      const sortedConversations = conversations.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime(); // ترتيب تنازلي
      });

      callback(sortedConversations);
    });
  }

  // جلب رسائل محادثة معينة
  static async getConversationMessages(
    conversationId: string
  ): Promise<Message[]> {
    try {
      const q = query(
        collection(
          db,
          this.conversationsCollection,
          conversationId,
          this.messagesCollection
        )
        // إزالة orderBy لتجنب الحاجة لـ composite index
      );

      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      // ترتيب محلي بدلاً من Firestore orderBy
      return messages.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return aTime.getTime() - bTime.getTime(); // ترتيب تصاعدي للرسائل
      });
    } catch (error: any) {
      console.error("Error getting conversation messages:", error);
      throw error;
    }
  }

  // الاستماع لتغييرات رسائل محادثة معينة
  static subscribeToConversationMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ) {
    const q = query(
      collection(
        db,
        this.conversationsCollection,
        conversationId,
        this.messagesCollection
      )
      // إزالة orderBy لتجنب الحاجة لـ composite index
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      // ترتيب محلي بدلاً من Firestore orderBy
      const sortedMessages = messages.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return aTime.getTime() - bTime.getTime(); // ترتيب تصاعدي للرسائل
      });

      callback(sortedMessages);
    });
  }

  // إرسال رسالة جديدة
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: "text" | "file" | "image" = "text",
    fileUrl?: string,
    fileName?: string
  ): Promise<string> {
    try {
      const messageData: Omit<Message, "id"> = {
        senderId,
        content,
        timestamp: serverTimestamp(),
        type,
        isRead: false,
      };

      // إضافة fileUrl فقط إذا كان موجوداً
      if (fileUrl && fileUrl.trim() !== "") {
        messageData.fileUrl = fileUrl;
      }

      // إضافة fileName فقط إذا كان موجوداً
      if (fileName && fileName.trim() !== "") {
        messageData.fileName = fileName;
      }

      // إضافة الرسالة إلى المحادثة
      const messageRef = await addDoc(
        collection(
          db,
          this.conversationsCollection,
          conversationId,
          this.messagesCollection
        ),
        messageData
      );

      // تحديث آخر رسالة في المحادثة
      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      await updateDoc(conversationRef, {
        lastMessage: {
          ...messageData,
          id: messageRef.id,
        },
        updatedAt: serverTimestamp(),
      });

      return messageRef.id;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // إرسال ملف
  static async sendFile(
    conversationId: string,
    senderId: string,
    file: File
  ): Promise<string> {
    try {
      // التحقق من نوع الملف
      if (!FileService.isAllowedFileType(file)) {
        throw new Error("نوع الملف غير مسموح به");
      }

      // التحقق من حجم الملف
      if (!FileService.isFileSizeValid(file, 10)) {
        throw new Error("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
      }

      // رفع الملف إلى Firebase Storage
      const fileUrl = await FileService.uploadFile(
        file,
        `conversations/${conversationId}/files`
      );

      const fileName = file.name;
      const fileSize = file.size;
      const content = `📎 ${fileName} (${this.formatFileSize(fileSize)})`;

      return await this.sendMessage(
        conversationId,
        senderId,
        content,
        "file",
        fileUrl, // رابط الملف الفعلي
        fileName
      );
    } catch (error: any) {
      console.error("Error sending file:", error);
      throw error;
    }
  }

  // تنسيق حجم الملف
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // حذف رسالة
  static async deleteMessage(
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    try {
      // التحقق من أن المستخدم هو مرسل الرسالة
      const messageRef = doc(
        db,
        this.conversationsCollection,
        conversationId,
        this.messagesCollection,
        messageId
      );

      const messageSnap = await getDoc(messageRef);
      if (!messageSnap.exists()) {
        throw new Error("Message not found");
      }

      const messageData = messageSnap.data() as Message;
      if (messageData.senderId !== userId) {
        throw new Error("You can only delete your own messages");
      }

      await deleteDoc(messageRef);

      // تحديث آخر رسالة في المحادثة إذا كانت الرسالة المحذوفة هي الأخيرة
      const messages = await this.getConversationMessages(conversationId);
      const lastMessage = messages[messages.length - 1];

      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      await updateDoc(conversationRef, {
        lastMessage: lastMessage || null,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  // تحديث حالة قراءة الرسائل
  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    try {
      const messagesRef = collection(
        db,
        this.conversationsCollection,
        conversationId,
        this.messagesCollection
      );

      // جلب جميع الرسائل وتصفيتها محلياً لتجنب الحاجة لـ composite index
      const q = query(messagesRef);
      const querySnapshot = await getDocs(q);

      // التحقق من وجود رسائل لتحديثها
      const messagesToUpdate = querySnapshot.docs.filter((doc) => {
        const messageData = doc.data() as Message;
        // تحديث الرسائل التي لم يرسلها المستخدم الحالي وغير مقروءة
        return messageData.senderId !== userId && !messageData.isRead;
      });

      // إذا لم تكن هناك رسائل لتحديثها، لا تفعل شيئاً
      if (messagesToUpdate.length === 0) {
        return;
      }

      const batch = writeBatch(db);

      messagesToUpdate.forEach((doc) => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();

      // تحديث عدد الرسائل غير المقروءة في المحادثة
      try {
        const conversationRef = doc(
          db,
          this.conversationsCollection,
          conversationId
        );
        await updateDoc(conversationRef, {
          unreadCount: 0,
        });
      } catch (conversationError) {
        // تجاهل خطأ تحديث المحادثة إذا لم يكن ضرورياً
        console.log(
          "Warning: Could not update conversation unread count:",
          conversationError
        );
      }
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      // لا نريد أن نوقف التطبيق بسبب هذا الخطأ
      // throw error;
    }
  }

  // البحث عن محادثة بين مستخدمين
  static async findConversationBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Conversation | null> {
    try {
      const q = query(
        collection(db, this.conversationsCollection),
        where("participants", "array-contains", userId1),
        where("isGroup", "==", false)
      );

      const querySnapshot = await getDocs(q);
      const conversation = querySnapshot.docs.find((doc) => {
        const data = doc.data() as Conversation;
        return data.participants.includes(userId2);
      });

      if (conversation) {
        return {
          id: conversation.id,
          ...conversation.data(),
        } as Conversation;
      }

      return null;
    } catch (error: any) {
      console.error("Error finding conversation between users:", error);
      throw error;
    }
  }

  // البحث في الرسائل
  static async searchMessages(
    conversationId: string,
    searchTerm: string
  ): Promise<Message[]> {
    try {
      const messagesRef = collection(
        db,
        this.conversationsCollection,
        conversationId,
        this.messagesCollection
      );

      const q = query(messagesRef); // إزالة orderBy
      const querySnapshot = await getDocs(q);

      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      // البحث في المحتوى
      const filteredMessages = messages.filter((message) =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // ترتيب محلي
      return filteredMessages.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime(); // ترتيب تنازلي للبحث
      });
    } catch (error: any) {
      console.error("Error searching messages:", error);
      throw error;
    }
  }

  // إضافة مستخدم إلى مجموعة
  static async addUserToGroup(
    conversationId: string,
    userId: string,
    addedBy: string
  ): Promise<void> {
    try {
      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        throw new Error("Conversation not found");
      }

      const conversationData = conversationSnap.data() as Conversation;
      if (!conversationData.isGroup) {
        throw new Error("This is not a group conversation");
      }

      if (!conversationData.participants.includes(addedBy)) {
        throw new Error("You are not a member of this group");
      }

      if (conversationData.participants.includes(userId)) {
        throw new Error("User is already a member of this group");
      }

      // إضافة المستخدم إلى المجموعة
      await updateDoc(conversationRef, {
        participants: [...conversationData.participants, userId],
        updatedAt: serverTimestamp(),
      });

      // إرسال رسالة إشعار
      await this.sendMessage(
        conversationId,
        "system",
        `تم إضافة ${userId} إلى المجموعة بواسطة ${addedBy}`,
        "text"
      );
    } catch (error: any) {
      console.error("Error adding user to group:", error);
      throw error;
    }
  }

  // إزالة مستخدم من مجموعة
  static async removeUserFromGroup(
    conversationId: string,
    userId: string,
    removedBy: string
  ): Promise<void> {
    try {
      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        throw new Error("Conversation not found");
      }

      const conversationData = conversationSnap.data() as Conversation;
      if (!conversationData.isGroup) {
        throw new Error("This is not a group conversation");
      }

      if (!conversationData.participants.includes(removedBy)) {
        throw new Error("You are not a member of this group");
      }

      if (!conversationData.participants.includes(userId)) {
        throw new Error("User is not a member of this group");
      }

      // إزالة المستخدم من المجموعة
      const updatedParticipants = conversationData.participants.filter(
        (p) => p !== userId
      );
      await updateDoc(conversationRef, {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      });

      // إرسال رسالة إشعار
      await this.sendMessage(
        conversationId,
        "system",
        `تم إزالة ${userId} من المجموعة بواسطة ${removedBy}`,
        "text"
      );
    } catch (error: any) {
      console.error("Error removing user from group:", error);
      throw error;
    }
  }

  // حذف محادثة
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      // حذف جميع الرسائل في المحادثة
      const messagesRef = collection(
        db,
        this.conversationsCollection,
        conversationId,
        this.messagesCollection
      );
      const messagesSnapshot = await getDocs(messagesRef);
      const batch = writeBatch(db);

      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // حذف المحادثة نفسها
      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      batch.delete(conversationRef);

      await batch.commit();
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  // الحصول على إحصائيات المحادثة
  static async getConversationStats(conversationId: string): Promise<{
    totalMessages: number;
    totalParticipants: number;
    lastActivity: any;
  }> {
    try {
      const messagesRef = collection(
        db,
        this.conversationsCollection,
        conversationId,
        this.messagesCollection
      );

      const messagesSnapshot = await getDocs(messagesRef);
      const conversationRef = doc(
        db,
        this.conversationsCollection,
        conversationId
      );
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        throw new Error("Conversation not found");
      }

      const conversationData = conversationSnap.data() as Conversation;

      return {
        totalMessages: messagesSnapshot.size,
        totalParticipants: conversationData.participants.length,
        lastActivity: conversationData.updatedAt,
      };
    } catch (error: any) {
      console.error("Error getting conversation stats:", error);
      throw error;
    }
  }
}

// تم إزالة دوال تهيئة البيانات التجريبية - النظام يعمل مع البيانات الحقيقية فقط

// دالة لفحص البيانات في Firestore (للتطوير فقط)
export const checkFirestoreData = async () => {
  try {
    console.log("🔍 Checking Firestore data...");

    // فحص المستخدمين
    const usersSnapshot = await getDocs(collection(db, "users"));
    console.log("👥 Users count:", usersSnapshot.size);

    // فحص المشاريع
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    console.log("📁 Projects count:", projectsSnapshot.size);

    // فحص المحادثات
    const conversationsSnapshot = await getDocs(
      collection(db, "conversations")
    );
    console.log("💬 Conversations count:", conversationsSnapshot.size);
  } catch (error) {
    console.error("❌ Error checking Firestore data:", error);
  }
};

// دالة إنشاء مشروع بواسطة مشرف
export const createProjectBySupervisor = async (
  supervisorId: string,
  projectData: {
    title: string;
    description: string;
    type: string;
    dueDate: string;
    students: string[];
  }
) => {
  try {
    const project = {
      ...projectData,
      status: "planning" as const,
      priority: "medium" as const,
      progress: 0,
      supervisorId,
      studentId: projectData.students[0] || "", // الطالب الأساسي
      todoList: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projectId = await ProjectService.createProject(project);

    // إضافة جميع الطلاب إلى المشروع
    for (const studentId of projectData.students) {
      await ProjectService.addStudentToProject(projectId, studentId);
    }

    return { success: true, projectId };
  } catch (error) {
    console.error("خطأ في إنشاء المشروع:", error);
    return { success: false, error };
  }
};

// دالة إدارة المهام بواسطة الطالب
export const manageTaskByStudent = async (
  projectId: string,
  taskData: {
    id?: string;
    title: string;
    description: string;
    dueDate: string;
    priority: "low" | "medium" | "high";
    completed?: boolean;
    assignedTo: string;
  }
) => {
  try {
    const task = {
      id: taskData.id || `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      completed: taskData.completed || false,
      dueDate: taskData.dueDate,
      assignedTo: taskData.assignedTo,
      priority: taskData.priority,
      createdAt: new Date().toISOString(),
      completedAt: taskData.completed ? new Date().toISOString() : undefined,
    };

    if (taskData.id) {
      // تحديث مهمة موجودة
      await ProjectService.updateTask(projectId, task);
    } else {
      // إضافة مهمة جديدة
      await ProjectService.addTask(projectId, task);
    }

    return { success: true, task };
  } catch (error) {
    console.error("خطأ في إدارة المهمة:", error);
    return { success: false, error };
  }
};

// خدمة الإشعارات
export const NotificationService = {
  // إنشاء إشعار جديد
  async createNotification(notificationData: {
    recipientId: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    category: "project" | "message" | "system" | "reminder";
    actionUrl?: string;
    senderId?: string;
    senderName?: string;
    senderAvatar?: string;
  }) {
    try {
      const notificationsRef = collection(db, "notifications");
      const newNotification = {
        ...notificationData,
        isRead: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(notificationsRef, newNotification);
      return docRef.id;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  // جلب إشعارات المستخدم
  async getUserNotifications(userId: string) {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("recipientId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const notifications: any[] = [];

      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return notifications;
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  },

  // تحديث حالة الإشعار
  async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // حذف إشعار
  async deleteNotification(notificationId: string) {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  // إنشاء إشعارات تجريبية
  async createSampleNotifications(userId: string) {
    try {
      const sampleNotifications = [
        {
          recipientId: userId,
          title: "مرحباً بك في منصة عمان المعرفية",
          message:
            "نرحب بك في المنصة. يمكنك الآن البدء في إدارة مشاريعك الأكاديمية",
          type: "info" as const,
          category: "system" as const,
        },
      ];

      const promises = sampleNotifications.map((notification) =>
        NotificationService.createNotification(notification)
      );

      await Promise.all(promises);
      console.log("Sample notifications created successfully");
    } catch (error) {
      console.error("Error creating sample notifications:", error);
      throw error;
    }
  },
};
