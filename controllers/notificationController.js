const Notification = require('../models/Notification');

// 📋 جلب الإشعارات
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.session.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ تحديث إشعار كمقروء
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'الإشعار غير موجود' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ success: true, message: 'تم تحديث الإشعار' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ تحديث كل الإشعارات كمقروءة
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.session.user?._id;
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        res.json({ success: true, message: 'تم تحديث كل الإشعارات' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ➕ إنشاء إشعار تجريبي (للاختبار)
exports.createTestNotification = async (req, res) => {
    try {
        const userId = req.session.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const notification = new Notification({
            userId,
            type: 'connection',
            message: '📢 هذا إشعار تجريبي!',
            relatedId: null
        });

        await notification.save();
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};