const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter 
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']; // Add 'image/webp' if needed
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg and .png formats are allowed'));
  }
};

const upload = multer({storage, fileFilter});

module.exports = upload  ;