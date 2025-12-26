const express = require('express');
const router = require('./authRoutes');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, updateUser, searchUsers } = require("../controllers/userController");
const routes = express.Router();

// Search users for @mentions (must be before /:id route)
router.get('/search', protect, searchUsers);

router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
// router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;