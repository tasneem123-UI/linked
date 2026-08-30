const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ تحديد مكان تخزين الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/posts');
        // لو المجلد مش موجود، نعمله
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // 🔑 اسم فريد للصورة (التاريخ + الوقت + الاسم الأصلي)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// ✅ فلترة أنواع الملفات المسموحة
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('❌ نوع الملف غير مدعوم (يُسمح بـ jpeg, jpg, png, gif)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB حد أقصى
    fileFilter: fileFilter
});

module.exports = upload;