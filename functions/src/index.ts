import { initializeApp } from 'firebase-admin/app';
import { authFunctions } from './auth';
import { projectFunctions } from './projects';
import { chatbotFunctions } from './chatbot';
import { notificationFunctions } from './notifications';
import { fileFunctions } from './files';

// Initialize Firebase Admin
initializeApp();

// Export all functions
export const auth = authFunctions;
export const projects = projectFunctions;
export const chatbot = chatbotFunctions;
export const notifications = notificationFunctions;
export const files = fileFunctions; 