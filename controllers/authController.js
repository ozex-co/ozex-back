const User = require("../models/User");
const bcrypt = require("bcryptjs"); // بدلاً من bcrypt العادي
const jwt = require("jsonwebtoken");

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // تعيين دور المستخدم
        const role = email === "admin@ozex.site" ? "admin" : "user";

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم في قاعدة البيانات
        const user = await User.create({ name, email, password: hashedPassword, role });

        res.status(201).json({ message: "تم التسجيل بنجاح", user });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء التسجيل" });
    }
};

// تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: "البريد الإلكتروني غير صحيح" });

        // التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "كلمة المرور غير صحيحة" });

        // إنشاء التوكن
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });


        res.json({ message: "تم تسجيل الدخول بنجاح", token, role: user.role , name:user.name , email:user.email});
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
};
