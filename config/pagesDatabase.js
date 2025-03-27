const { Sequelize } = require("sequelize");
const path = require("path");

// تحديد مسار ملف SQLite حسب البيئة
const storagePath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../data/pagesDatabase.sqlite') // مسار مطلق للإنتاج
  : path.join(__dirname, '../pagesDatabase.sqlite'); // مسار نسبي للتطوير

// إنشاء اتصال Sequelize
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: console.log, // تفعيل السجلات لأغراض التطوير
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: true
  }
});

// اختبار الاتصال
sequelize.authenticate()
  .then(() => console.log('✅ تم الاتصال بنجاح بقاعدة بيانات الصفحات'))
  .catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

module.exports = sequelize;
