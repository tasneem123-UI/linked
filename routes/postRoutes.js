const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../config/multer');

// ✅ إنشاء منشور مع إمكانية رفع صورة
router.post('/create', upload.single('image'), postController.createPost);

router.get('/all', postController.getAllPosts);
router.put('/like/:postId', postController.likePost);
router.post('/comment/:postId', postController.addComment);
router.delete('/delete/:postId', postController.deletePost);

module.exports = router;