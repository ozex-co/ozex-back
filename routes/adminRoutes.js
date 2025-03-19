const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware"); // تأكد أن لديك ميدل وير للتحقق من التوكن

// API لجلب بيانات لوحة التحكم
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // افتراضياً، البيانات ستكون إحصائيات من قاعدة البيانات
    const stats = {
      users: 100, // لاحقًا نجلبهم من الـ DB
      orders: 50,
      services: 20,
    };

    res.json(stats);
  } catch (error) {
    console.error("خطأ في جلب بيانات لوحة التحكم:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب البيانات" });
  }
});

module.exports = router;
