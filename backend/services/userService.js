// User Service Layer
const Task = require('../models/Task');
const User = require('../models/User');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { USER_ROLES } = require('../utils/constants');

// Get all users for an org, with task counts (optimized)
async function getUsersService(adminUser) {
    const domain = getOrgDomain(adminUser.email);
    if (isPublicDomain(domain)) {
        throw new Error('Access denied. Admins using public domains like Gmail cannot access users.');
    }
    // Get users in org
    const users = await User.find({
        role: USER_ROLES.MEMBER,
        email: { $regex: `@${domain}$`, $options: 'i' }
    }).select('-password').lean();
    if (!users.length) return [];
    // Get all user IDs
    const userIds = users.map(u => u._id);
    // Aggregate task counts in one query per status
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const counts = await Task.aggregate([
        { $match: { assignedTo: { $in: userIds } } },
        { $group: {
            _id: { user: '$assignedTo', status: '$status' },
            count: { $sum: 1 }
        }}
    ]);
    // Build a lookup for counts
    const countMap = {};
    counts.forEach(({ _id, count }) => {
        const userId = Array.isArray(_id.user) ? _id.user[0] : _id.user;
        if (!countMap[userId]) countMap[userId] = {};
        countMap[userId][_id.status] = count;
    });
    // Attach counts to users
    return users.map(user => ({
        ...user,
        pendingTasks: countMap[user._id]?.['Pending'] || 0,
        inProgressTasks: countMap[user._id]?.['In Progress'] || 0,
        completedTasks: countMap[user._id]?.['Completed'] || 0
    }));
}

module.exports = { getUsersService };