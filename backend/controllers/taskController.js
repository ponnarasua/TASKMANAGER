const Task = require('../models/Task');
const User = require('../models/User');
const { sendMentionNotification } = require('../utils/emailService');
const { triggerReminderCheck } = require('../utils/reminderScheduler');
const { createNotification } = require('./notificationController');
const { getOrgDomain, isPublicDomain, getFrontendUrl, buildTaskUrl } = require('../utils/domainHelper');
const { sendError, sendNotFound, sendForbidden, sendBadRequest } = require('../utils/responseHelper');
const { isAdmin } = require('../utils/authHelper');

// Helper function to add activity log
const addActivityLog = (task, userId, action, details = '', oldValue = '', newValue = '') => {
    task.activityLog.push({
        user: userId,
        action,
        details,
        oldValue,
        newValue
    });
};


// @desc   Get all tasks (Admin: all, User: only assigned tasks)
// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    let filter = {};
    if (status) filter.status = status;

    let tasks;
    let totalTasks;

    if (isAdmin(req.user)) {
      const domain = getOrgDomain(req.user.email);
      if (isPublicDomain(domain)) {
        return sendForbidden(res, 'Admin access restricted for public domains.');
      }

      // Get total count for pagination
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
        .lean(); // Use lean() for better performance

      tasks = tasks.filter(task => task.assignedTo); // remove non-org tasks
    } else {
      // Get total count for pagination
      totalTasks = await Task.countDocuments({ ...filter, assignedTo: req.user._id });

      tasks = await Task.find({ ...filter, assignedTo: req.user._id })
        .populate("assignedTo", "name email profileImageUrl")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(); // Use lean() for better performance
    }

    // Add completed checklist count
    tasks = tasks.map((task) => {
      const completedCount = task.todoChecklist?.filter(item => item.completed).length || 0;
      return { ...task, completedCount };
    });

    const filteredTasks = tasks; // after domain filtering

    const pendingTasks = filteredTasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;

    // Pagination metadata
    const totalPages = Math.ceil(totalTasks / limitNum);

    res.json({
      tasks: filteredTasks,
      statusSummary: {
        all: filteredTasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalTasks,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      }
    });

  } catch (error) {
    sendError(res, 'Server error', 500, error);
  }
};

// @desc   Get task by ID
// @route  GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name email profileImageUrl");

    if (!task) return sendNotFound(res, 'Task');

    console.log('Current User:', req.user);
    console.log('Task Assigned To:', task.assignedTo);

    if (isAdmin(req.user)) {
      const domain = getOrgDomain(req.user.email);
      if (
        isPublicDomain(domain) ||
        !task.assignedTo?.some(user => user.email.endsWith(`@${domain}`))
      ) {
        return sendForbidden(res, 'Unauthorized for this task');
      }
    } else if (!task.assignedTo.some(user => user._id.equals(req.user._id))) {
      return sendForbidden(res, 'Unauthorized');
    }

    res.json(task);
  } catch (error) {
    console.error('❌ Error in getTaskById:', error);
    sendError(res, 'Server error', 500, error);
  }
};


// @desc   Create a new task (Admin only)
// @route  POST /api/tasks/
// @access Private (Admin only)
const createTask = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return sendForbidden(res, 'Only admins can create tasks.');
    }

    const domain = getOrgDomain(req.user.email);
    if (isPublicDomain(domain)) {
      return sendForbidden(res, 'Admins from public domains cannot assign tasks.');
    }

    const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist, labels } = req.body;

    if (!Array.isArray(assignedTo)) {
      return sendBadRequest(res, 'assignedTo must be an array of user IDs');
    }

    const users = await require('../models/User').find({ _id: { $in: assignedTo } });

    // Check if all assigned users belong to the same domain
    const invalidUsers = users.filter(u => !u.email.endsWith(`@${domain}`));
    if (invalidUsers.length > 0) {
      return sendBadRequest(res, 'One or more users do not belong to your organization');
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      todoChecklist,
      attachments,
      labels: labels || []
    });

    // Add activity log for task creation
    addActivityLog(task, req.user._id, 'created', `Task "${title}" was created`);
    await task.save();

    // Create notifications for assigned users
    const assigner = await User.findById(req.user._id).select('name');
    for (const userId of assignedTo) {
        if (userId.toString() !== req.user._id.toString()) {
            createNotification({
                recipient: userId,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `${assigner.name} assigned you to "${title}"`,
                task: task._id,
                sender: req.user._id
            });
        }
    }

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    sendError(res, 'Server error', 500, error);
  }
};

