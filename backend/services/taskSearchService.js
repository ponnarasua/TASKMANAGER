// Search tasks service
const Task = require('../models/Task');
const User = require('../models/User');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { isAdmin } = require('../utils/authHelper');

const searchTasksService = async (user, query) => {
    const {
        q = '',
        status,
        priority,
        assignee,
        dueDateFrom,
        dueDateTo,
        page = 1,
        limit = 20
    } = query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    let filter = {};
    if (q && q.trim()) {
        const searchRegex = new RegExp(q.trim(), 'i');
        filter.$or = [
            { title: searchRegex },
            { description: searchRegex }
        ];
    }
    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
        filter.status = status;
    }
    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
        filter.priority = priority;
    }
    if (dueDateFrom || dueDateTo) {
        filter.dueDate = {};
        if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
        if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
    }
    if (assignee) {
        filter.assignedTo = assignee;
    }
    let tasks, totalTasks;
    if (isAdmin(user)) {
        const domain = getOrgDomain(user.email);
        if (isPublicDomain(domain)) {
            throw new Error('Admin access restricted for public domains.');
        }
        totalTasks = await Task.countDocuments(filter);
        tasks = await Task.find(filter)
            .populate({
                path: 'assignedTo',
                select: 'name email profileImageUrl',
                match: { email: { $regex: `@${domain}$`, $options: 'i' } },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();
        tasks = tasks.filter(task => task.assignedTo);
    } else {
        totalTasks = await Task.countDocuments({ ...filter, assignedTo: user._id });
        tasks = await Task.find({ ...filter, assignedTo: user._id })
            .populate('assignedTo', 'name email profileImageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();
    }
    return { tasks, totalTasks };
};

module.exports = { searchTasksService };