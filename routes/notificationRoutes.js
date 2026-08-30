const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// 📋 جلب الإشعارات
router.get('/', notificationController.getNotifications);

// ➕ إنشاء إشعار تجريبي (للاختبار)
router.post('/test', notificationController.createTestNotification);

// ✅ تحديث إشعار واحد
router.put('/read/:notificationId', notificationController.markAsRead);

// ✅ تحديث كل الإشعارات
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;