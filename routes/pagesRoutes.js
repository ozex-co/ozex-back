// routes/pagesRoutes.js
const express = require("express");
const multer = require("multer");
const { createPage, getPage, updatePage, deletePage } = require("../controllers/pageController");
const authMiddleware = require("../middlewares/authMiddleware"); // تأكد من وجود هذا الملف لحماية المسارات

const router = express.Router();

// إعداد Multer لرفع الصور إلى مجلد uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 يتم حفظ الملف في: uploads/");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    console.log("📄 اسم الملف الذي يتم حفظه:", filename);
    cb(null, filename);
  },
});
const upload = multer({ storage });

// إنشاء صفحة جديدة (يُفضل تقييد هذا المسار للمشرفين)
router.post("/", authMiddleware, upload.single("image"), createPage);

// جلب صفحة بالتفاصيل بناءً على الـ id
router.get("/:id", getPage);

// تحديث صفحة موجودة
router.put("/:id", authMiddleware, upload.single("image"), updatePage);

// حذف صفحة
router.delete("/:id", authMiddleware, deletePage);

module.exports = router;
