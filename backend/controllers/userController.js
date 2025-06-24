const Task = require('../models/Task');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc Get all users (Admin only)
// @route GET /api/users/
// @access Private (Admin)
async function getUsers(req, res) {
    try {
        const users = await User.find({ role: 'member' }).select("-password");
        // Add task count to each user
        const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: "Pending" });
            const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: "In Progress" });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "Completed" });

            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks
            };
        }));

        res.json(usersWithTaskCounts);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
    try {
        const user =  await User.findById(req.params.id).select("-password");
        if (!user)  return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// // @desc Delete a user (Admin only)
// // @route DELETE /api/:id
// // @access Private (Admin)
// const deleteUser = async (req, res) => {
//     try {

//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

module.exports = { getUsers, getUserById };