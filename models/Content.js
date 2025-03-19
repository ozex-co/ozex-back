const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Content = sequelize.define("Content", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Content;
