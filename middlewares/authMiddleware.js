const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    console.log("🔍 فحص المصادقة");
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        console.warn("⚠️ لا يوجد توكن");
        return res.status(401).json({ error: "لا يوجد توكن، الوصول غير مصرح به." });
    }

    try {
        const token = authHeader.split(" ")[1];
        if (!token) {
            console.warn("⚠️ توكن غير صالح");
            return res.status(401).json({ error: "توكن غير صالح." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        console.log("✅ المستخدم المصادق عليه:", decoded);

        next();
    } catch (error) {
        console.error("❌ فشل المصادقة:", error.message);
        return res.status(401).json({ error: "توكن غير صالح أو انتهت صلاحيته." });
    }
};

// ✅ دمج التحقق من الأدمن في نفس الملف
module.exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        console.warn("🚫 محاولة وصول غير مصرح بها من:", req.user);
        return res.status(403).json({ error: "🚫 الوصول غير مصرح به، هذه العملية تتطلب صلاحيات الأدمن." });
    }
    next();
};
