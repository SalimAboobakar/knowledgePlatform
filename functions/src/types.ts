// User Document
export interface User {
  uid: string;
  email: string;
  role: "student" | "supervisor" | "coordinator" | "admin";
  profile: {
    firstName: string;
    lastName: string;
    university: string;
    department: string;
    specialization: string;
    phone?: string;
    avatar?: string;
  };
  preferences: {
    language: "ar" | "en";
    notifications: boolean;
    theme: "light" | "dark";
  };
  createdAt: any;
  updatedAt: any;
}

// Milestone interface
export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: any;
  completed: boolean;
  completedAt?: any;
  progress: number; // 0-100
}

// Project Document
export interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "planning" | "active" | "review" | "completed";
  studentId: string;
  supervisorId: string;
  timeline: Milestone[];
  progress: number; // 0-100
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

// Messages Subcollection
export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  readBy: { [userId: string]: any };
  createdAt: any;
}

// Chatbot Interaction
export interface ChatbotInteraction {
  id: string;
  userId: string;
  query: string;
  response: string;
  context?: string;
  language: "ar" | "en";
  rating?: number;
  feedback?: string;
  createdAt: any;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  actionUrl?: string;
  createdAt: any;
}

// File Metadata
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  projectId?: string;
  thumbnailUrl?: string;
  createdAt: any;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "supervisor";
  university: string;
  department: string;
  specialization: string;
  phone?: string;
}

export interface ProjectForm {
  title: string;
  description: string;
  type: string;
  supervisorId: string;
  tags: string[];
  timeline: Omit<Milestone, "id" | "completed" | "completedAt">[];
} 