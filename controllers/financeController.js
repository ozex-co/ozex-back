const db = require("../config/financeDatabase");

// نظرة عامة على الوضع المالي: الرصيد، إجمالي الإيرادات، المصروفات وصافي الأرباح.
const getOverview = (req, res) => {
  const query = `
    SELECT 
      (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'income') AS total_income,
      (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'expense') AS total_expense
  `;
  db.get(query, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const total_income = row.total_income;
    const total_expense = row.total_expense;
    const net_profit = total_income - total_expense;
    db.get("SELECT total FROM balance WHERE id = 1", [], (err2, balanceRow) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const current_balance = balanceRow ? balanceRow.total : 0;
      res.json({
        current_balance,
        total_income,
        total_expense,
        net_profit,
      });
    });
  });
};

// تحليل شهري للمعاملات المالية
const getMonthly = (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m', created_at) AS month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
      COUNT(*) AS transactions
    FROM transactions
    GROUP BY month
    ORDER BY month DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const monthlyData = rows.map(row => ({
      month: row.month,
      income: row.income || 0,
      expense: row.expense || 0,
      net: (row.income || 0) - (row.expense || 0),
      transactions: row.transactions,
    }));
    res.json(monthlyData);
  });
};

// تحليل يومي للمعاملات (حسب الدقيقة) لليوم الحالي
const getDaily = (req, res) => {
  const query = `
    SELECT 
      strftime('%H:%M', created_at) AS minute,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
      COUNT(*) AS transactions
    FROM transactions
    WHERE date(created_at) = date('now')
    GROUP BY minute
    ORDER BY minute ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// إضافة معاملة مالية جديدة وتحديث الرصيد
const addTransaction = (req, res) => {
  const { type, amount, description } = req.body;
  if (!type || !amount || isNaN(amount)) {
    return res.status(400).json({ error: "البيانات غير صحيحة" });
  }
  const updateBalanceQuery =
    type === "income"
      ? "UPDATE balance SET total = total + ? WHERE id = 1"
      : "UPDATE balance SET total = total - ? WHERE id = 1";

  db.run(
    "INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)",
    [type, amount, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      // تحديث الرصيد
      db.run(updateBalanceQuery, [amount], function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: "تم تسجيل المعاملة بنجاح", transactionId: this.lastID });
      });
    }
  );
};

// دالة لجلب جميع المعاملات
const getTransactions = (req, res) => {
  const query = `
    SELECT 
      id,
      type,
      amount,
      description,
      strftime('%Y-%m-%d %H:%M:%S', created_at) AS created_at 
    FROM transactions 
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};


// تحديث معاملة مالية موجودة وتحديث الرصيد بناءً على الفرق في المبلغ
const updateTransaction = (req, res) => {
  const { id } = req.params;
  const { amount, description } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "البيانات غير صحيحة" });
  }

  // استرجاع المعاملة القديمة
  db.get("SELECT * FROM transactions WHERE id = ?", [id], (err, oldTx) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!oldTx) return res.status(404).json({ error: "المعاملة غير موجودة" });

    const oldAmount = oldTx.amount;
    const type = oldTx.type;
    let balanceDelta = 0;

    if (type === "income") {
      balanceDelta = amount - oldAmount;
    } else if (type === "expense") {
      balanceDelta = oldAmount - amount;
    }

    // تحديث المعاملة المالية
    db.run(
      "UPDATE transactions SET amount = ?, description = ? WHERE id = ?",
      [amount, description, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        // تسجيل العملية في سجل التعديلات
        db.run(
          "INSERT INTO logs (transaction_id, action, old_amount, new_amount, description) VALUES (?, 'updated', ?, ?, ?)",
          [id, oldAmount, amount, description],
          function (err3) {
            if (err3) console.error("⚠️ Error logging transaction update:", err3.message);
          }
        );

        // تحديث الرصيد
        db.run("UPDATE balance SET total = total + ? WHERE id = 1", [balanceDelta], function (err4) {
          if (err4) return res.status(500).json({ error: err4.message });
          res.json({ message: "تم تحديث المعاملة بنجاح" });
        });
      }
    );
  });
};

// حذف معاملة مالية وتحديث الرصيد لاسترجاع المبلغ
const deleteTransaction = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM transactions WHERE id = ?", [id], (err, tx) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tx) return res.status(404).json({ error: "المعاملة غير موجودة" });

    const { type, amount, description } = tx;
    const updateQuery = type === "income"
      ? "UPDATE balance SET total = total - ? WHERE id = 1"
      : "UPDATE balance SET total = total + ? WHERE id = 1";

    // تحديث الرصيد
    db.run(updateQuery, [amount], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // تسجيل العملية في سجل التعديلات
      db.run(
        "INSERT INTO logs (transaction_id, action, old_amount, new_amount, description) VALUES (?, 'deleted', ?, NULL, ?)",
        [id, amount, description],
        function (err3) {
          if (err3) console.error("⚠️ Error logging transaction delete:", err3.message);
        }
      );

      // حذف المعاملة
      db.run("DELETE FROM transactions WHERE id = ?", [id], function (err4) {
        if (err4) return res.status(500).json({ error: err4.message });
        res.json({ message: "تم حذف المعاملة بنجاح" });
      });
    });
  });
};
  


  const getLogs = (req, res) => {
  db.all("SELECT * FROM logs ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
     });
  };  

module.exports = { getOverview, getMonthly, getDaily, addTransaction, getTransactions , updateTransaction, deleteTransaction , getLogs };
