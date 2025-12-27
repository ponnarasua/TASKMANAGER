// Report Service Layer
const Task = require('../models/Task');
const User = require('../models/User');
const excelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { getOrgDomain, isPublicDomain, buildOrgEmailRegex } = require('../utils/domainHelper');

const exportTasksReportService = async (user) => {
    const domain = getOrgDomain(user.email);
    if (isPublicDomain(domain)) {
        throw new Error('Export not allowed for public domain admins.');
    }
    const emailRegex = buildOrgEmailRegex(domain);
    const tasks = await Task.find()
        .populate({
            path: 'assignedTo',
            select: 'name email',
            match: { email: emailRegex }
        });
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");
    worksheet.columns = [
        { header: "Task ID", key: "_id", width: 25 },
        { header: "Title", key: "title", width: 30 },
        { header: "Description", key: "description", width: 50 },
        { header: "Priority", key: "priority", width: 15 },
        { header: "Status", key: "status", width: 20 },
        { header: "Due Date", key: "dueDate", width: 20 },
        { header: "Assigned To", key: "assignedTo", width: 30 },
    ];
    tasks.forEach(task => {
        if (!task.assignedTo || task.assignedTo.length === 0) return;
        const assignedTo = Array.isArray(task.assignedTo)
            ? task.assignedTo.map(user => `${user.name} (${user.email})`).join(", ")
            : `${task.assignedTo.name} (${task.assignedTo.email})`;
        worksheet.addRow({
            _id: task._id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate?.toISOString().split('T')[0] || '',
            assignedTo: assignedTo || "Unassigned",
        });
    });
    return workbook;
};

module.exports = { exportTasksReportService };