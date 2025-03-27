// routes/pagesRoutes.js
const express = require("express");
const multer = require("multer");
const {
  createPage,
  getPage,
  getAllPages,
  updatePage,
  deletePage,
} = require("../controllers/pageController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// إعداد Multer مع طباعـات مفصلة
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 يتم حفظ الملف في: uploads/");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log("📄 تم استقبال ملف:", file.originalname);
    console.log("🔖 سيتم حفظه باسم:", filename);
    cb(null, filename);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// مسارات الصفحات مع تفاصيل الطباعـات
router.post("/", authMiddleware, upload.single("image"), (req, res, next) => {
  console.log(`📥 طلب إنشاء صفحة جديدة من المستخدم `);
  console.log("🔐 صلاحيات المستخدم:");
  createPage(req, res, next);
});

router.get("/",  (req, res, next) => {
  console.log(`📥 طلب جلب جميع الصفحات من المستخدم `);
  console.log("🔐 صلاحيات المستخدم:");
  getAllPages(req, res, next);
});

router.get("/:id", (req, res, next) => {
  console.log(`📥 طلب جلب صفحة بالمعرف: `);
  console.log("🌐 IP الطالب:", req.ip);
  getPage(req, res, next);
});

router.put("/:id", authMiddleware, upload.single("image"), (req, res, next) => {
  console.log(`📥 طلب تحديث صفحة (ID: ) من المستخدم `);
  console.log("🔐 صلاحيات المستخدم:");
  updatePage(req, res, next);
});

router.delete("/:id", authMiddleware, (req, res, next) => {
  console.log(`📥 طلب حذف صفحة (ID: ) من المستخدم `);
  console.log("🔐 صلاحيات المستخدم:");
  deletePage(req, res, next);
});

module.exports = router;
