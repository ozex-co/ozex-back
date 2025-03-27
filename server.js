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
const pagesRoutes = require("./routes/pagesRoutes");
const financeRoutes = require("./routes/finance");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

// إعدادات Express
app.use(helmet());
app.use(cors());
app.use(express.json());
app.set('trust proxy', process.env.TRUST_PROXY || false);
// تحديد حد الطلبات لمنع الهجمات

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  message: 'تم تجاوز الحد المسموح للطلبات',
  validate: { 
    trustProxy: false // ← تعطيل التحقق إذا كان trust proxy مفعلاً
  },
  keyGenerator: (req) => {
    // استخدام ال IP الحقيقي من header الـ X-Forwarded-For
    return req.headers['x-forwarded-for'] || req.ip;
  }
});

app.use(limiter);

// استخدام المسارات
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/pages", pagesRoutes);
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

const sequelize = require('./config/pagesDatabase');
const Page = require('./models/Page');

// مزامنة النماذج مع قاعدة البيانات
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بنجاح بقاعدة بيانات الصفحات');
    
    // إنشاء الجداول إذا لم تكن موجودة
    await sequelize.sync({ force: false }); // لا تستخدم force: true في الإنتاج
    console.log('✅ تم إنشاء الجداول بنجاح');
  } catch (error) {
    console.error('❌ فشل في تهيئة قاعدة البيانات:', error);
    process.exit(1); // إيقاف التطبيق إذا فشل الاتصال
  }
}

initializeDatabase();
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
