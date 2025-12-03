const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Import Cloudinary storage

const upload = multer({ storage: storage });

// Public Routes
router.get('/', postController.getAllPosts);
router.post('/', upload.single('image'), postController.createPost);
router.post('/:id/like', postController.likePost);

// Admin Routes (Protected would be better, but for now simple)
// In a real app, we'd add auth middleware here.
// We'll implement middleware in authRoutes logic but reuse it here if needed.
// For simplicity, I'll keep these open here but protected by the Frontend/Admin logic mostly? 
// No, that's insecure. I should add middleware.

const { verifyToken } = require('../controllers/authController'); // We'll make this next

router.get('/admin/all', verifyToken, postController.getAdminPosts);
router.delete('/:id', verifyToken, postController.deletePost);

module.exports = router;
