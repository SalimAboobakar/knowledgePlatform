# دليل إنشاء المؤشرات في Firebase

## المشكلة
عند استخدام استعلامات Firestore مع `where` و `orderBy` معاً، قد تظهر رسالة خطأ:
```
The query requires an index. You can create it here: [رابط Firebase Console]
```

## الحل

### الطريقة الأولى: إنشاء المؤشر يدوياً
1. انقر على الرابط الذي يظهر في رسالة الخطأ
2. ستنتقل إلى Firebase Console
3. اضغط على زر "Create Index" أو "إنشاء المؤشر"
4. انتظر حتى يتم بناء المؤشر (قد يستغرق بضع دقائق)

### الطريقة الثانية: إنشاء المؤشرات مسبقاً

#### مؤشرات المشاريع (projects collection)
```javascript
// مؤشر للمشاريع حسب الطالب والتاريخ
Collection: projects
Fields:
- studentId (Ascending)
- updatedAt (Descending)

// مؤشر للمشاريع حسب المشرف والتاريخ
Collection: projects
Fields:
- supervisorId (Ascending)
- updatedAt (Descending)

// مؤشر للمشاريع حسب التاريخ فقط
Collection: projects
Fields:
- updatedAt (Descending)
```

#### مؤشرات المستخدمين (users collection)
```javascript
// مؤشر للمستخدمين حسب الدور والاسم
Collection: users
Fields:
- role (Ascending)
- name (Ascending)

// مؤشر للمشرفين حسب التخصص والاسم
Collection: users
Fields:
- role (Ascending)
- specialization (Ascending)
- name (Ascending)
```

### الطريقة الثالثة: استخدام Firebase CLI
```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init firestore

# إنشاء ملف firestore.indexes.json
```

مثال لملف `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "studentId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "supervisorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "role",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "name",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

ثم قم بنشر المؤشرات:
```bash
firebase deploy --only firestore:indexes
```

## ملاحظات مهمة

1. **وقت البناء**: قد يستغرق بناء المؤشرات بضع دقائق
2. **التكلفة**: المؤشرات المركبة قد تزيد من تكلفة الاستعلامات
3. **الأداء**: استخدم المؤشرات بحكمة لتجنب التأثير على الأداء
4. **التطوير**: في بيئة التطوير، يمكن تجاهل بعض الأخطاء مؤقتاً

## الحل البديل في الكود

تم تعديل الكود لاستخدام الترتيب المحلي بدلاً من `orderBy` في Firestore لتجنب الحاجة للمؤشرات المركبة:

```typescript
// بدلاً من
q = query(
  collection(db, "projects"),
  where("studentId", "==", user.id),
  orderBy("updatedAt", "desc")
);

// نستخدم
q = query(
  collection(db, "projects"),
  where("studentId", "==", user.id)
);

// ثم نرتب النتائج محلياً
const projects = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data(),
})) as Project[];

return projects.sort((a, b) => {
  const dateA = new Date(a.updatedAt || 0);
  const dateB = new Date(b.updatedAt || 0);
  return dateB.getTime() - dateA.getTime();
});
```

## روابط مفيدة

- [Firebase Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli) 