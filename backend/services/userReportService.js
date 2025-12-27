// User Report Service Layer
const Task = require('../models/Task');
const User = require('../models/User');
const excelJS = require('exceljs');
const { getOrgDomain, isPublicDomain, buildOrgEmailRegex } = require('../utils/domainHelper');

const exportUsersReportService = async (user) => {
    const domain = getOrgDomain(user.email);
    if (isPublicDomain(domain)) {
        throw new Error('Export not allowed for public domain admins.');
    }
    const emailRegex = buildOrgEmailRegex(domain);
    const users = await User.find({ email: emailRegex }).select("name email _id").lean();
    const userIds = users.map(user => user._id.toString());
    const userTasks = await Task.find()
        .populate({
            path: 'assignedTo',
            select: 'name email _id',
            match: { email: emailRegex }
        });
    const userTaskMap = {};
    users.forEach(user => {
        userTaskMap[user._id] = {
            name: user.name,
            email: user.email,
            taskCount: 0,
            pendingTasks: 0,
            inProgressTasks: 0,
            completedTasks: 0,
        };
    });
    userTasks.forEach(task => {
        if (!Array.isArray(task.assignedTo)) return;
        task.assignedTo.forEach(assignedUser => {
            if (userTaskMap[assignedUser._id]) {
                userTaskMap[assignedUser._id].taskCount++;
                if (task.status === "Pending") userTaskMap[assignedUser._id].pendingTasks++;
                else if (task.status === "In Progress") userTaskMap[assignedUser._id].inProgressTasks++;
                else if (task.status === "Completed") userTaskMap[assignedUser._id].completedTasks++;
            }
        });
    });
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Task Report");
    worksheet.columns = [
        { header: "User Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 40 },
        { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
        { header: "Pending Tasks", key: "pendingTasks", width: 20 },
        { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
        { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];
    Object.values(userTaskMap).forEach(user => {
        worksheet.addRow(user);
    });
    return workbook;
};

module.exports = { exportUsersReportService };