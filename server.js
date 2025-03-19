require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./config/database");

// استيراد المسارات
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/usersRoutes");
const orderRoutes = require("./routes/ordersRoutes"); 
const serviceRoutes = require("./routes/servicesRoutes");
const articlesRoutes = require("./routes/articleRoutes");
const financeRoutes = require("./routes/finance");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

// إعدادات Express
app.use(helmet());
app.use(cors());
app.use(express.json());

// تحديد حد الطلبات لمنع الهجمات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 1000, // 100 طلب لكل IP
});
app.use(limiter);

// استخدام المسارات
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/admin", adminRoutes); // الآن لوحة التحكم لها API مخصص
app.get("/",(req,res) =>{
  res.send("server working")
})
// Middleware لمعالجة الأخطاء العامة
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);

    try {
        await db.sync(); // مزامنة قاعدة البيانات الرئيسية
        console.log("📦 Main Database synced successfully!");

    } catch (error) {
        console.error("❌ Database sync failed:", error);
    }
});
