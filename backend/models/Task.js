const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../utils/constants');

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
});

// Comment Schema for task discussions
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Activity Log Schema to track all changes
const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['created', 'updated', 'status_changed', 'priority_changed', 'assigned', 'unassigned', 'comment_added', 'attachment_added', 'label_added', 'label_removed', 'checklist_updated']
    },
    details: {
        type: String
    },
    oldValue: {
        type: String
    },
    newValue: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    priority: {
        type: String,
        enum: Object.values(TASK_PRIORITY),
        default: TASK_PRIORITY.MEDIUM
    },
    status: {
        type: String,
        enum: Object.values(TASK_STATUS),
        default: TASK_STATUS.PENDING
    },
    dueDate: { type: Date, required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [String],
    todoChecklist: [todoSchema],
    progress: { type: Number, default: 0 },
    // New fields for comments and labels
    comments: [commentSchema],
    activityLog: [activityLogSchema],
    labels: [{
        type: String,
        trim: true
    }],
    // Due date reminder tracking
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSentAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ labels: 1 });
taskSchema.index({ reminderSent: 1, dueDate: 1 }); // Index for reminder queries

module.exports = mongoose.model('Task', taskSchema);
