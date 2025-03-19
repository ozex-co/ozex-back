const express = require("express");
const { getUsers, addUser, updateUser, deleteUser } = require("../controllers/usersController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// جلب المستخدمين
router.get("/", authMiddleware, getUsers);

// إضافة مستخدم
router.post("/", authMiddleware, addUser);

// تعديل مستخدم
router.put("/:id", authMiddleware, updateUser);

// حذف مستخدم
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
