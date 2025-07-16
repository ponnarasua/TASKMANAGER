const express = require('express')
const router = require('./authRoutes')
const { adminOnly, protect } = require('../middlewares/authMiddleware')
const { getUsers, getUserById } = require('../controllers/userController')
const routes = express.Router()

router.get('/', protect, adminOnly, getUsers)
router.get('/:id', protect, getUserById)
// router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router
