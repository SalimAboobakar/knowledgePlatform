"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationFunctions = exports.deleteReadNotifications = exports.deleteNotification = exports.getUserNotifications = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.sendBulkNotification = exports.sendNotification = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
// إرسال إشعار للمستخدم
exports.sendNotification = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
        }
        // التحقق من وجود المستخدم المرسل
        const sender = await db.collection('users').doc(auth.uid).get();
        if (!sender.exists) {
            throw new https_1.HttpsError('permission-denied', 'المستخدم المرسل غير موجود');
        }
        const senderData = sender.data();
        const canSendNotification = (senderData === null || senderData === void 0 ? void 0 : senderData.role) === 'admin' ||
            (senderData === null || senderData === void 0 ? void 0 : senderData.role) === 'coordinator' ||
            (senderData === null || senderData === void 0 ? void 0 : senderData.role) === 'supervisor';
        if (!canSendNotification) {
            throw new https_1.HttpsError('permission-denied', 'ليس لديك صلاحية لإرسال إشعارات');
        }
        // التحقق من وجود المستخدم المستلم
        const recipient = await db.collection('users').doc(data.userId).get();
        if (!recipient.exists) {
            throw new https_1.HttpsError('not-found', 'المستخدم المستلم غير موجود');
        }
        // إنشاء الإشعار
        const notificationData = {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            read: false,
            actionUrl: data.actionUrl,
            createdAt: new Date(),
        };
        const notificationRef = await db.collection('notifications').add(notificationData);
        return {
            success: true,
            data: Object.assign({ id: notificationRef.id }, notificationData),
            message: 'تم إرسال الإشعار بنجاح',
        };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw new https_1.HttpsError('internal', 'حدث خطأ أثناء إرسال الإشعار');
    }
});
// إرسال إشعار جماعي
exports.sendBulkNotification = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
        }
        // التحقق من صلاحيات المستخدم
        const sender = await db.collection('users').doc(auth.uid).get();
        if (!sender.exists) {
            throw new https_1.HttpsError('permission-denied', 'المستخدم المرسل غير موجود');
        }
        const senderData = sender.data();
        if ((senderData === null || senderData === void 0 ? void 0 : senderData.role) !== 'admin' && (senderData === null || senderData === void 0 ? void 0 : senderData.role) !== 'coordinator') {
            throw new https_1.HttpsError('permission-denied', 'فقط المدير والمنسق يمكنهم إرسال إشعارات جماعية');
        }
        // إنشاء الإشعارات باستخدام batch
        const batch = db.batch();
        const notifications = [];
        for (const userId of data.userIds) {
            const notificationRef = db.collection('notifications').doc();
            const notificationData = {
                userId: userId,
                title: data.title,
                message: data.message,
                type: data.type,
                read: false,
                actionUrl: data.actionUrl,
                createdAt: new Date(),
            };
            batch.set(notificationRef, notificationData);
            notifications.push(Object.assign({ id: notificationRef.id }, notificationData));
        }
        await batch.commit();
        return {
            success: true,
            data: notifications,
            message: `تم إرسال ${notifications.length} إشعار بنجاح`,
        };
    }
    catch (error) {
        console.error('Error sending bulk notification:', error);
        throw new https_1.HttpsError('internal', 'حدث خطأ أثناء إرسال الإشعارات الجماعية');
    }
});
// تحديث حالة قراءة الإشعار
exports.markNotificationAsRead = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
        }
        // التحقق من وجود الإشعار
        const notification = await db.collection('notifications').doc(data.notificationId).get();
        if (!notification.exists) {
            throw new https_1.HttpsError('not-found', 'الإشعار غير موجود');
        }
        const notificationData = notification.data();
        if (notificationData.userId !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'ليس لديك صلاحية لتحديث هذا الإشعار');
        }
        // تحديث حالة القراءة
        await db.collection('notifications').doc(data.notificationId).update({
            read: true,
        });
        return {
            success: true,
            message: 'تم تحديث حالة الإشعار بنجاح',
        };
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        throw new https_1.HttpsError('internal', 'حدث خطأ أثناء تحديث حالة الإشعار');
    }
});
// تحديث جميع إشعارات المستخدم كمقروءة
exports.markAllNotificationsAsRead = (0, https_1.onCall)(async (request) => {
    try {
        const { auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
        }
        // الحصول على جميع الإشعارات غير المقروءة للمستخدم
        const notifications = await db.collection('notifications')
            .where('userId', '==', auth.uid)
            .where('read', '==', false)
            .get();
        if (notifications.empty) {
            return {
                success: true,
                message: 'لا توجد إشعارات غير مقروءة',
            };
        }
        // تحديث جميع الإشعارات كمقروءة
        const batch = db.batch();
        notifications.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();
        return {
            success: true,
            message: `تم تحديث ${notifications.docs.length} إشعار كمقروء`,
        };
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw new https_1.HttpsError('internal', 'حدث خطأ أثناء تحديث الإشعارات');
    }
});
// الحصول على إشعارات المستخدم
exports.getUserNotifications = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
        }
        // بناء الاستعلام
        let query = db.collection('notifications')
            .where('userId', '==', auth.uid)
            .orderBy('createdAt', 'desc');
        if (data.unreadOnly) {
            query = query.where('read', '==', false);
        }
        if (data.limit) {
            query = query.limit(data.limit);
        }
        else {
            query = query.limit(50); // افتراضي
        }
        const snapshot = await query.get();
        const notifications = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        return {
            success: true,
            data: notifications,
            message: 'تم جلب الإشعارات بنجاح',
        };
    }
    catch (error) {
        console.error('Error getting user notifications:', error);
        throw new https_1.HttpsError('internal', 'حدث خطأ أثناء جلب الإشعارات');
    }
});
// حذف إشعار
exports.deleteNotification = (0, https_1.onCall)(async (request) => {
    try {
        const { data, auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
        }
        // التحقق من وجود الإشعار
        const notification = await db.collection('notifications').doc(data.notificationId).get();
        if (!notification.exists) {
            throw new https_1.HttpsError('not-found', 'الإشعار غير موجود');
        }
        const notificationData = notification.data();
        if (notificationData.userId !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'ليس لديك صلاحية لحذف هذا الإشعار');
        }
        // حذف الإشعار
        await db.collection('notifications').doc(data.notificationId).delete();
        return {
            success: true,
            message: 'تم حذف الإشعار بنجاح',
        };
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        throw new https_1.HttpsError('internal', 'حدث خطأ أثناء حذف الإشعار');
    }
});
// حذف جميع إشعارات المستخدم المقروءة
exports.deleteReadNotifications = (0, https_1.onCall)(async (request) => {
    try {
        const { auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
        }
        // الحصول على جميع الإشعارات المقروءة للمستخدم
        const notifications = await db.collection('notifications')
            .where('userId', '==', auth.uid)
            .where('read', '==', true)
            .get();
        if (notifications.empty) {
            return {
                success: true,
                message: 'لا توجد إشعارات مقروءة للحذف',
            };
        }
        // حذف جميع الإشعارات المقروءة
        const batch = db.batch();
        notifications.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        return {
            success: true,
            message: `تم حذف ${notifications.docs.length} إشعار مقروء`,
        };
    }
    catch (error) {
        console.error('Error deleting read notifications:', error);
        throw new https_1.HttpsError('internal', 'حدث خطأ أثناء حذف الإشعارات المقروءة');
    }
});
exports.notificationFunctions = {
    sendNotification: exports.sendNotification,
    sendBulkNotification: exports.sendBulkNotification,
    markNotificationAsRead: exports.markNotificationAsRead,
    markAllNotificationsAsRead: exports.markAllNotificationsAsRead,
    getUserNotifications: exports.getUserNotifications,
    deleteNotification: exports.deleteNotification,
    deleteReadNotifications: exports.deleteReadNotifications,
};
//# sourceMappingURL=notifications.js.map