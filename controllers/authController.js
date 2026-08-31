const User = require('../models/User');



// ✅ مسار العودة من جوجل (ده اللي محتاجاه)
exports.googleCallback = (req, res) => {
    // تخزين المستخدم في الجلسة
    req.session.user = req.user;
    
    // التوجيه للفرونت مع البيانات
    res.redirect(`${process.env.FRONTEND_URL}/?user=${encodeURIComponent(JSON.stringify(req.user))}`);
};

// ✅ جلب المستخدم الحالي
exports.getCurrentUser = async (req, res) => {
    if (req.session.user) {
        try {
            // جلب بيانات محدثة من قاعدة البيانات
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

//         المستخدم
//             │
//             │ يضغط Login
//             ▼
//  /api/auth/google
//             │
//             ▼
//           Google
//             │
//             │ تسجيل الدخول
//             ▼
//  /api/auth/google/callback
//             │
//             ▼
//          Passport
//             │
//             ▼
        //  MongoDB


//         1. انتِ ضغطتي "تسجيل الدخول بجوجل" في الفرونت
//    ↓
// 2. الفرونت راح للباك: http://localhost:5554/api/auth/google
//    ↓
// 3. الباك استخدم Passport عشان يوديكِ لجوجل
//    ↓
// 4. جوجل سألتك: "تسمحي للتطبيق يشوف بياناتك؟" ووافقتي
//    ↓
// 5. جوجل ردّت على الباك بالبيانات دي:
//    {
//      id: "106588741961348514497",    // ID المستخدم في جوجل
//      name: "tasneema khalid",
//      email: "tasneemakhalid@gmail.com",
//      photo: "https://...",
//      token: "ya29.a0AdMD6Ei..."      // Access Token من جوجل
//    }
//    ↓
// 6. الباك استلم البيانات من جوجل عن طريق Passport
//    ↓
// 7. الباك خزن البيانات في Session (الجلسة)
//    req.session.user = user;
//    ↓
// 8. الباك ردّ على الفرونت بالبيانات عن طريق Redirect:
//    res.redirect(`http://localhost:3000/?user=${encodeURIComponent(JSON.stringify(user))}`);
//    ↓
// 9. الفرونت استقبل البيانات من الـ URL:
//    const userData = searchParams.get('user')
//    ↓
// 10. الفرونت خزن البيانات في localStorage:
//     localStorage.setItem('user', JSON.stringify(parsedUser))