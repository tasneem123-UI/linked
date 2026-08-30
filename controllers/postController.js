const Post = require('../models/Post');
const Notification = require('../models/Notification'); // ✅ أضيفي السطر ده

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.user?._id;
        console.log('💾 User ID:', userId);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        let imagePath = '';
        if (req.file) {
            imagePath = `/uploads/posts/${req.file.filename}`;
        }

        const post = new Post({
            userId,
            content,
            image: imagePath
        });

        await post.save();

        res.json({ success: true, message: 'تم النشر', post });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// جلب كل المنشورات
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userId', 'name photo headline')
            .populate('likes', 'name photo')
            .populate('comments.userId', 'name photo')
            .sort({ createdAt: -1 });

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ إعجاب/إلغاء إعجاب مع إشعار
exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'المنشور غير موجود' });
        }

        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);

            // ✅ إشعار إعجاب (لو معجبش بنفسه)
            if (post.userId.toString() !== userId.toString()) {
                await Notification.create({
                    userId: post.userId,
                    type: 'like',
                    message: `${req.session.user.name} أعجب بمنشورك`,
                    relatedId: postId
                });
                console.log('📢 إشعار إعجاب تم إنشاؤه');
            }
        }

        await post.save();
        res.json({ success: true, likesCount: post.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ إضافة تعليق مع إشعار
exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'المنشور غير موجود' });
        }

        const comment = { userId, text, createdAt: new Date() };
        post.comments.push(comment);
        await post.save();

        // ✅ إشعار تعليق (لو علق على منشوره مش هينزل إشعار)
        if (post.userId.toString() !== userId.toString()) {
         await Notification.create({
    userId: post.userId,
    type: 'comment',
    message: `${req.session.user.name} علق: "${text}"`, // 👈 هيظهر نص التعليق
    relatedId: postId
});
            console.log('📢 إشعار تعليق تم إنشاؤه');
        }

        res.json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// حذف منشور
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.session.user?._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'المنشور غير موجود' });
        }

        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'ليس لديك صلاحية الحذف' });
        }

        await post.deleteOne();
        res.json({ success: true, message: 'تم حذف المنشور' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};