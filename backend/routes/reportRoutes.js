const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { 
    exportTasksReport, 
    exportUsersReport, 
    exportTasksPDF,
    exportTeamProductivity,
    exportTeamProductivityPDF
} = require("../controllers/reportController");

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport );
router.get("/export/tasks/pdf", protect, adminOnly, exportTasksPDF );
router.get("/export/users", protect, adminOnly, exportUsersReport );
router.get("/export/team-productivity", protect, adminOnly, exportTeamProductivity );
router.get("/export/team-productivity/pdf", protect, adminOnly, exportTeamProductivityPDF );

module.exports = router;