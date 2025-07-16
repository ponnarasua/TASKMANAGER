const Task = require('../models/Task')
const PUBLIC_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com']
const getOrgDomain = (email) => email.split('@')[1]

// @desc   Get all tasks (Admin: all, User: only assigned tasks)
// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status) filter.status = status

    let tasks

    if (req.user.role === 'admin') {
      const domain = getOrgDomain(req.user.email)
      if (PUBLIC_DOMAINS.includes(domain)) {
        return res.status(403).json({ message: 'Admin access restricted for public domains.' })
      }

      tasks = await Task.find(filter)
        .populate({
          path: 'assignedTo',
          select: 'name email profileImageUrl',
          match: { email: { $regex: `@${domain}$`, $options: 'i' } }
        })

      tasks = tasks.filter(task => task.assignedTo) // remove non-org tasks
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id })
        .populate('assignedTo', 'name email profileImageUrl')
    }

    // Add completed checklist count
    tasks = await Promise.all(tasks.map(async (task) => {
      const completedCount = task.todoChecklist.filter(item => item.completed).length
      return { ...task._doc, completedCount }
    }))

    const filteredTasks = tasks // after domain filtering

    const pendingTasks = filteredTasks.filter(t => t.status === 'Pending').length
    const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress').length
    const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length

    res.json({
      tasks: filteredTasks,
      statusSummary: {
        all: filteredTasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Get task by ID
// @route  GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email profileImageUrl')
    if (!task) return res.status(404).json({ message: 'Task not found' })

    if (req.user.role === 'admin') {
      const domain = getOrgDomain(req.user.email)
      if (PUBLIC_DOMAINS.includes(domain) || !task.assignedTo?.email.endsWith(`@${domain}`)) {
        return res.status(403).json({ message: 'Unauthorized for this task' })
      }
    } else if (!task.assignedTo.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Create a new task (Admin only)
// @route  POST /api/tasks/
// @access Private (Admin only)
const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks.' })
    }

    const domain = getOrgDomain(req.user.email)
    if (PUBLIC_DOMAINS.includes(domain)) {
      return res.status(403).json({ message: 'Admins from public domains cannot assign tasks.' })
    }

    const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = req.body

    if (!Array.isArray(assignedTo)) {
      return res.status(400).json({ message: 'assignedTo must be an array of user IDs' })
    }

    const users = await require('../models/User').find({ _id: { $in: assignedTo } })

    // Check if all assigned users belong to the same domain
    const invalidUsers = users.filter(u => !u.email.endsWith(`@${domain}`))
    if (invalidUsers.length > 0) {
      return res.status(400).json({ message: 'One or more users do not belong to your organization' })
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      todoChecklist,
      attachments
    })

    res.status(201).json({ message: 'Task created successfully', task })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Update a task
// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) return res.status(404).json({ message: 'Task not Found' })

    task.title = req.body.title || task.title
    task.description = req.body.description || task.description
    task.priority = req.body.priority || task.priority
    task.dueDate = req.body.dueDate || task.dueDate
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist
    task.attachments = req.body.attachments || task.attachments

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res.status(400).json({ message: 'assignedTo must be an array' })
      }
      task.assignedTo = req.body.assignedTo
    }

    const updatedTask = await task.save()
    res.json({ message: 'Task updated successfully', updatedTask })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Delete a task (Admin only)
// @route  DELETE /api/tasks/:id
// @access Private (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) return res.status(404).json({ message: 'Task not Found' })

    await task.deleteOne()
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Update task status
// @route  PUT /api/tasks/:id/status
// @access Private
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not Found' })

    const isAssigned = task.assignedTo?.toString() === req.user._id.toString()

    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this task' })
    }

    task.status = req.body.status || task.status

    if (task.status === 'Completed') {
      task.todoChecklist.forEach((item) => (item.completed = true))
      task.progress = 100
    }

    const updatedTask = await task.save()

    res.json({ message: 'Task updated successfully', updatedTask })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   Update task checklist
// @route  PUT /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body
    const task = await Task.findById(req.params.id)

    if (!task) return res.status(404).json({ message: 'Task not Found' })

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this task' })
    }
    task.todoChecklist = todoChecklist

    // Auto-update progress based on checklist completion
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length
    const totalItems = task.todoChecklist.length
    task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

    // Auto-mark task as completed if all items are checked
    if (task.progress === 100) {
      task.status = 'Completed'
    } else if (task.progress > 0) {
      task.status = 'In Progress'
    } else {
      task.status = 'Pending'
    }

    await task.save()
    const updatedTask = await Task.findById(req.params.id).populate(
      'assignedTo',
      'name email profileImageUrl'
    )

    res.json({ message: 'Task checklist updated', task: updatedTask })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   dashboard data (Admin Only)
// @route  GET /api/tasks/dashboard-data
// @access Private (Admin only)
const getDashboardData = async (req, res) => {
  try {
    const domain = getOrgDomain(req.user.email)
    if (req.user.role !== 'admin' || PUBLIC_DOMAINS.includes(domain)) {
      return res.status(403).json({ message: 'Unauthorized to access dashboard data' })
    }

    const tasks = await Task.find()
      .populate({
        path: 'assignedTo',
        select: 'email',
        match: { email: { $regex: `@${domain}$`, $options: 'i' } }
      })

    const filteredTasks = tasks.filter(t => t.assignedTo)

    const totalTasks = filteredTasks.length
    const pendingTasks = filteredTasks.filter(t => t.status === 'Pending').length
    const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length
    const overdueTasks = filteredTasks.filter(t =>
      t.status !== 'Completed' && t.dueDate && t.dueDate < new Date()).length

    const taskStatuses = ['Pending', 'In Progress', 'Completed']
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      acc[status.replace(/\s/g, '')] = filteredTasks.filter(t => t.status === status).length
      return acc
    }, { All: totalTasks })

    const taskPriorities = ['Low', 'Medium', 'High']
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] = filteredTasks.filter(t => t.priority === priority).length
      return acc
    }, {})

    const recentTasks = filteredTasks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        createdAt: t.createdAt
      }))

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks
      },
      charts: {
        taskDistribution,
        taskPriorityLevels
      },
      recentTasks
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc   dashboard data (User-specific)
// @route  GET /api/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id

    // Fetch statistics for user-specific tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId })
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'Pending' })
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' })
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() }
    })

    // Task Distribution by status
    const taskStatuses = ['Pending', 'In Progress', 'Completed']
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedkey = status.replace(/\s+/g, '')
      acc[formattedkey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0
      return acc
    }, {})
    taskDistribution.All = totalTasks

    // Task Distribution by Priority
    const taskPriorities = ['Low', 'Medium', 'High']
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0
      return acc
    }, {})

    // Fetch recently 10 tasks for the logged-in user
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status priority dueDate createdAt')

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks
      },
      charts: {
        taskDistribution,
        taskPriorityLevels
      },
      recentTasks
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData
}
