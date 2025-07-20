const multer = require('multer');
const storage = multer.memoryStorage(); // store in-memory
const upload = multer({ storage });
module.exports = upload;
