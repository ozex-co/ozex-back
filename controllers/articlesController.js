const ArticleModel = require("../models/article");

const getAllArticles = (req, res) => {
  console.log("🔍 جلب جميع المقالات");
  ArticleModel.getAllArticles((err, articles) => {
    if (err) {
      console.error("❌ خطأ أثناء جلب المقالات:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(articles);
  });
};

const addArticle = (req, res) => {
  console.log("📝 إضافة مقال جديد:", req.body);
  const { title, content } = req.body;
  if (!title || !content) {
    console.warn("⚠️ البيانات غير مكتملة");
    return res.status(400).json({ error: "يجب إدخال عنوان ومحتوى" });
  }
  ArticleModel.addArticle(title, content, (err, newArticle) => {
    if (err) {
      console.error("❌ خطأ أثناء إضافة المقال:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("✅ المقال المضاف:", newArticle);
    res.status(201).json({ message: "تم إضافة المقال بنجاح", article: newArticle });
  });
};

const updateArticle = (req, res) => {
  console.log("🔄 تعديل مقال ID:", req.params.id, "البيانات:", req.body);
  const { id } = req.params;
  const { title, content } = req.body;
  if (!title || !content) {
    console.warn("⚠️ البيانات غير مكتملة");
    return res.status(400).json({ error: "يجب إدخال عنوان ومحتوى" });
  }
  ArticleModel.updateArticle(id, title, content, (err, updatedArticle) => {
    if (err) {
      console.error("❌ خطأ أثناء تحديث المقال:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("✅ المقال بعد التحديث:", updatedArticle);
    res.json({ message: "تم تحديث المقال بنجاح", article: updatedArticle });
  });
};

const deleteArticle = (req, res) => {
  console.log("🗑️ حذف مقال ID:", req.params.id);
  const { id } = req.params;
  ArticleModel.deleteArticle(id, (err) => {
    if (err) {
      console.error("❌ خطأ أثناء حذف المقال:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("✅ تم حذف المقال:", id);
    res.json({ message: "تم حذف المقال بنجاح" });
  });
};

module.exports = { getAllArticles, addArticle, updateArticle, deleteArticle };
