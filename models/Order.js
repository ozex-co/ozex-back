const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }, // 🔹 ربط الطلب بالمستخدم
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    service: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    budget: { type: DataTypes.STRING, allowNull: false },
    attachment: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("pending", "in-progress", "completed", "rejected"), defaultValue: "pending" },
});

module.exports = Order;
