// controllers/pageController.js
const Page = require("../models/Page");

exports.createPage = async (req, res) => {
  try {
    const { title, vueComponentCode, metaTags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    console.log("🔄 محاولة إنشاء صفحة جديدة...");
    console.log("📝 بيانات الصفحة:", { 
      title,
      metaTags: metaTags ? JSON.parse(metaTags) : {},
      image: req.file ? req.file.originalname : 'لا يوجد'
    });

    const page = await Page.create({
      title,
      vueComponentCode,
      metaTags: metaTags ? JSON.parse(metaTags) : {},
      imageUrl,
    });

    console.log("✅ تم إنشاء الصفحة بنجاح:", JSON.stringify(page, null, 2));
    res.status(201).json({ message: "تم إنشاء الصفحة بنجاح", page });
  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الصفحة." });
  }
};

exports.getPage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 محاولة جلب صفحة بالمعرف: ${id}`);

    const page = await Page.findByPk(id);
    if (!page) {
      console.log(`⚠️ الصفحة غير موجودة بالمعرف: ${id}`);
      return res.status(404).json({ error: "الصفحة غير موجودة" });
    }

    console.log(`✅ تم جلب الصفحة (ID: ${id}):`, JSON.stringify(page, null, 2));
    res.json(page);
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب الصفحة." });
  }
};

exports.getAllPages = async (req, res) => {
  try {
    console.log("🔄 محاولة جلب جميع الصفحات...");
    const startTime = Date.now();
    
    const pages = await Page.findAll();
    
    const duration = Date.now() - startTime;
    console.log(`✅ تم جلب ${pages.length} صفحة خلال ${duration}ms`);
    console.log("📋 قائمة الصفحات:", pages.map(p => ({ id: p.id, title: p.title })));
    
    res.json(pages);
  } catch (error) {
    console.error("❌ خطأ أثناء جلب جميع الصفحات:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب الصفحات." });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, vueComponentCode, metaTags } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    console.log(`🔄 محاولة تحديث صفحة بالمعرف: ${id}`);
    console.log("📝 البيانات الجديدة:", { 
      title: title || 'لم تتغير',
      metaTags: metaTags ? 'محدثة' : 'لم تتغير',
      image: req.file ? req.file.originalname : 'لا يوجد تغيير'
    });

    const page = await Page.findByPk(id);
    if (!page) {
      console.log(`⚠️ الصفحة غير موجودة بالمعرف: ${id}`);
      return res.status(404).json({ error: "الصفحة غير موجودة" });
    }

    page.title = title || page.title;
    page.vueComponentCode = vueComponentCode || page.vueComponentCode;
    page.metaTags = metaTags ? JSON.parse(metaTags) : page.metaTags;
    if (imageUrl) page.imageUrl = imageUrl;

    await page.save();
    
    console.log(`✅ تم تحديث الصفحة (ID: ${id}):`, JSON.stringify(page, null, 2));
    res.json({ message: "تم تحديث الصفحة بنجاح", page });
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث الصفحة." });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 محاولة حذف صفحة بالمعرف: ${id}`);

    const page = await Page.findByPk(id);
    if (!page) {
      console.log(`⚠️ الصفحة غير موجودة بالمعرف: ${id}`);
      return res.status(404).json({ error: "الصفحة غير موجودة" });
    }

    await page.destroy();
    
    console.log(`✅ تم حذف الصفحة بالمعرف: ${id}`);
    res.json({ message: "تم حذف الصفحة بنجاح" });
  } catch (error) {
    console.error("❌ خطأ أثناء حذف الصفحة:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف الصفحة." });
  }
};
