const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const {
  createPage,
  getAllPages,
  getPage,
  updatePage,
  deletePage
} = require("../controllers/pageController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// إنشاء مجلد التحميلات إذا لم يكن موجوداً
const uploadDir = path.join(__dirname, '../uploads/pages');
fs.mkdir(uploadDir, { recursive: true })
  .then(() => console.log(`📁 تم إنشاء مجلد التحميلات: ${uploadDir}`))
  .catch(err => console.error('❌ فشل إنشاء مجلد التحميلات:', err));

// إعداد Multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'page-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مسموح به. يسمح فقط بصور JPEG, PNG, GIF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// مسارات API
router.route("/")
  .get(getAllPages) // الحصول على جميع الصفحات
  .post(
    authMiddleware,
    adminMiddleware,
    upload.single('image'),
    createPage
  ); // إنشاء صفحة جديدة

router.route("/:id")
  .get(getPage) // الحصول على صفحة واحدة
  .put(
    authMiddleware,
    adminMiddleware,
    upload.single('image'),
    updatePage
  ) // تحديث الصفحة
  .delete(
    authMiddleware,
    adminMiddleware,
    deletePage
  ); // حذف الصفحة

module.exports = router;
