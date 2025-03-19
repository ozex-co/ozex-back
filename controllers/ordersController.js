const Order = require("../models/Order");
const multer = require("multer");

// 📂 إعداد `multer` لحفظ الملفات
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

// ✅ جلب جميع الطلبات (للمسؤول فقط)
exports.getAllOrders = async (req, res) => {
    console.log("🔍 محاولة جلب جميع الطلبات من قبل:", req.user?.role);
    try {
        if (!req.user || req.user.role !== "admin") {
            console.warn("🚫 رفض الوصول: المستخدم ليس مسؤول (Admin)");
            return res.status(403).json({ error: "غير مسموح لك بالوصول إلى هذه البيانات." });
        }

        const orders = await Order.findAll();
        console.log("✅ جميع الطلبات المسترجعة:", orders.length);
        res.json(orders);
    } catch (error) {
        console.error("❌ خطأ أثناء جلب جميع الطلبات:", error);
        res.status(500).json({ error: "حدث خطأ أثناء جلب الطلبات." });
    }
};

// ✅ جلب الطلبات الخاصة بالمستخدم المسجل فقط
exports.getUserOrders = async (req, res) => {
    console.log("🔍 جلب الطلبات للمستخدم:", req.user?.id || "غير مسجل");
    try {
        if (!req.user || !req.user.id) {
            console.warn("🚫 رفض الوصول: المستخدم غير مسجل");
            return res.status(401).json({ error: "يجب تسجيل الدخول لرؤية الطلبات." });
        }

        const orders = await Order.findAll({ where: { userId: req.user.id } });
        console.log("✅ الطلبات المسترجعة للمستخدم:", orders.length);
        res.json(orders);
    } catch (error) {
        console.error("❌ خطأ أثناء جلب الطلبات:", error);
        res.status(500).json({ error: "حدث خطأ أثناء جلب الطلبات." });
    }
};

// ✅ إرسال طلب جديد
exports.createOrder = async (req, res) => {
    console.log("📝 محاولة إنشاء طلب جديد:", req.body);
    try {
        const { name, email, phone, service, description, budget } = req.body;
        const file = req.file ? req.file.filename : null;

        if (!req.user || !req.user.id) {
            console.warn("🚫 رفض الوصول: المستخدم غير مسجل");
            return res.status(401).json({ error: "يجب تسجيل الدخول لإرسال طلب." });
        }

        if (!name || !email || !phone || !service || !description || !budget) {
            console.warn("⚠️ بيانات الطلب غير مكتملة.");
            return res.status(400).json({ error: "يجب ملء جميع الحقول المطلوبة." });
        }

        const order = await Order.create({
            userId: req.user.id,
            name,
            email,
            phone,
            service,
            description,
            budget,
            attachment: file,
            status: "pending",
        });

        console.log("✅ الطلب الجديد تم إنشاؤه:", order);
        res.status(201).json({ message: "تم إرسال الطلب بنجاح", order });
    } catch (error) {
        console.error("❌ خطأ أثناء إنشاء الطلب:", error);
        res.status(500).json({ error: "حدث خطأ أثناء إنشاء الطلب." });
    }
};

// ✅ تعديل طلب
exports.updateOrder = async (req, res) => {
    console.log("🔄 تعديل طلب ID:", req.params.id);
    try {
        const { id } = req.params;
        const { name, email, phone, service, status, description, budget } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            console.warn("⚠️ الطلب غير موجود:", id);
            return res.status(404).json({ error: "الطلب غير موجود." });
        }

        console.log("🔄 الطلب قبل التعديل:", order);
        order.name = name || order.name;
        order.email = email || order.email;
        order.phone = phone || order.phone;
        order.service = service || order.service;
        order.status = status || order.status;
        order.description = description || order.description;
        order.budget = budget || order.budget;

        await order.save();
        console.log("✅ الطلب بعد التعديل:", order);

        res.json({ message: "تم تحديث الطلب بنجاح", order });
    } catch (error) {
        console.error("❌ خطأ أثناء تعديل الطلب:", error);
        res.status(500).json({ error: "حدث خطأ أثناء تعديل الطلب." });
    }
};

// ✅ حذف طلب
exports.deleteOrder = async (req, res) => {
    console.log("🗑️ حذف طلب ID:", req.params.id);
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);
        if (!order) {
            console.warn("⚠️ الطلب غير موجود:", id);
            return res.status(404).json({ error: "الطلب غير موجود." });
        }

        await order.destroy();
        console.log("✅ تم حذف الطلب:", id);
        res.json({ message: "تم حذف الطلب بنجاح" });
    } catch (error) {
        console.error("❌ خطأ أثناء حذف الطلب:", error);
        res.status(500).json({ error: "حدث خطأ أثناء حذف الطلب." });
    }
};

exports.upload = upload;
