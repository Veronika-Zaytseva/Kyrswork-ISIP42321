const path = require('path');
const fs = require('fs');
const multer = require('multer');
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(ext,'').toLowerCase().replace(/[^a-z0-9а-яё_-]/gi,'-').replace(/-+/g,'-');
    cb(null, `${Date.now()}-${safeName}${ext}`);
  }
});
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/png','image/webp','image/jpg'];
  if (!allowed.includes(file.mimetype)) return cb(new Error('Разрешены только изображения JPG, PNG, WEBP.'));
  cb(null, true);
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });
