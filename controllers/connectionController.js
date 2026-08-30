const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const Notification = require('../models/Notification'); // ✅ أضيفي السطر ده

// ➕ إرسال طلب اتصال
exports.sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.session.user?._id;

        if (!senderId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ success: false, message: 'لا يمكنك إرسال طلب لنفسك' });
        }

        // ✅ التأكد من عدم وجود طلب مسبق
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'طلب مسبق موجود بالفعل' });
        }

        const request = new ConnectionRequest({ senderId, receiverId });
        await request.save();

        // ✅ إشعار طلب اتصال
        await Notification.create({
            userId: receiverId,
            type: 'connection',
            message: `${req.session.user.name} أرسل طلب اتصال`,
            relatedId: request._id
        });
        console.log('📢 إشعار طلب اتصال تم إنشاؤه');

        res.json({ success: true, message: 'تم إرسال طلب الاتصال', request });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ قبول طلب اتصال
exports.acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const request = await ConnectionRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }

        if (request.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'غير مصرح لك' });
        }

        request.status = 'accepted';
        await request.save();

        // ➕ إضافة كل منهما لقائمة اتصالات الآخر
        await User.findByIdAndUpdate(request.senderId, {
            $push: { connections: request.receiverId }
        });
        await User.findByIdAndUpdate(request.receiverId, {
            $push: { connections: request.senderId }
        });

        res.json({ success: true, message: 'تم قبول الطلب' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ❌ رفض طلب اتصال
exports.rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const request = await ConnectionRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }

        if (request.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'غير مصرح لك' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ success: true, message: 'تم رفض الطلب' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 📋 جلب طلبات الاتصال المعلقة
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const requests = await ConnectionRequest.find({
            receiverId: userId,
            status: 'pending'
        }).populate('senderId', 'name photo headline');

        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 📋 جلب قائمة الاتصالات
exports.getConnections = async (req, res) => {
    try {
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const user = await User.findById(userId).populate('connections', 'name photo headline');
        res.json({ success: true, connections: user.connections });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};