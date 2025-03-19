const express = require("express");
const { getAllOrders, getUserOrders, createOrder, upload, updateOrder, deleteOrder } = require("../controllers/ordersController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ جلب جميع الطلبات (للمسؤول فقط)
router.get("/", authMiddleware, getAllOrders);

// ✅ جلب الطلبات الخاصة بالمستخدم المسجل فقط
router.get("/my-orders", authMiddleware, getUserOrders);

// ✅ إرسال طلب جديد مع رفع ملف
router.post("/", authMiddleware, upload.single("file"), createOrder);

// ✅ تعديل طلب
router.put("/:id", authMiddleware, updateOrder);

// ✅ حذف طلب
router.delete("/:id", authMiddleware, deleteOrder);

module.exports = router;
