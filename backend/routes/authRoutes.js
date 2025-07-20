const express = require('express')
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { $where } = require('../models/User');
const upload = require('../middlewares/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Convert buffer to base64 string
    const base64Str = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Str, {
      folder: 'your_folder_name', // optional: categorize uploads
      resource_type: 'image',
    });

    // Respond with secure URL
    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Cloudinary upload failed' });
  }
});

module.exports = router;