// @desc   Update a task
// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return sendNotFound(res, 'Task');

        // Track changes for activity log
        const changes = [];
        
        if (req.body.title && req.body.title !== task.title) {
            changes.push({ field: 'title', old: task.title, new: req.body.title });
        }
        if (req.body.priority && req.body.priority !== task.priority) {
            addActivityLog(task, req.user._id, 'priority_changed', 'Priority was changed', task.priority, req.body.priority);
        }
        if (req.body.status && req.body.status !== task.status) {
            addActivityLog(task, req.user._id, 'status_changed', 'Status was changed', task.status, req.body.status);
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        // Handle labels update
        if (req.body.labels !== undefined) {
            task.labels = req.body.labels;
        }

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return sendBadRequest(res, 'assignedTo must be an array');
            }
            addActivityLog(task, req.user._id, 'assigned', 'Task assignment was updated');
            task.assignedTo = req.body.assignedTo;
        }

        if (changes.length > 0) {
            addActivityLog(task, req.user._id, 'updated', 'Task was updated');
        }

        const updatedTask = await task.save();
        res.json({ message: 'Task updated successfully', updatedTask });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Delete a task (Admin only)
// @route  DELETE /api/tasks/:id
// @access Private (Admin only)
const deleteTask = async (req, res) => {
    try{
        const task = await Task.findById(req.params.id);

        if (!task) return sendNotFound(res, 'Task');

        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });

    }catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Update task status
// @route  PUT /api/tasks/:id/status
// @access Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return sendNotFound(res, 'Task');

        const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

        if (!isAssigned && !isAdmin(req.user)) {
            return sendForbidden(res, 'You are not authorized to update this task');
        }

        const oldStatus = task.status;
        task.status = req.body.status || task.status;

        // Log status change
        if (oldStatus !== task.status) {
            addActivityLog(task, req.user._id, 'status_changed', 'Status was changed', oldStatus, task.status);
        }

        if (task.status === 'Completed') {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        const updatedTask = await task.save();

        res.json({ message: 'Task updated successfully', updatedTask });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};



// @desc   Update task checklist
// @route  PUT /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
    try{
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) return sendNotFound(res, 'Task');

        if(!task.assignedTo.includes(req.user._id) && !isAdmin(req.user)){
            return sendForbidden(res, 'You are not authorized to update this task');
        }   
        task.todoChecklist = todoChecklist ;

        // Auto-update progress based on checklist completion
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length;
        const totalItems = task.todoChecklist.length;
        task.progress = totalItems > 0 ? Math.round((completedCount/totalItems)*100):0 ; 

        // Auto-mark task as completed if all items are checked
        if(task.progress === 100){
            task.status = "Completed";
        }else if(task.progress > 0){
            task.status = "In Progress";
        }else{
            task.status = "Pending";
        }

        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )

        res.json({message : "Task checklist updated", task : updatedTask});
    }catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   dashboard data (Admin Only)
// @route  GET /api/tasks/dashboard-data
// @access Private (Admin only)
const getDashboardData = async (req, res) => {
  try {
    const domain = getOrgDomain(req.user.email);
    if (!isAdmin(req.user) || isPublicDomain(domain)) {
      return sendForbidden(res, 'Unauthorized to access dashboard data');
    }

    const tasks = await Task.find()
      .populate({
        path: 'assignedTo',
        select: 'email',
        match: { email: { $regex: `@${domain}$`, $options: 'i' } }
      });

    const filteredTasks = tasks.filter(t => t.assignedTo);

    const totalTasks = filteredTasks.length;
    const pendingTasks = filteredTasks.filter(t => t.status === 'Pending').length;
    const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;
    const overdueTasks = filteredTasks.filter(t =>
      t.status !== 'Completed' && t.dueDate && t.dueDate < new Date()).length;

    const taskStatuses = ['Pending', 'In Progress', 'Completed'];
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      acc[status.replace(/\s/g, '')] = filteredTasks.filter(t => t.status === status).length;
      return acc;
    }, { All: totalTasks });

    const taskPriorities = ['Low', 'Medium', 'High'];
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] = filteredTasks.filter(t => t.priority === priority).length;
      return acc;
    }, {});

    const recentTasks = filteredTasks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
      }));

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });

  } catch (error) {
    sendError(res, 'Server error', 500, error);
  }
};

