const express = require('express');
const {protect , adminOnly } = require('../middlewares/authMiddleware');
const { validateTaskCreation, validateTaskUpdate } = require('../utils/validation');
const { 
    getDashboardData, 
    getUserDashboardData,
    getProductivityStats,
    getTeamProductivityStats,
    getTasks,
    searchTasks,
    getTaskById, 
    createTask, 
    updateTask, 
    deleteTask, 
    updateTaskStatus, 
    updateTaskChecklist,
    addComment,
    getComments,
    deleteComment,
    getActivityLog,
    addLabels,
    removeLabel,
    getAllLabels,
    triggerReminders,
    sendTaskReminder,
    duplicateTask
} = require('../controllers/taskController');

const router = express.Router();

// Task management Routes
router.get('/dashboard-data', protect, getDashboardData);
router.get('/user-dashboard-data', protect, getUserDashboardData);
router.get('/productivity-stats', protect, getProductivityStats); // User productivity stats
router.get('/team-productivity-stats', protect, adminOnly, getTeamProductivityStats); // Team productivity stats (Admin only)
router.get('/labels/all', protect, getAllLabels); // Get all unique labels - must be before /:id
router.get('/search', protect, searchTasks); // Search tasks - must be before /:id
router.post('/reminders/trigger', protect, adminOnly, triggerReminders); // Manual reminder trigger - must be before /:id
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.post('/', protect, adminOnly, validateTaskCreation, createTask);
router.put('/:id', protect, validateTaskUpdate, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);
router.put('/:id/status', protect, updateTaskStatus);
router.put('/:id/todo', protect, updateTaskChecklist);
router.post('/:id/duplicate', protect, adminOnly, duplicateTask); // Duplicate a task
router.post('/:id/send-reminder', protect, adminOnly, sendTaskReminder); // Send reminder for specific task

// Comment routes
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Activity log routes
router.get('/:id/activity', protect, getActivityLog);

// Label routes
router.post('/:id/labels', protect, adminOnly, addLabels);
router.delete('/:id/labels/:label', protect, adminOnly, removeLabel);

module.exports = router;