// models/Page.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/pagesDatabase");

// تعريف نموذج الصفحة مع الحقول المطلوبة، وسيتولى Sequelize إنشاء createdAt و updatedAt تلقائيًا
const Page = sequelize.define("Page", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  vueComponentCode: { type: DataTypes.TEXT, allowNull: false },
  metaTags: { type: DataTypes.JSON, allowNull: true }, // لتخزين بيانات SEO بصيغة JSON
  imageUrl: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true // إنشاء createdAt و updatedAt تلقائيًا
});

module.exports = Page;