// @desc   dashboard data (User-specific)
// @route  GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
    try{
        const userId = req.user._id;

        // Fetch statistics for user-specific tasks
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() },
        });

        // Task Distribution by status
        const taskStatuses = ['Pending', 'In Progress', 'Completed']; 
        const taskDistributionRaw = await Task.aggregate([
            { $match : { assignedTo : userId } },
            { $group : { _id : '$status', count : { $sum : 1 } } },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedkey = status.replace(/\s+/g, '');
            acc[formattedkey]= taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"]= totalTasks;

        // Task Distribution by Priority 
        const taskPriorities = ['Low', 'Medium', 'High'];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match : { assignedTo : userId } },
            { $group : { _id : '$priority', count : { $sum : 1 } } },
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority]= taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        //Fetch recently 10 tasks for the logged-in user 
        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts : {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    }catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Add a comment to a task
// @route  POST /api/tasks/:id/comments
// @access Private
const addComment = async (req, res) => {
    try {
        const { text, mentions = [] } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) return sendNotFound(res, 'Task');

        // Check authorization
        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));
        if (!isAssigned && !isAdmin(req.user)) {
            return sendForbidden(res, 'You are not authorized to comment on this task');
        }

        if (!text || text.trim() === '') {
            return sendBadRequest(res, 'Comment text is required');
        }

        const comment = {
            user: req.user._id,
            text: text.trim(),
            mentions: mentions // Array of user IDs
        };

        task.comments.push(comment);
        addActivityLog(task, req.user._id, 'comment_added', 'A comment was added');

        await task.save();

        // Send notification emails to mentioned users (async, don't wait)
        if (mentions.length > 0) {
            const mentionedUsers = await User.find({ _id: { $in: mentions } }).select('name email');
            const commenter = await User.findById(req.user._id).select('name');
            
            mentionedUsers.forEach(mentionedUser => {
                // Don't notify yourself
                if (mentionedUser._id.toString() !== req.user._id.toString()) {
                    // Create in-app notification
                    createNotification({
                        recipient: mentionedUser._id,
                        type: 'mention',
                        title: 'You were mentioned in a comment',
                        message: `${commenter.name} mentioned you in a comment on "${task.title}"`,
                        task: task._id,
                        sender: req.user._id
                    });

                    // Send email notification
                    sendMentionNotification(
                        mentionedUser.email,
                        mentionedUser.name,
                        commenter.name,
                        task.title,
                        text.trim(),
                        buildTaskUrl(task._id)
                    ).catch(err => console.error('Error sending mention notification:', err));
                }
            });
        }

        // Populate the user info for the response
        const updatedTask = await Task.findById(req.params.id)
            .populate('comments.user', 'name email profileImageUrl')
            .populate('comments.mentions', 'name email profileImageUrl')
            .populate('activityLog.user', 'name email profileImageUrl');

        res.status(201).json({ 
            message: 'Comment added successfully', 
            comments: updatedTask.comments 
        });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Get comments for a task
// @route  GET /api/tasks/:id/comments
// @access Private
const getComments = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('comments.user', 'name email profileImageUrl')
            .populate('comments.mentions', 'name email profileImageUrl');

        if (!task) return sendNotFound(res, 'Task');

        res.json({ comments: task.comments });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Delete a comment from a task
