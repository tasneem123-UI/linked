require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');

// ✅ الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

const app = express();

// ✅ CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(cookieParser());
app.use(express.json());

// ✅ Session (باستخدام الذاكرة المؤقتة - Memory Store)
app.use(session({
    name: 'linkedin_session',
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// ✅ مهم لـ Vercel
app.set('trust proxy', 1);

// ✅ خدمة الملفات الثابتة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ✅ Route اختبار
app.get('/test', (req, res) => {
    res.send('✅ Server is running!');
});
// ✅ Route بسيط جداً للاختبار (من غير أي حاجة)
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is alive!',
        time: new Date().toISOString()
    });
});
// ✅ تصدير الـ app عشان Vercel
module.exports = app;

// ✅ لو مش شغال على Vercel, شغّل السيرفر
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5554;
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`🔑 Google: http://localhost:${PORT}/api/auth/google`);
    });
}