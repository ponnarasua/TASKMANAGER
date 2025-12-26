const Task = require('../models/Task');
const User = require('../models/User');
const { getOrgDomain, isPublicDomain } = require('../utils/domainHelper');
const { sendError, sendNotFound, sendForbidden } = require('../utils/responseHelper');
const { isAdmin } = require('../utils/authHelper');

// @desc Get all users (Admin only)
// @route GET /api/users/
// @access Private (Admin)
async function getUsers(req, res) {
    try {
        const adminEmail = req.user.email;
        const domain = getOrgDomain(adminEmail);

        // Deny access if domain is public
        if (isPublicDomain(domain)) {
            return sendForbidden(res, 'Access denied. Admins using public domains like Gmail cannot access users.');
        }

        // Get only users with the same domain
        const users = await User.find({
            role: 'member',
            email: { $regex: `@${domain}$`, $options: 'i' }
        }).select("-password");

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
        sendError(res, 'Server error', 500, error);
    }
}

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
    try {
        const user =  await User.findById(req.params.id).select("-password");
        if (!user)  return sendNotFound(res, 'User');
        res.json(user);
    } catch (error) {
        sendError(res, 'Server error', 500, error);
    }
};

// @desc Update user profile (own profile)
// @route PUT /api/users/:id
// @access Private
const updateUser = async (req, res) => {
    try {
        const { name, profileImageUrl } = req.body;
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return sendNotFound(res, 'User');
        }

        // Only allow users to update their own profile (or admins can update any)
        if (req.user._id.toString() !== userId && !isAdmin(req.user)) {
            return sendForbidden(res, 'Not authorized to update this profile');
        }

        // Update fields if provided
        if (name) user.name = name;
        if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(userId).select("-password");
        res.json({ message: "Profile updated successfully", user: updatedUser });

    } catch (error) {
        console.error('Update user error:', error);
        sendError(res, 'Server error', 500, error);
    }
};

// @desc Search users for @mentions
// @route GET /api/users/search
// @access Private
const searchUsers = async (req, res) => {
    try {
        const { q, taskId } = req.query;
        const searchTerm = q?.trim() || '';

        const userEmail = req.user.email;
        const domain = getOrgDomain(userEmail);

        // Build search query
        let searchFilter = {
            _id: { $ne: req.user._id }, // Exclude current user
        };

        // For non-public domains, restrict to same domain
        if (!isPublicDomain(domain)) {
            searchFilter.email = { $regex: `@${domain}$`, $options: 'i' };
        }

        // Add name search if query provided
        if (searchTerm) {
            searchFilter.name = { $regex: searchTerm, $options: 'i' };
        }

        // If taskId provided, prioritize users assigned to that task
        let users = [];
        if (taskId) {
            const Task = require('../models/Task');
            const task = await Task.findById(taskId).populate('assignedTo', 'name email profileImageUrl');
            
            if (task && task.assignedTo) {
                // Get assigned users that match the search
                const assignedUsers = task.assignedTo.filter(u => 
                    u._id.toString() !== req.user._id.toString() &&
                    (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );

                // Get other users
                const otherUsers = await User.find({
                    ...searchFilter,
                    _id: { $nin: [...task.assignedTo.map(u => u._id), req.user._id] }
                })
                .select('name email profileImageUrl')
                .limit(10 - assignedUsers.length);

                users = [...assignedUsers, ...otherUsers];
            }
        } else {
            users = await User.find(searchFilter)
                .select('name email profileImageUrl')
                .limit(10);
        }

        res.json(users);

    } catch (error) {
        console.error('Search users error:', error);
        sendError(res, 'Server error', 500, error);
    }
};

module.exports = { getUsers, getUserById, updateUser, searchUsers };