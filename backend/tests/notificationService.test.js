// Basic unit test for notificationService
const { markAsReadService, markAllAsReadService, deleteNotificationService, clearAllNotificationsService } = require('../services/notificationService');
const Notification = require('../models/Notification');

describe('Notification Service', () => {
  it('should mark a notification as read', async () => {
    // Mock user and notification
    const user = { _id: 'user1' };
    const notificationId = 'notif1';
    Notification.findOneAndUpdate = jest.fn().mockResolvedValue({ _id: notificationId, isRead: true });
    const result = await markAsReadService(user, notificationId);
    expect(result.isRead).toBe(true);
  });

  it('should mark all notifications as read', async () => {
    const user = { _id: 'user1' };
    Notification.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 2 });
    const result = await markAllAsReadService(user);
    expect(result.modifiedCount).toBe(2);
  });

  it('should delete a notification', async () => {
    const user = { _id: 'user1' };
    const notificationId = 'notif1';
    Notification.findOneAndDelete = jest.fn().mockResolvedValue({ _id: notificationId });
    const result = await deleteNotificationService(user, notificationId);
    expect(result._id).toBe(notificationId);
  });

  it('should clear all notifications', async () => {
    const user = { _id: 'user1' };
    Notification.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 3 });
    const result = await clearAllNotificationsService(user);
    expect(result.deletedCount).toBe(3);
  });
});
