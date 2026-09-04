const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ مسار العودة من جوجل
exports.googleCallback = (req, res) => {
    try {
        if (!req.user) {
            console.error('❌ No user from Google');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
        }
        
        req.session.user = req.user;
        console.log('✅ Google login successful:', req.user.email);
        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error('❌ Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};

// ✅ جلب المستخدم الحالي
exports.getCurrentUser = async (req, res) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user._id).select('-password');
            if (!user) {
                return res.json({ success: false, user: null });
            }
            return res.json({ success: true, user });
        }
        return res.json({ success: false, user: null });
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        return res.json({ success: false, user: null });
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

// ✅ تسجيل مستخدم جديد
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'جميع الحقول مطلوبة' 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'الإيميل مستخدم بالفعل' 
            });
        }

        const user = new User({ name, email, password });
        await user.save();

        req.session.user = user;

        res.json({
            success: true,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                photo: user.photo 
            }
        });
    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// ✅ تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'الإيميل والرقم السري مطلوبين' 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'الإيميل أو الرقم السري غير صحيح' 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'الإيميل أو الرقم السري غير صحيح' 
            });
        }

        req.session.user = user;

        res.json({
            success: true,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                photo: user.photo 
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};