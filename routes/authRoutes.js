const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// ✅ تسجيل مستخدم جديد
router.post('/register', authController.register);

// ✅ تسجيل الدخول
router.post('/login', authController.login);

// ✅ جوجل
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`
    }),
    authController.googleCallback
);

// ✅ جلب المستخدم الحالي
router.get('/current-user', authController.getCurrentUser);

// ✅ تسجيل الخروج
router.get('/logout', authController.logout);

module.exports = router;