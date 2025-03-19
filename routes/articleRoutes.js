const express = require("express");
const { getAllArticles, addArticle, updateArticle, deleteArticle } = require("../controllers/articlesController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// جلب جميع المقالات متاح للجميع بدون تحقق من التوكن
router.get("/", getAllArticles);

// العمليات التالية تقتصر على الأدمن فقط:
const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.warn("🚫 وصول غير مسموح");
    return res.status(403).json({ error: "غير مسموح لك بالوصول إلى هذه العملية." });
  }
};

router.post("/", authMiddleware, adminCheck, addArticle);
router.put("/:id", authMiddleware, adminCheck, updateArticle);
router.delete("/:id", authMiddleware, adminCheck, deleteArticle);

module.exports = router;
