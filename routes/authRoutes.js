const express = require('express');
const passport = require('passport');
const router = express.Router();

// 1️⃣ البداية: لما المستخدم يدوس على زرار جوجل في الفرونت
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

// 2️⃣ النهاية: الرابط اللي جوجل بيرجع عليه بالبيانات (Callback)
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL}/login` // لو حصل فشل يرجع لصفحة اللوجين في الفرونت
    }),
    (req, res) => {
        // 🛠️ هنا الحل الجذري: بيقرا FRONTEND_URL أو CLIENT_URL من الـ .env (http://localhost:3000)
        const frontendURL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
        
        // التوجيه للفرونت إند بعد النجاح
        res.redirect(`${frontendURL}`); 
    }
);

module.exports = router;