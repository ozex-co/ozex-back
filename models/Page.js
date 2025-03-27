const { DataTypes } = require("sequelize");
const sequelize = require("../config/pagesDatabase");

const Page = sequelize.define("Page", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  vueComponentCode: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  metaTags: { 
    type: DataTypes.JSON,
    defaultValue: {} 
  },
  imageUrl: DataTypes.STRING
}, {
  tableName: 'Pages', // تحديد اسم الجدول بشكل صريح
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Page;
