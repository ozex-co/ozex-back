const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// تحديد مسار قاعدة بيانات المقالات منفصلة
const dbPath = path.join(__dirname, "../articles.sqlite");

// فتح الاتصال بقاعدة بيانات المقالات
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Error connecting to articles database:", err.message);
  else console.log("✅ Connected to Articles SQLite database.");
});

// إنشاء جدول المقالات إذا لم يكن موجودًا
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("❌ Error creating articles table:", err.message);
    else console.log("✅ Articles table is ready.");
  });
});

const ArticleModel = {
  getAllArticles: (callback) => {
    db.all("SELECT * FROM articles ORDER BY created_at DESC", [], callback);
  },

  addArticle: (title, content, callback) => {
    db.run("INSERT INTO articles (title, content) VALUES (?, ?)", [title, content], function (err) {
      callback(err, { id: this.lastID, title, content });
    });
  },

  updateArticle: (id, title, content, callback) => {
    db.run("UPDATE articles SET title = ?, content = ? WHERE id = ?", [title, content, id], function (err) {
      callback(err, { id, title, content });
    });
  },

  deleteArticle: (id, callback) => {
    db.run("DELETE FROM articles WHERE id = ?", [id], callback);
  },
};

module.exports = ArticleModel;
