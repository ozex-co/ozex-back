const { Sequelize } = require("sequelize");
const path = require("path");

const storagePath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../pagesDatabase.sqlite') // مسار مطلق للإنتاج
  : './pagesDatabase.sqlite'; // مسار نسبي للتطوير

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false,
  define: {
    freezeTableName: true // تجنب التسمية التلقائية للجداول
  }
});

module.exports = sequelize;
