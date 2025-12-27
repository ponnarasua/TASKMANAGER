// Task Service Layer
// Handles business logic for tasks
const Task = require('../models/Task');
const User = require('../models/User');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { isAdmin } = require('../utils/authHelper');

const getTasksService = async (user, query) => {
  const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  let filter = {};
  if (status) filter.status = status;
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
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();
    tasks = tasks.filter(task => task.assignedTo);
  } else {
    totalTasks = await Task.countDocuments({ ...filter, assignedTo: user._id });
    tasks = await Task.find({ ...filter, assignedTo: user._id })
      .populate('assignedTo', 'name email profileImageUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();
  }
  tasks = tasks.map((task) => {
    const completedCount = task.todoChecklist?.filter(item => item.completed).length || 0;
    return { ...task, completedCount };
  });
  return { tasks, totalTasks };
};

module.exports = { getTasksService };