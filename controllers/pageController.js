const Page = require("../models/Page");
const fs = require("fs").promises;
const path = require("path");

// إنشاء صفحة جديدة
exports.createPage = async (req, res) => {
  const transaction = await Page.sequelize.transaction();
  try {
    const { title, vue_component_code, meta_tags } = req.body;
    const image_url = req.file ? `/uploads/pages/${req.file.filename}` : null;

    // إنشاء الصفحة
    const page = await Page.create({
      title,
      vue_component_code,
      meta_tags: meta_tags ? JSON.parse(meta_tags) : {},
      image_url
    }, { transaction });

    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: "تم إنشاء الصفحة بنجاح",
      data: page
    });
  } catch (error) {
    await transaction.rollback();
    
    // حذف الملف إذا تم رفعه وفشلت العملية
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(400).json({
      success: false,
      message: "فشل في إنشاء الصفحة",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على جميع الصفحات
exports.getAllPages = async (req, res) => {
  try {
    const pages = await Page.findAll({
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title', 'image_url', 'created_at']
    });

    res.json({
      success: true,
      count: pages.length,
      data: pages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في جلب الصفحات"
    });
  }
};

// الحصول على صفحة واحدة
exports.getPage = async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "الصفحة غير موجودة"
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في جلب الصفحة"
    });
  }
};

// تحديث الصفحة
exports.updatePage = async (req, res) => {
  const transaction = await Page.sequelize.transaction();
  try {
    const page = await Page.findByPk(req.params.id, { transaction });
    
    if (!page) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "الصفحة غير موجودة"
      });
    }

    const { title, vue_component_code, meta_tags } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (vue_component_code) updates.vue_component_code = vue_component_code;
    if (meta_tags) updates.meta_tags = JSON.parse(meta_tags);

    // تحديث صورة الصفحة إذا تم رفع ملف جديد
    if (req.file) {
      // حذف الصورة القديمة إذا كانت موجودة
      if (page.image_url) {
        const oldImagePath = path.join(__dirname, '..', page.image_url);
        await fs.unlink(oldImagePath).catch(() => {});
      }
      updates.image_url = `/uploads/pages/${req.file.filename}`;
    }

    await page.update(updates, { transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: "تم تحديث الصفحة بنجاح",
      data: page
    });
  } catch (error) {
    await transaction.rollback();
    
    // حذف الملف الجديد إذا تم رفعه وفشلت العملية
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(400).json({
      success: false,
      message: "فشل في تحديث الصفحة",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// حذف الصفحة
exports.deletePage = async (req, res) => {
  const transaction = await Page.sequelize.transaction();
  try {
    const page = await Page.findByPk(req.params.id, { transaction });
    
    if (!page) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "الصفحة غير موجودة"
      });
    }

    // حذف الصورة المرفقة إذا كانت موجودة
    if (page.image_url) {
      const imagePath = path.join(__dirname, '..', page.image_url);
      await fs.unlink(imagePath).catch(() => {});
    }

    await page.destroy({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: "تم حذف الصفحة بنجاح"
    });
  } catch (error) {
    await transaction.rollback();
    
    res.status(500).json({
      success: false,
      message: "فشل في حذف الصفحة"
    });
  }
};
