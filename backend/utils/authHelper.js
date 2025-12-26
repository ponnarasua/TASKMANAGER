/**
 * Authentication Helper Utilities
 * Centralized auth-related functions
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with _id and role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @param {number} rounds - Salt rounds (default: 10)
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, rounds = 10) => {
    const salt = await bcrypt.genSalt(rounds);
    return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if match
 */
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Extract token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return null;
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean} True if admin
 */
const isAdmin = (user) => {
    return user?.role === 'admin';
};

/**
 * Check if user is assigned to a task
 * @param {Object} task - Task object with assignedTo array
 * @param {string} userId - User ID to check
 * @returns {boolean} True if assigned
 */
const isAssignedToTask = (task, userId) => {
    if (!task?.assignedTo || !userId) return false;
    return task.assignedTo.some(
        (assignee) => assignee._id?.toString() === userId.toString() || assignee.toString() === userId.toString()
    );
};

/**
 * Check if user can access a task (is assigned or is admin)
 * @param {Object} task - Task object
 * @param {Object} user - User object
 * @returns {boolean} True if can access
 */
const canAccessTask = (task, user) => {
    if (isAdmin(user)) return true;
    return isAssignedToTask(task, user._id || user.id);
};

module.exports = {
    generateToken,
    hashPassword,
    comparePassword,
    verifyToken,
    extractToken,
    isAdmin,
    isAssignedToTask,
    canAccessTask,
};
