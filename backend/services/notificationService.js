// Notification Service Layer
const Notification = require('../models/Notification');

const getNotificationsService = async (user, query) => {
    const { page = 1, limit = 20, unreadOnly = false } = query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const filter = { recipient: user._id };
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
        Notification.countDocuments({ recipient: user._id }),
        Notification.countDocuments({ recipient: user._id, isRead: false })
    ]);
    return {
        notifications,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            pages: Math.ceil(totalCount / limitNum)
        },
        unreadCount
    };
};

const markAsReadService = async (user, notificationId) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: user._id },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
    return notification;
};

const markAllAsReadService = async (user) => {
    const result = await Notification.updateMany(
        { recipient: user._id, isRead: false },
        { isRead: true, readAt: new Date() }
    );
    return result;
};

const deleteNotificationService = async (user, notificationId) => {
    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: user._id
    });
    return notification;
};

const clearAllNotificationsService = async (user) => {
    const result = await Notification.deleteMany({ recipient: user._id });
    return result;
};

module.exports = {
    getNotificationsService,
    markAsReadService,
    markAllAsReadService,
    deleteNotificationService,
    clearAllNotificationsService
};