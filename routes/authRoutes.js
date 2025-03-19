const express = require("express");
const { check } = require("express-validator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post(
    "/register",
    [
        check("name", "الاسم مطلوب.").not().isEmpty(),
        check("email", "يرجى إدخال بريد إلكتروني صالح.").isEmail(),
        check("password", "كلمة المرور يجب أن تكون 6 أحرف على الأقل.").isLength({ min: 6 }),
    ],
    register
);

router.post(
    "/login",
    [
        check("email", "يرجى إدخال بريد إلكتروني صالح.").isEmail(),
        check("password", "كلمة المرور مطلوبة.").not().isEmpty(),
    ],
    login
);

module.exports = router;
