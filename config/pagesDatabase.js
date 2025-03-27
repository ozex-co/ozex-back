// config/pagesDatabase.js
const { Sequelize } = require("sequelize");

// إعداد اتصال بقاعدة بيانات منفصلة للصفحات باستخدام SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./pagesDatabase.sqlite", // تأكد من صلاحية المسار
  logging: false, // لتعطيل السجلات في الكونسول
});

module.exports = sequelize;
