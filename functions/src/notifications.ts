import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { Notification } from './types';

const db = getFirestore();

// إرسال إشعار للمستخدم
export const sendNotification = onCall<{ userId: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; actionUrl?: string }>(async (request: any) => {
  try {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
    }

    // التحقق من وجود المستخدم المرسل
    const sender = await db.collection('users').doc(auth.uid).get();
    if (!sender.exists) {
      throw new HttpsError('permission-denied', 'المستخدم المرسل غير موجود');
    }

    const senderData = sender.data();
    const canSendNotification = 
      senderData?.role === 'admin' ||
      senderData?.role === 'coordinator' ||
      senderData?.role === 'supervisor';

    if (!canSendNotification) {
      throw new HttpsError('permission-denied', 'ليس لديك صلاحية لإرسال إشعارات');
    }

    // التحقق من وجود المستخدم المستلم
    const recipient = await db.collection('users').doc(data.userId).get();
    if (!recipient.exists) {
      throw new HttpsError('not-found', 'المستخدم المستلم غير موجود');
    }

    // إنشاء الإشعار
    const notificationData: Omit<Notification, 'id'> = {
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
      data: {
        id: notificationRef.id,
        ...notificationData,
      },
      message: 'تم إرسال الإشعار بنجاح',
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new HttpsError('internal', 'حدث خطأ أثناء إرسال الإشعار');
  }
});

// إرسال إشعار جماعي
export const sendBulkNotification = onCall<{ userIds: string[]; title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; actionUrl?: string }>(async (request: any) => {
  try {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
    }

    // التحقق من صلاحيات المستخدم
    const sender = await db.collection('users').doc(auth.uid).get();
    if (!sender.exists) {
      throw new HttpsError('permission-denied', 'المستخدم المرسل غير موجود');
    }

    const senderData = sender.data();
    if (senderData?.role !== 'admin' && senderData?.role !== 'coordinator') {
      throw new HttpsError('permission-denied', 'فقط المدير والمنسق يمكنهم إرسال إشعارات جماعية');
    }

    // إنشاء الإشعارات باستخدام batch
    const batch = db.batch();
    const notifications = [];

    for (const userId of data.userIds) {
      const notificationRef = db.collection('notifications').doc();
      const notificationData: Omit<Notification, 'id'> = {
        userId: userId,
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        actionUrl: data.actionUrl,
        createdAt: new Date(),
      };

      batch.set(notificationRef, notificationData);
      notifications.push({
        id: notificationRef.id,
        ...notificationData,
      });
    }

    await batch.commit();

    return {
      success: true,
      data: notifications,
      message: `تم إرسال ${notifications.length} إشعار بنجاح`,
    };
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    throw new HttpsError('internal', 'حدث خطأ أثناء إرسال الإشعارات الجماعية');
  }
});

// تحديث حالة قراءة الإشعار
export const markNotificationAsRead = onCall<{ notificationId: string }>(async (request: any) => {
  try {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
    }

    // التحقق من وجود الإشعار
    const notification = await db.collection('notifications').doc(data.notificationId).get();
    if (!notification.exists) {
      throw new HttpsError('not-found', 'الإشعار غير موجود');
    }

    const notificationData = notification.data() as Notification;
    if (notificationData.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'ليس لديك صلاحية لتحديث هذا الإشعار');
    }

    // تحديث حالة القراءة
    await db.collection('notifications').doc(data.notificationId).update({
      read: true,
    });

    return {
      success: true,
      message: 'تم تحديث حالة الإشعار بنجاح',
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new HttpsError('internal', 'حدث خطأ أثناء تحديث حالة الإشعار');
  }
});

// تحديث جميع إشعارات المستخدم كمقروءة
export const markAllNotificationsAsRead = onCall(async (request: any) => {
  try {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
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
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new HttpsError('internal', 'حدث خطأ أثناء تحديث الإشعارات');
  }
});

// الحصول على إشعارات المستخدم
export const getUserNotifications = onCall<{ limit?: number; unreadOnly?: boolean }>(async (request: any) => {
  try {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
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
    } else {
      query = query.limit(50); // افتراضي
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      data: notifications,
      message: 'تم جلب الإشعارات بنجاح',
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw new HttpsError('internal', 'حدث خطأ أثناء جلب الإشعارات');
  }
});

// حذف إشعار
export const deleteNotification = onCall<{ notificationId: string }>(async (request: any) => {
  try {
    const { data, auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
    }

    // التحقق من وجود الإشعار
    const notification = await db.collection('notifications').doc(data.notificationId).get();
    if (!notification.exists) {
      throw new HttpsError('not-found', 'الإشعار غير موجود');
    }

    const notificationData = notification.data() as Notification;
    if (notificationData.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'ليس لديك صلاحية لحذف هذا الإشعار');
    }

    // حذف الإشعار
    await db.collection('notifications').doc(data.notificationId).delete();

    return {
      success: true,
      message: 'تم حذف الإشعار بنجاح',
    };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new HttpsError('internal', 'حدث خطأ أثناء حذف الإشعار');
  }
});

// حذف جميع إشعارات المستخدم المقروءة
export const deleteReadNotifications = onCall(async (request: any) => {
  try {
    const { auth } = request;
    
    if (!auth) {
      throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول أولاً');
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
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw new HttpsError('internal', 'حدث خطأ أثناء حذف الإشعارات المقروءة');
  }
});

export const notificationFunctions = {
  sendNotification,
  sendBulkNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserNotifications,
  deleteNotification,
  deleteReadNotifications,
}; 