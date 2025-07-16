const express = require('express');
const router = express.Router();
const upload = require('../middlewares/gridFsUpload'); // this multer-gridfs-storage config
const { uploadImage, viewImage } = require('../controllers/uploadController');

// POST route for uploading image
router.post('/', upload.single('file'), uploadImage);

// GET route for viewing image by filename
router.get('/view/:filename', viewImage);

module.exports = router;
