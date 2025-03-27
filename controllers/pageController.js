// controllers/pageController.js
const Page = require("../models/Page");

exports.createPage = async (req, res) => {
  try {
    const { title, vueComponentCode, metaTags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // إنشاء صفحة جديدة في قاعدة بيانات الصفحات
    const page = await Page.create({
      title,
      vueComponentCode,
      metaTags: metaTags ? JSON.parse(metaTags) : {},
      imageUrl,
    });

    res.status(201).json({ message: "تم إنشاء الصفحة بنجاح", page });
  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الصفحة." });
  }
};

exports.getPage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ error: "الصفحة غير موجودة" });
    }
    res.json(page);
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب الصفحة." });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, vueComponentCode, metaTags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ error: "الصفحة غير موجودة" });
    }

    // تحديث الحقول الموجودة إن وُجدت بيانات جديدة
    page.title = title || page.title;
    page.vueComponentCode = vueComponentCode || page.vueComponentCode;
    page.metaTags = metaTags ? JSON.parse(metaTags) : page.metaTags;
    if (imageUrl) page.imageUrl = imageUrl;

    await page.save();
    res.json({ message: "تم تحديث الصفحة بنجاح", page });
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث الصفحة." });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByPk(id);
    if (!page) {
      return res.status(404).json({ error: "الصفحة غير موجودة" });
    }
    await page.destroy();
    res.json({ message: "تم حذف الصفحة بنجاح" });
  } catch (error) {
    console.error("❌ خطأ أثناء حذف الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف الصفحة." });
  }
};
