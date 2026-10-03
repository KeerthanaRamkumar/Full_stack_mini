import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Resolve uploads directories
const uploadDir = path.resolve(process.cwd(), 'server', 'uploads');
const profileUploadDir = path.resolve(process.cwd(), 'server', 'uploads', 'profileImages');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Also ensure root uploads directories exist for dev server static convenience
const rootUploadDir = path.resolve(process.cwd(), 'uploads');
const rootProfileUploadDir = path.resolve(process.cwd(), 'uploads', 'profileImages');

if (!fs.existsSync(rootUploadDir)) {
  fs.mkdirSync(rootUploadDir, { recursive: true });
}
if (!fs.existsSync(rootProfileUploadDir)) {
  fs.mkdirSync(rootProfileUploadDir, { recursive: true });
}

// Blog Cover Images Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const fileName = `${baseName}_${uniqueSuffix}${ext}`;

    setTimeout(() => {
      try {
        const srcPath = path.join(uploadDir, fileName);
        const destPath = path.join(rootUploadDir, fileName);
        if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (err) {
        console.error('Upload mirror error:', err);
      }
    }, 50);

    cb(null, fileName);
  },
});

// Profile Images Storage in server/uploads/profileImages/
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const fileName = `profile_${baseName}_${uniqueSuffix}${ext}`;

    setTimeout(() => {
      try {
        const srcPath = path.join(profileUploadDir, fileName);
        const destPath = path.join(rootProfileUploadDir, fileName);
        if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (err) {
        console.error('Profile upload mirror error:', err);
      }
    }, 50);

    cb(null, fileName);
  },
});

// File filter: accept image types only
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext) && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
