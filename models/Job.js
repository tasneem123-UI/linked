// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    // 📌 عنوان الوظيفة
    title: {
        type: String,
        required: true
    },

    // 🏢 اسم الشركة
    company: {
        type: String,
        required: true
    },

    // 📍 الموقع
    location: {
        type: String,
        required: true
    },

    // 💰 الراتب (اختياري)
    salary: {
        type: String,
        default: 'غير محدد'
    },

    // 📝 وصف الوظيفة
    description: {
        type: String,
        required: true
    },

    // 🔗 رابط التقديم (اختياري)
    applyLink: {
        type: String,
        default: ''
    },

    // 👤 ناشر الوظيفة
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // 👥 المتقدمين للوظيفة
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // 📅 تاريخ النشر
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', jobSchema);