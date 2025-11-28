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

module.exports = mongoose.model('Task', taskSchema);
