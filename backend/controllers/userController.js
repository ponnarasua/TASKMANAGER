const Task = require('../models/Task')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { getDomain, isPublicDomain } = require('../utils/emailUtils')

// @desc Get all users (Admin only)
// @route GET /api/users/
// @access Private (Admin)
async function getUsers (req, res) {
  try {
    const adminEmail = req.user.email
    const domain = getDomain(adminEmail)

    // Deny access if domain is public
    if (isPublicDomain(domain)) {
      return res.status(403).json({
        message: 'Access denied. Admins using public domains like Gmail cannot access users.'
      })
    }

    // Get only users with the same domain
    const users = await User.find({
      role: 'member',
      email: { $regex: `@${domain}$`, $options: 'i' }
    }).select('-password')

    // Add task count to each user
    const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
      const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Pending' })
      const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: 'In Progress' })
      const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Completed' })

      return {
        ...user._doc,
        pendingTasks,
        inProgressTasks,
        completedTasks
      }
    }))

    res.json(usersWithTaskCounts)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// // @desc Delete a user (Admin only)
// // @route DELETE /api/:id
// // @access Private (Admin)
// const deleteUser = async (req, res) => {
//     try {

//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

module.exports = { getUsers, getUserById }
