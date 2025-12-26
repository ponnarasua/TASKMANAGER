const Notification = require('../models/Notification');
const { sendError, sendNotFound } = require('../utils/responseHelper');

// @desc   Get all notifications for the logged-in user
// @route  GET /api/notifications
// @access Private
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const filter = { recipient: req.user._id };
        if (unreadOnly === 'true') {
            filter.isRead = false;
        }

        const [notifications, totalCount, unreadCount] = await Promise.all([
            Notification.find(filter)
                .populate('sender', 'name profileImageUrl')
                .populate('task', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Notification.countDocuments({ recipient: req.user._id }),
            Notification.countDocuments({ recipient: req.user._id, isRead: false })
        ]);

        res.json({
            notifications,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                pages: Math.ceil(totalCount / limitNum)
            },
            unreadCount
        });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Get unread notification count
// @route  GET /api/notifications/unread-count
// @access Private
const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.json({ unreadCount });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Mark a notification as read
// @route  PUT /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return sendNotFound(res, 'Notification');
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Mark all notifications as read
// @route  PUT /api/notifications/read-all
// @access Private
const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({ 
            message: 'All notifications marked as read', 
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Delete a notification
// @route  DELETE /api/notifications/:id
// @access Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) {
            return sendNotFound(res, 'Notification');
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Clear all notifications
// @route  DELETE /api/notifications/clear-all
// @access Private
const clearAllNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({ recipient: req.user._id });

        res.json({ 
            message: 'All notifications cleared', 
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// Helper function to create a notification (used by other controllers)
const createNotification = async (data) => {
    try {
        const notification = new Notification(data);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification
};
