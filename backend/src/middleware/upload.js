import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `highlight-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /video\/(mp4|webm|quicktime)|application\/octet-stream/;
  if (allowed.test(file.mimetype) || file.originalname?.match(/\.(mp4|webm|mov)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, webm, mov) are allowed'), false);
  }
};

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});
