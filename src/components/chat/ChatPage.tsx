import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Paper,
  InputAdornment,
  Chip,
  Badge,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link } from "@mui/material";
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Videocam as VideoIcon,
  Call as CallIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../data/mockData";
import {
  ChatService,
  Message,
  Conversation,
  UserService,
} from "../../services/firebaseService";

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [messageSearchTerm, setMessageSearchTerm] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showGroupManagementDialog, setShowGroupManagementDialog] =
    useState(false);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب جميع المستخدمين للدردشة الجديدة
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await UserService.getAllUsers();
        // استبعاد المستخدم الحالي
        const filteredUsers = users.filter(
          (u: User) => u.id !== user?.id
        );
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    if (user) {
      loadUsers();
    }
  }, [user]);

  // جلب محادثات المستخدم
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    const unsubscribe = ChatService.subscribeToUserConversations(
      user.id, // Use user.id (Firebase UID) instead of user.email
      (conversations) => {
        setConversations(conversations as any);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // جلب رسائل المحادثة المختارة
  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([]);
      return;
    }

    const unsubscribe = ChatService.subscribeToConversationMessages(
      selectedConversation.id,
      (messages) => {
        setMessages(messages as any);
        // تحديث حالة القراءة
        if (user?.id) {
          ChatService.markMessagesAsRead(selectedConversation.id!, user.id);
        }
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, user]);

  useEffect(() => {
    filterConversations();
  }, [searchTerm, conversations, allUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // تصفية الرسائل حسب البحث
  useEffect(() => {
    if (!messageSearchTerm) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter((message) =>
      message.content.toLowerCase().includes(messageSearchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
  }, [messageSearchTerm, messages]);

  const filterConversations = () => {
    if (!searchTerm) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter((conversation) => {
      // البحث في اسم المحادثة أو المشاركين
      if (conversation.isGroup && conversation.groupName) {
        return conversation.groupName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }

      // للدردشات الفردية، البحث في أسماء المشاركين
      return conversation.participants.some((participantId) => {
        const participant = allUsers.find((u) => u.id === participantId);
        return participant?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    });

    setFilteredConversations(filtered);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation?.id || !user?.id) return;

    try {
      setError(null);
      setLoading(true);
      await ChatService.sendMessage(
        selectedConversation.id,
        user.id,
        newMessage.trim()
      );
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "خطأ في إرسال الرسالة");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateNewChat = async () => {
    if (!user?.id || selectedUsers.length === 0) return;

    try {
      setError(null);
      setLoading(true);
      const participants = [user.id, ...selectedUsers];
      let conversationId: string;

      if (isGroupChat) {
        // التأكد من أن groupName موجود وصالح
        const validGroupName = groupName?.trim() || "مجموعة جديدة";
        const groupAvatar = validGroupName.charAt(0) || "م";

        conversationId = await ChatService.createConversation(
          participants,
          true,
          validGroupName,
          groupAvatar
        );
      } else {
        // للدردشات الفردية، تحقق من وجود محادثة سابقة
        const existingConversation =
          await ChatService.findConversationBetweenUsers(
            user.id,
            selectedUsers[0]
          );

        if (existingConversation) {
          conversationId = existingConversation.id!;
        } else {
          conversationId = await ChatService.createConversation(
            participants,
            false
          );
        }
      }

      // إعادة تحميل المحادثات
      const updatedConversations = await ChatService.getUserConversations(
        user.id
      );
      setConversations(updatedConversations as any);

      // اختيار المحادثة الجديدة
      const newConversation = updatedConversations.find(
        (c) => c.id === conversationId
      );
      if (newConversation) {
        setSelectedConversation(newConversation as any);
      }

      // إغلاق النافذة وإعادة تعيين الحقول
      setShowNewChatDialog(false);
      setSelectedUsers([]);
      setIsGroupChat(false);
      setGroupName("");
    } catch (error: any) {
      console.error("Error creating new chat:", error);
      setError(error.message || "خطأ في إنشاء المحادثة");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
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

      if (!allowedTypes.includes(file.type)) {
        setError("نوع الملف غير مسموح به");
        return;
      }

      // التحقق من حجم الملف (10 ميجابايت)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("حجم الملف يتجاوز الحد المسموح (10 ميجابايت)");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation?.id || !user?.id) return;

    try {
      setError(null);
      setLoading(true);
      await ChatService.sendFile(
        selectedConversation.id,
        user.id,
        selectedFile
      );
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error sending file:", error);
      setError(error.message || "خطأ في إرسال الملف");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation?.id || !user?.id) return;

    try {
      await ChatService.deleteMessage(
        selectedConversation.id,
        messageId,
        user.id
      );
      setShowMessageOptions(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("خطأ في حذف الرسالة");
    }
  };

  const handleSearchMessages = async () => {
    if (!selectedConversation?.id || !messageSearchTerm.trim()) return;

    try {
      const searchResults = await ChatService.searchMessages(
        selectedConversation.id,
        messageSearchTerm
      );
      setFilteredMessages(searchResults);
    } catch (error) {
      console.error("Error searching messages:", error);
      setError("خطأ في البحث في الرسائل");
    }
  };

  const handleAddUserToGroup = async (userId: string) => {
    if (!selectedConversation?.id || !user?.id) return;

    try {
      await ChatService.addUserToGroup(
        selectedConversation.id,
        userId,
        user.id
      );
      setShowGroupManagementDialog(false);
    } catch (error) {
      console.error("Error adding user to group:", error);
      setError("خطأ في إضافة المستخدم للمجموعة");
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!selectedConversation?.id || !user?.id) return;

    try {
      await ChatService.removeUserFromGroup(
        selectedConversation.id,
        userId,
        user.id
      );
    } catch (error) {
      console.error("Error removing user from group:", error);
      setError("خطأ في إزالة المستخدم من المجموعة");
    }
  };

  const getConversationStats = async () => {
    if (!selectedConversation?.id) return;

    try {
      const stats = await ChatService.getConversationStats(
        selectedConversation.id
      );
      console.log("Conversation stats:", stats);
    } catch (error) {
      console.error("Error getting conversation stats:", error);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return null; // للمجموعات، نعرض اسم المجموعة
    }
    const otherParticipantId = conversation.participants.find(
      (p) => p !== user?.id
    );
    return allUsers.find((u) => u.id === otherParticipantId);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "أمس";
    } else {
      return date.toLocaleDateString("ar-EG");
    }
  };

  const isMessageFromCurrentUser = (message: Message) => {
    return message.senderId === user?.id;
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          جاري تحميل المحادثات...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: "100%" }}>
      <Grid container spacing={3} sx={{ height: "calc(100vh - 200px)" }}>
        {/* قائمة المحادثات */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1, p: 0 }}>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    المحادثات
                  </Typography>
                  <IconButton
                    onClick={() => setShowNewChatDialog(true)}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  placeholder="البحث في المحادثات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>

              {/* قائمة المحادثات */}
              <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                {filteredConversations.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <ChatIcon
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      لا توجد محادثات
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {filteredConversations.map((conversation) => {
                      const otherParticipant =
                        getOtherParticipant(conversation);
                      const isSelected =
                        selectedConversation?.id === conversation.id;

                      return (
                        <ListItem
                          key={conversation.id}
                          button
                          selected={isSelected}
                          onClick={() => setSelectedConversation(conversation)}
                          sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={conversation.unreadCount || 0}
                              color="primary"
                              invisible={!conversation.unreadCount}
                            >
                              <Avatar>
                                {conversation.isGroup
                                  ? conversation.groupAvatar || "م"
                                  : otherParticipant?.avatar || "م"}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              conversation.isGroup
                                ? conversation.groupName || "مجموعة"
                                : otherParticipant?.name || "مستخدم"
                            }
                            secondary={
                              <Box component="span">
                                <Box component="span" sx={{ display: "block" }}>
                                  {conversation.lastMessage?.content ||
                                    "لا توجد رسائل"}
                                </Box>
                                {conversation.lastMessage && (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: "block",
                                      fontSize: "0.75rem",
                                      color: "text.secondary",
                                    }}
                                  >
                                    {formatTime(
                                      conversation.lastMessage.timestamp
                                    )}
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* منطقة الرسائل */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {selectedConversation ? (
              <>
                {/* Header المحادثة */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar>
                      {selectedConversation.isGroup
                        ? selectedConversation.groupAvatar || "م"
                        : getOtherParticipant(selectedConversation)?.avatar ||
                          "م"}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedConversation.isGroup
                          ? selectedConversation.groupName || "مجموعة"
                          : getOtherParticipant(selectedConversation)?.name ||
                            "مستخدم"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedConversation.isGroup
                          ? `${selectedConversation.participants.length} عضو`
                          : "متصل الآن"}
                      </Typography>
                    </Box>
                    {selectedConversation.isGroup && (
                      <IconButton
                        onClick={() => setShowGroupManagementDialog(true)}
                        sx={{ color: "primary.main" }}
                      >
                        <GroupIcon />
                      </IconButton>
                    )}
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* الرسائل */}
                <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                  {/* شريط البحث في الرسائل */}
                  {selectedConversation && (
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="البحث في الرسائل..."
                        value={messageSearchTerm}
                        onChange={(e) => setMessageSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: messageSearchTerm && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => setMessageSearchTerm("")}
                              >
                                <CloseIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        size="small"
                      />
                    </Box>
                  )}

                  {filteredMessages.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {messageSearchTerm
                          ? "لا توجد نتائج للبحث"
                          : "لا توجد رسائل بعد"}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {filteredMessages.map((message) => (
                        <Box
                          key={message.id}
                          sx={{
                            display: "flex",
                            justifyContent: isMessageFromCurrentUser(message)
                              ? "flex-end"
                              : "flex-start",
                            mb: 1,
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "70%",
                              bgcolor: isMessageFromCurrentUser(message)
                                ? "primary.main"
                                : "grey.100",
                              color: isMessageFromCurrentUser(message)
                                ? "white"
                                : "text.primary",
                              p: 1.5,
                              borderRadius: 2,
                              position: "relative",
                              "&:hover": {
                                "& .message-options": {
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            {/* خيارات الرسالة */}
                            {isMessageFromCurrentUser(message) && (
                              <IconButton
                                size="small"
                                className="message-options"
                                onClick={() =>
                                  setShowMessageOptions(
                                    showMessageOptions === message.id
                                      ? null
                                      : message.id || null
                                  )
                                }
                                sx={{
                                  position: "absolute",
                                  top: -8,
                                  right: -8,
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                  bgcolor: "background.paper",
                                  "&:hover": { bgcolor: "background.paper" },
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}

                            {/* قائمة خيارات الرسالة */}
                            {showMessageOptions === message.id && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: -40,
                                  right: 0,
                                  bgcolor: "background.paper",
                                  border: 1,
                                  borderColor: "divider",
                                  borderRadius: 1,
                                  boxShadow: 2,
                                  zIndex: 1,
                                }}
                              >
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleDeleteMessage(message.id!)
                                  }
                                  sx={{ color: "error.main" }}
                                >
                                  حذف
                                </Button>
                              </Box>
                            )}

                            <Typography variant="body2">
                              {message.type === "file" ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <AttachFileIcon />
                                  {message.fileUrl ? (
                                    <Link
                                      href={message.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        textDecoration: "none",
                                        color: "primary.main",
                                        "&:hover": {
                                          textDecoration: "underline",
                                        },
                                      }}
                                    >
                                      <Typography variant="body2">
                                        {message.fileName || "ملف"}
                                      </Typography>
                                    </Link>
                                  ) : (
                                    <Typography variant="body2">
                                      {message.fileName || "ملف"}
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                message.content
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 0.5,
                                opacity: 0.7,
                                textAlign: "right",
                              }}
                            >
                              {formatTime(message.timestamp)}
                              {isMessageFromCurrentUser(message) && (
                                <CheckIcon sx={{ fontSize: 16, ml: 0.5 }} />
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} />
                    </Box>
                  )}
                </Box>

                {/* إرسال رسالة */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                  {/* عرض الملف المختار */}
                  {selectedFile && (
                    <Box
                      sx={{ mb: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AttachFileIcon />
                          <Typography variant="body2">
                            {selectedFile.name}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedFile(null)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <IconButton
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ color: "primary.main" }}
                    >
                      <AttachFileIcon />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder="اكتب رسالة..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      multiline
                      maxRows={3}
                      size="small"
                    />
                    <IconButton
                      onClick={
                        selectedFile ? handleSendFile : handleSendMessage
                      }
                      disabled={!newMessage.trim() && !selectedFile}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <ChatIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    اختر محادثة
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    اختر محادثة من القائمة لبدء الدردشة
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* نافذة إنشاء محادثة جديدة */}
      <Dialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>محادثة جديدة</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>نوع المحادثة</InputLabel>
              <Select
                value={isGroupChat ? "group" : "individual"}
                onChange={(e) => setIsGroupChat(e.target.value === "group")}
                label="نوع المحادثة"
              >
                <MenuItem value="individual">دردشة فردية</MenuItem>
                <MenuItem value="group">مجموعة</MenuItem>
              </Select>
            </FormControl>

            {isGroupChat && (
              <TextField
                fullWidth
                label="اسم المجموعة"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}

            <FormControl fullWidth>
              <InputLabel>اختر المستخدمين</InputLabel>
              <Select
                multiple
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.target.value as string[])}
                label="اختر المستخدمين"
              >
                {allUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                      >
                        {user.avatar}
                      </Avatar>
                      <Typography>{user.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleCreateNewChat}
            variant="contained"
            disabled={
              selectedUsers.length === 0 || (isGroupChat && !groupName.trim())
            }
          >
            إنشاء المحادثة
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة إدارة المجموعة */}
      <Dialog
        open={showGroupManagementDialog}
        onClose={() => setShowGroupManagementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>إدارة المجموعة</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              أعضاء المجموعة
            </Typography>
            {selectedConversation?.participants.map((participantId) => {
              const participant = allUsers.find((u) => u.id === participantId);
              return (
                <Box
                  key={participantId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {participant?.avatar || "م"}
                    </Avatar>
                    <Typography>
                      {participant?.name || participantId}
                    </Typography>
                  </Box>
                  {participantId !== user?.id && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveUserFromGroup(participantId)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              );
            })}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              إضافة عضو جديد
            </Typography>
            <FormControl fullWidth>
              <InputLabel>اختر المستخدم</InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddUserToGroup(e.target.value as string);
                  }
                }}
                label="اختر المستخدم"
              >
                {allUsers
                  .filter(
                    (u) => !selectedConversation?.participants.includes(u.id)
                  )
                  .map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                        >
                          {user.avatar}
                        </Avatar>
                        <Typography>{user.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGroupManagementDialog(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* رسائل الخطأ */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatPage;