// @route  DELETE /api/tasks/:id/comments/:commentId
// @access Private
const deleteComment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return sendNotFound(res, 'Task');

        const comment = task.comments.id(req.params.commentId);

        if (!comment) return sendNotFound(res, 'Comment');

        // Only the comment author or admin can delete
        if (!comment.user.equals(req.user._id) && !isAdmin(req.user)) {
            return sendForbidden(res, 'You can only delete your own comments');
        }

        task.comments.pull(req.params.commentId);
        await task.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Get activity log for a task
// @route  GET /api/tasks/:id/activity
// @access Private
const getActivityLog = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('activityLog.user', 'name email profileImageUrl');

        if (!task) return sendNotFound(res, 'Task');

        res.json({ activityLog: task.activityLog });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Add labels to a task
// @route  POST /api/tasks/:id/labels
// @access Private (Admin only)
const addLabels = async (req, res) => {
    try {
        const { labels } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) return sendNotFound(res, 'Task');

        if (!Array.isArray(labels)) {
            return sendBadRequest(res, 'Labels must be an array');
        }

        // Add new labels without duplicates
        const newLabels = labels.filter(label => !task.labels.includes(label.trim()));
        task.labels.push(...newLabels.map(l => l.trim()));

        if (newLabels.length > 0) {
            addActivityLog(task, req.user._id, 'label_added', `Labels added: ${newLabels.join(', ')}`);
        }

        await task.save();

        res.json({ message: 'Labels added successfully', labels: task.labels });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Remove a label from a task
// @route  DELETE /api/tasks/:id/labels/:label
// @access Private (Admin only)
const removeLabel = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        const labelToRemove = decodeURIComponent(req.params.label);

        if (!task) return sendNotFound(res, 'Task');

        const labelIndex = task.labels.indexOf(labelToRemove);
        if (labelIndex === -1) {
            return sendNotFound(res, 'Label');
        }

        task.labels.splice(labelIndex, 1);
        addActivityLog(task, req.user._id, 'label_removed', `Label removed: ${labelToRemove}`);

        await task.save();

        res.json({ message: 'Label removed successfully', labels: task.labels });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Get all unique labels used in tasks
// @route  GET /api/tasks/labels/all
// @access Private
const getAllLabels = async (req, res) => {
    try {
        const labels = await Task.distinct('labels');
        res.json({ labels: labels.filter(l => l) }); // Filter out null/empty
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Manually trigger due date reminder check (Admin only)
// @route  POST /api/tasks/reminders/trigger
// @access Private (Admin)
const triggerReminders = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return sendForbidden(res, 'Access denied. Admin only.');
        }

        const result = await triggerReminderCheck();
        res.json({
            message: 'Reminder check triggered successfully',
            result
        });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc   Send reminder for a specific task
// @route  POST /api/tasks/:id/send-reminder
// @access Private (Admin)
const sendTaskReminder = async (req, res) => {
    try {
        if (!isAdmin(req.user)) {
            return sendForbidden(res, 'Access denied. Admin only.');
        }

        const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
        
        if (!task) {
            return sendNotFound(res, 'Task');
        }

        if (task.status === 'Completed') {
            return sendBadRequest(res, 'Cannot send reminder for completed task');
        }

        const { sendDueDateReminder } = require('../utils/emailService');
        const Notification = require('../models/Notification');
        
        let sentCount = 0;
        const taskUrl = buildTaskUrl(task._id);

        for (const user of task.assignedTo) {
            if (!user.email) continue;

            try {
                // Create in-app notification
                await Notification.create({
                    recipient: user._id,
                    type: 'reminder',
                    title: 'Task Reminder',
                    message: `Reminder: "${task.title}" needs your attention!`,
                    task: task._id,
                    sender: req.user._id
                });

                // Send email
                await sendDueDateReminder(
                    user.email,
                    user.name,
                    task.title,
                    task.dueDate,
                    task.priority,
                    taskUrl
                );
                sentCount++;
            } catch (error) {
                console.error(`Failed to send reminder to ${user.email}:`, error.message);
            }
        }

        res.json({
            message: `Reminder sent to ${sentCount} user(s)`,
            sentCount
        });
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
    addComment,
    getComments,
    deleteComment,
    getActivityLog,
    addLabels,
    removeLabel,
    getAllLabels,
    triggerReminders,
    sendTaskReminder,
};