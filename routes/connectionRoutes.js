const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const User = require('../models/User'); // ✅ أضيفي السطر ده

// ➕ إرسال طلب اتصال
router.post('/send', connectionController.sendRequest);

// ✅ قبول طلب
router.put('/accept/:requestId', connectionController.acceptRequest);

// ❌ رفض طلب
router.put('/reject/:requestId', connectionController.rejectRequest);

// 📋 جلب الطلبات المعلقة
router.get('/pending', connectionController.getPendingRequests);

// 📋 جلب قائمة الاتصالات
router.get('/', connectionController.getConnections);

// 📋 جلب مستخدم معين
router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-__v')
            .populate('connections', 'name photo headline');
        if (!user) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📋 جلب طلب اتصال معين
router.get('/:requestId', async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.requestId)
            .populate('senderId', 'name photo');
        if (!request) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }
        res.json({ success: true, request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
module.exports = router;