const mongoose = require('mongoose');

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
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
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

module.exports = mongoose.model('Task', taskSchema);
