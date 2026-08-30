const User = require('../models/User');

// ✅ مسار العودة من جوجل
exports.googleCallback = (req, res) => {
    req.session.user = req.user;
    res.redirect(process.env.FRONTENDURL);
};

// ✅ جلب المستخدم الحالي
exports.getCurrentUser = async (req, res) => {
    if (req.session.user) {
        try {
            const user = await User.findOne({ googleId: req.session.user.googleId });
            res.json({ success: true, user: user });
        } catch (error) {
            res.json({ success: false, user: null });
        }
    } else {
        res.json({ success: false, user: null });
    }
};

// ✅ تسجيل الخروج
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({ success: false, message: 'خطأ في تسجيل الخروج' });
        }
        res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
    });
};