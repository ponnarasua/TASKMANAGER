const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} = require('../controllers/notificationController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

// Mark as read
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// Delete notifications
router.delete('/clear-all', clearAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
