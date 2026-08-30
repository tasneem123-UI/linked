// 📦 1. بنجيب الـ "استراتيجية" الخاصة بتسجيل الدخول عبر جوجل من مكتبة passport
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// 📦 2. بنجيب نموذج (Schema) المستخدم اللي عرفناه في ملف تاني عشان نتعامل مع قاعدة البيانات
const User = require('../models/User');

// 📦 3. بنصدّر دالة بتاخد الـ passport كـ parameter عشان نعدّل عليه ونضيف له الإعدادات
module.exports = (passport) => {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5554";

    // 🔐 4. بنقول لـ passport: "استخدم استراتيجية جوجل"
    passport.use(new GoogleStrategy({

        // 🆔 5. الـ ID بتاع تطبيقك عند جوجل (من Google Cloud Console)
        clientID: process.env.GOOGLE_CLIENT_ID,

        // 🔑 6. الـ Secret بتاع تطبيقك (مفتاح سري جداً)
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        // 🔗 7. الرابط اللي هترجعنا له جوجل بعد ما المستخدم يسجل دخوله
        callbackURL: `${backendUrl.replace(/\/$/, "")}/api/auth/google/callback`

        // 8. هنا بتبدأ الدالة الأساسية اللي بتتنفذ لما جوجل ترجعنا بالبيانات
    }, async (accessToken, refreshToken, profile, done) => {

        // 🧪 9. بنحط الكود في try/catch عشان لو حصل أي خطأ نقدر نمسكه
        try {

            // 🔍 10. بندور في قاعدة البيانات على مستخدم عنده نفس الـ googleId اللي جاي من جوجل
            let user = await User.findOne({ googleId: profile.id });

            // 👤 11. لو مش لاقيين المستخدم (يعني أول مرة يسجل)
            if (!user) {

                // 📝 12. بننشئ مستخدم جديد في الذاكرة (لسه محفوظش في قاعدة البيانات)
                user = new User({

                    // 🆔 13. بنخزن الـ ID بتاعه من جوجل
                    googleId: profile.id,

                    // 👤 14. الاسم اللي جاي من جوجل
                    name: profile.displayName,

                    // 📧 15. الإيميل الأول من قائمة الإيميلات اللي جات من جوجل
                    email: profile.emails[0].value,

                    // 🖼️ 16. رابط الصورة الشخصية اللي جاي من جوجل
                    photo: profile.photos[0].value
                });

                // 💾 17. بنحفظ المستخدم الجديد في قاعدة البيانات (MongoDB)
                await user.save();

                // 📢 18. نطبع رسالة في التيرمينال عشان نعرف إن مستخدم جديد اتسجل
                console.log('✅ مستخدم جديد:', user.email);

            } else {
                // 👋 19. لو المستخدم موجود بالفعل، نطبع رسالة إنه موجود
                console.log('👤 مستخدم موجود:', user.email);
            }

            // ✅ 20. بنرجع المستخدم (الجديد أو الموجود) لـ passport عشان يكمل
            return done(null, user);

        } catch (error) {
            // ❌ 21. لو حصل أي خطأ، نطبع الخطأ ونرجعه لـ passport
            console.error('❌ خطأ:', error);
            return done(error, null);
        }
    }));

    // 🔒 22. بنقول لـ passport: "لما تخزن المستخدم في الجلسة، خزن الـ ID بتاعه بس"
    passport.serializeUser((user, done) => {
        done(null, user.id); // 🆔 بنخزن user.id في الجلسة
    });

    // 🔓 23. بنقول لـ passport: "لما تجيب المستخدم من الجلسة، دور عليه في قاعدة البيانات"
    passport.deserializeUser(async (id, done) => {
        try {
            // 🔍 24. بندور على المستخدم في قاعدة البيانات باستخدام الـ ID
            const user = await User.findById(id);
            done(null, user); // ✅ نرجعه
        } catch (error) {
            done(error, null); // ❌ لو في خطأ، نرجعه
        }
    });
};

// 1. المستخدم يضغط "تسجيل الدخول بجوجل"
//    ↓
// 2. Passport ياخده ويوديه لجوجل (عشان يسجل دخوله هناك)
//    ↓
// 3. المستخدم يسجل دخوله في جوجل ويوافق على الأذونات
//    ↓
// 4. جوجل ترجعه مع بياناته إلى الرابط اللي كتبناه (callbackURL)
//    ↓
// 5. السيرفر يستقبل البيانات، ويدور على المستخدم في قاعدة البيانات
//    ↓
// 6. لو مش موجود: يضيفه جديد
//    لو موجود: يجلبه من قاعدة البيانات
//    ↓
// 7. يرجع المستخدم لـ Passport
//    ↓
// 8. Passport يخزن الـ ID بتاعه في الجلسة (Serialize)
//    ↓
// 9. المستخدم بقى "مسجل دخول" ✅
//    ↓
// 10. في كل طلب جديد، Passport ياخد الـ ID من الجلسة ويجيب بيانات المستخدم من قاعدة البيانات (Deserialize)