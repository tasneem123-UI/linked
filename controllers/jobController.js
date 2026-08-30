const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification'); // ✅ أضيفي السطر ده

// ➕ نشر وظيفة جديدة
exports.createJob = async (req, res) => {
    try {
        const { title, company, location, salary, description, applyLink } = req.body;
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const job = new Job({
            title,
            company,
            location,
            salary: salary || 'غير محدد',
            description,
            applyLink: applyLink || '',
            postedBy: userId
        });

        await job.save();

        // ✅ إشعار وظيفة جديدة (لجميع المستخدمين)
        // بنجيب كل المستخدمين عشان نبعتلهم إشعار
        const allUsers = await User.find({}, '_id');
        const notifications = allUsers.map(user => ({
            userId: user._id,
            type: 'job',
            message: `وظيفة جديدة: ${title} في ${company}`,
            relatedId: job._id
        }));
        await Notification.insertMany(notifications);
        console.log(`📢 إشعار وظيفة جديدة تم إنشاؤه لـ ${notifications.length} مستخدم`);

        res.json({ success: true, message: 'تم نشر الوظيفة بنجاح', job });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 📋 جلب كل الوظائف
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('postedBy', 'name photo email')
            .populate('applicants', 'name photo')
            .sort({ createdAt: -1 });

        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 📋 جلب وظيفة واحدة
exports.getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId)
            .populate('postedBy', 'name photo email')
            .populate('applicants', 'name photo');

        if (!job) {
            return res.status(404).json({ success: false, message: 'الوظيفة غير موجودة' });
        }

        res.json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 📝 التقدم لوظيفة
exports.applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'الوظيفة غير موجودة' });
        }

        if (job.applicants.includes(userId)) {
            return res.status(400).json({ success: false, message: 'لقد تقدمت لهذه الوظيفة بالفعل' });
        }

        job.applicants.push(userId);
        await job.save();

        // ✅ إشعار لصاحب الوظيفة (اللي نشرها)
        if (job.postedBy.toString() !== userId.toString()) {
            const user = await User.findById(userId);
            await Notification.create({
                userId: job.postedBy,
                type: 'job',
                message: `${user.name} تقدم لوظيفة ${job.title}`,
                relatedId: jobId
            });
            console.log('📢 إشعار تقدم لوظيفة تم إنشاؤه');
        }

        res.json({ success: true, message: 'تم التقدم للوظيفة بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 🗑️ حذف وظيفة
exports.deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.session.user?._id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'الوظيفة غير موجودة' });
        }

        if (job.postedBy.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'ليس لديك صلاحية الحذف' });
        }

        await job.deleteOne();
        res.json({ success: true, message: 'تم حذف الوظيفة' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};