const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// Init gfs
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

exports.uploadImage = (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  console.log('✅ File uploaded:', {
    filename: file.filename,
    id: file.id,
    contentType: file.contentType
  });
  console.log("📥 Received upload request:", { fileName, mimetype: req.file?.mimetype });
  // Respond with file details or a downloadable/viewable URL
  res.status(200).json({
    message: 'Image uploaded successfully',
    fileId: file.id,
    fileName: file.filename,
    imageUrl: `/api/upload/view/${file.filename}` // Create this route if needed
  });
};

// Optional: View file by filename (e.g. used in imageUrl above)
exports.viewImage = (req, res) => {
  const { filename } = req.params;

  gfs.files.findOne({ filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if image
    if (
      file.contentType === 'image/jpeg' ||
      file.contentType === 'image/png' ||
      file.contentType === 'image/webp'
    ) {
      const readstream = gfs.createReadStream(file.filename);
      res.set('Content-Type', file.contentType);
      readstream.pipe(res);
    } else {
      res.status(400).json({ message: 'Not an image file' });
    }
  });
};
