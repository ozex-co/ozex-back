require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./config/database");
const pagesDb = require('./config/pagesDatabase');
const Page = require('./models/Page');

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
  console.error('Error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// ==================== تهيئة قواعد البيانات ====================
async function initializeDatabases() {
  try {
    // قاعدة البيانات الرئيسية
    await db.authenticate();
    await db.sync();
    console.log('✅ Main database connected');

    // قاعدة بيانات الصفحات
    await pagesDb.authenticate();
    await pagesDb.sync();
    console.log('✅ Pages database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// ==================== بدء الخادم ====================
const PORT = process.env.PORT || 5000;

initializeDatabases().then(() => {
  app.listen(PORT, () => {
    console.log(`
    ==================================
     🚀 Server running on port ${PORT}
     📅 ${new Date().toLocaleString()}
     🌐 Environment: ${process.env.NODE_ENV || 'development'}
    ==================================
    `);
  });
});

// معالجة إغلاق التطبيق بشكل أنيق
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
});
