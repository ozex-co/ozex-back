const User = require("../models/User");

// جلب جميع المستخدمين
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        const usersWithoutPassword = users.map(user => {
            const userData = user.get(); // استرجاع بيانات المستخدم
            delete userData.password; // حذف كلمة المرور من البيانات المرسلة
            return userData;
        });
        res.json({ users: usersWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدمين." });
    }
};

// إضافة مستخدم جديد
exports.addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة." });
        }

        const user = await User.create({ name, email, password, role });
        res.status(201).json({ message: "تم إضافة المستخدم بنجاح.", user });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء إضافة المستخدم." });
        console.log(error);
    }
};

// تعديل مستخدم
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "المستخدم غير موجود." });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.password = password || user.password;
        user.role = role || user.role;

        await user.save();

        res.json({ message: "تم تعديل المستخدم بنجاح.", user });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء تعديل المستخدم." });
    }
};

// حذف مستخدم
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "المستخدم غير موجود." });
        }

        await user.destroy();

        res.json({ message: "تم حذف المستخدم بنجاح." });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء حذف المستخدم." });
    }
};
