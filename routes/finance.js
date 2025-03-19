const express = require("express");
const router = express.Router();
const { getOverview, getMonthly, getDaily, addTransaction, getTransactions, updateTransaction, deleteTransaction } = require("../controllers/financeController");
const authMiddleware = require("../middlewares/authMiddleware");
const { getLogs } = require("../controllers/financeController");

// ✅ حماية جميع العمليات المالية بالتوكن والأدمن
router.use(authMiddleware);
router.use(authMiddleware.isAdmin);

// ✅ Endpoint لجلب النظرة العامة
router.get("/overview", getOverview);

// ✅ Endpoint للتحليل الشهري
router.get("/monthly", getMonthly);

// ✅ Endpoint للتحليل اليومي
router.get("/daily", getDaily);

// ✅ Endpoint لجلب كل المعاملات الماليه
router.get("/transactions", getTransactions);

// ✅ Endpoint لإضافة معاملة مالية جديدة
router.post("/transactions", addTransaction);

// ✅ Endpoint لتحديث معاملة مالية موجودة
router.put("/transactions/:id", updateTransaction);

// ✅ Endpoint لحذف معاملة مالية
router.delete("/transactions/:id", deleteTransaction);

// ✅ Endpoint الحصول علي السجل
router.get("/logs", getLogs);

// إضافة معالج لأخطاء 404 في نهاية الراوتر
router.use((req, res) => {
    res.status(404).json({ 
      error: 'مسار غير موجود',
      endpoints_available: [
        'GET    /overview',
        'GET    /monthly',
        'GET    /daily',
        'POST   /transactions',
        'PUT    /transactions/:id',
        'DELETE /transactions/:id',
        'GET    /logs'
      ]
    });
  });

module.exports = router;
