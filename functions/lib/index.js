"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = exports.notifications = exports.chatbot = exports.projects = exports.auth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("./auth");
const projects_1 = require("./projects");
const chatbot_1 = require("./chatbot");
const notifications_1 = require("./notifications");
const files_1 = require("./files");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
// Export all functions
exports.auth = auth_1.authFunctions;
exports.projects = projects_1.projectFunctions;
exports.chatbot = chatbot_1.chatbotFunctions;
exports.notifications = notifications_1.notificationFunctions;
exports.files = files_1.fileFunctions;
//# sourceMappingURL=index.js.map