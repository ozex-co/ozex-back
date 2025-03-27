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
      notEmpty: {
        msg: "عنوان الصفحة مطلوب"
      },
      len: {
        args: [3, 100],
        msg: "يجب أن يكون العنوان بين 3 و100 حرف"
      }
    }
  },
  vue_component_code: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "كود المكون مطلوب"
      }
    }
  },
  meta_tags: {
    type: DataTypes.JSON,
    defaultValue: {},
    validate: {
      isValidMetaTags(value) {
        try {
          JSON.parse(JSON.stringify(value));
        } catch (e) {
          throw new Error("بيانات Meta Tags غير صالحة");
        }
      }
    }
  },
  image_url: {
    type: DataTypes.STRING,
    validate: {
      isUrl: {
        msg: "يجب أن يكون رابط الصورة صالحاً"
      }
    }
  }
}, {
  tableName: 'pages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true // للحذف اللين
});

// علاقات النموذج (إذا وجدت)
// Page.associate = models => {
//   Page.belongsTo(models.User, { foreignKey: 'user_id' });
// };

module.exports = Page;
