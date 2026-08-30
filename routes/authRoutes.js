const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const User = require('../models/User');

// 🚀 بدء تسجيل الدخول
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// 🔄 مسار العودة من جوجل
router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTENDURL}/login` 
    }),
    authController.googleCallback
);

// 👤 جلب المستخدم الحالي
router.get('/current-user', authController.getCurrentUser);

// 📋 جلب كل المستخدمين
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
            .select('name email photo')
            .limit(50);
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🚪 تسجيل الخروج
router.get('/logout', authController.logout);

// ✅ تأكدي من وجود السطر ده
module.exports = router;