// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// ➕ نشر وظيفة
router.post('/create', jobController.createJob);

// 📋 جلب كل الوظائف
router.get('/all', jobController.getAllJobs);

// 📋 جلب وظيفة واحدة
router.get('/:jobId', jobController.getJobById);

// 📝 التقدم لوظيفة
router.post('/apply/:jobId', jobController.applyToJob);

// 🗑️ حذف وظيفة
router.delete('/delete/:jobId', jobController.deleteJob);

module.exports = router;