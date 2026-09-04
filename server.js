require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// ✅ إنشاء app أولاً قبل أي شيء
const app = express();

// ✅ Middleware لضمان الاتصال بـ DB قبل كل طلب
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('❌ DB Connection failed:', err);
        res.status(500).json({ success: false, error: 'Database connection failed' });
    }
});

// ✅ CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://linkedin-front.vercel.app',
        'https://linkedin-front-www.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session
app.use(session({
    name: 'linkedin_session',
    secret: process.env.SESSION_SECRET,
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
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`🔑 Google: http://localhost:${PORT}/api/auth/google`);
        console.log(`📌 PORT = ${PORT}`);
    });
}