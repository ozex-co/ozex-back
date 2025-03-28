const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");

// إعداد الناقل للبريد باستخدام إعدادات Zoho
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,      // بريد Zoho الخاص بك
    pass: process.env.ZOHO_PASSWORD    // كلمة المرور الخاصة بالبريد
  }
});

// دالة لتوليد قالب HTML لرسالة التفعيل
const getActivationEmailHTML = (name, activationLink) => {
  return `
  <!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8">
    <title>تفعيل الحساب</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 30px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      h2 { color: #333; }
      p { color: #555; line-height: 1.5; }
      .button { background-color: #007bff; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
      .footer { font-size: 12px; color: #777; margin-top: 30px; text-align: center; }
      .footer a { color: #007bff; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>تأكيد البريد الإلكتروني</h2>
      <p>مرحباً ${name},</p>
      <p>شكراً لتسجيلك في موقعنا. يرجى الضغط على الزر أدناه لتفعيل حسابك:</p>
      <a href="${activationLink}" class="button">تفعيل الحساب</a>
      <p>إذا لم تتمكن من الضغط على الزر، يمكنك نسخ الرابط التالي ولصقه في المتصفح:</p>
      <p>${activationLink}</p>
      <div class="footer">
        <p>حقوق اوزكس © 2025 | <a href="https://ozex.site">زيارة الموقع</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// دالة لتوليد قالب HTML لرسالة الترحيب
const getWelcomeEmailHTML = (name) => {
  return `
  <!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8">
    <title>أهلاً وسهلاً</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 30px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      h2 { color: #333; }
      p { color: #555; line-height: 1.5; }
      .footer { font-size: 12px; color: #777; margin-top: 30px; text-align: center; }
      .footer a { color: #007bff; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>أهلاً وسهلاً بك!</h2>
      <p>مرحباً ${name},</p>
      <p>لقد تم تفعيل حسابك بنجاح في موقعنا. نتمنى لك تجربة رائعة معنا.</p>
      <div class="footer">
        <p>حقوق اوزكس © 2025 | <a href="https://ozex.site">زيارة الموقع</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// تسجيل مستخدم جديد وإرسال رابط التفعيل
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // تعيين دور المستخدم
    const role = email === "ozex.ceo@gmail.com" ? "admin" : "user";
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    // توليد رمز تحقق عشوائي (مثلاً 6 أرقام)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // إنشاء المستخدم في قاعدة البيانات مع حفظ رمز التحقق وحالة غير مُفعل
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      verificationCode,       // رمز التحقق
      isVerified: false         // الحساب غير مفعل حتى التأكيد
    });

    // بناء رابط التفعيل (تأكد من ضبط BASE_URL مثل http://example.com)
    const activationLink = `${process.env.BASE_URL}/api/auth/verify?email=${encodeURIComponent(email)}&code=${verificationCode}`;

    // إعداد رسالة البريد الإلكتروني لإرسال رابط التفعيل باستخدام HTML
    const mailOptions = {
      from: `"OZEX" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "تأكيد البريد الإلكتروني",
      html: getActivationEmailHTML(name, activationLink)
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء التسجيل" });
  }
};

// تفعيل البريد الإلكتروني عبر الرابط وعرض صفحة HTML للتفعيل الناجح
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.query;
    if (!email || !code) return res.status(400).send("بيانات التفعيل ناقصة.");

    // البحث عن المستخدم عبر البريد الإلكتروني
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).send("المستخدم غير موجود.");
    if (user.isVerified) return res.send("تم تفعيل الحساب مسبقاً.");
    if (user.verificationCode !== code) return res.status(400).send("رمز التفعيل غير صحيح.");

    // تحديث حالة المستخدم إلى مفعل وإزالة رمز التحقق
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    // إرسال رسالة ترحيب عبر البريد الإلكتروني باستخدام HTML
    const welcomeMailOptions = {
      from: `"OZEX" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "أهلاً وسهلاً",
      html: getWelcomeEmailHTML(user.name)
    };

    await transporter.sendMail(welcomeMailOptions);

    // عرض صفحة HTML للتأكيد الناجح
    res.send(`
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تم التفعيل</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; text-align: center; }
          .container { max-width: 600px; margin: 50px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          h2 { color: #333; }
          p { color: #555; }
          a { display: inline-block; margin-top: 20px; background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>تم تفعيل حسابك بنجاح!</h2>
          <p>يمكنك الآن تسجيل الدخول والبدء في استخدام الموقع.</p>
          <a href="https://ozex.site">زيارة الموقع</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("حدث خطأ أثناء تفعيل الحساب.");
  }
};

// تسجيل الدخول مع التحقق من تفعيل البريد الإلكتروني وإرسال إشعار بالبريد
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // البحث عن المستخدم
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "البريد الإلكتروني غير صحيح" });
    // التأكد من تفعيل البريد الإلكتروني
    if (!user.isVerified) return res.status(401).json({ error: "يجب تفعيل البريد الإلكتروني أولاً" });
    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
    // إنشاء التوكن
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // إرسال بريد إشعار بتسجيل الدخول (يمكن تعديل المحتوى حسب الرغبة)
    const loginNotificationOptions = {
      from: `"OZEX" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "تنبيه: تسجيل دخول جديد",
      html: `
        <!DOCTYPE html>
        <html lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تنبيه تسجيل الدخول</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #fff; padding: 20px; border-radius: 8px; }
            h2 { color: #333; }
            p { color: #555; line-height: 1.5; }
            .footer { font-size: 12px; color: #777; margin-top: 30px; text-align: center; }
            .footer a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>تنبيه: تسجيل دخول جديد</h2>
            <p>مرحباً ${user.name},</p>
            <p>لقد تم تسجيل الدخول إلى حسابك بنجاح. إذا لم تقم بذلك، يرجى تغيير كلمة المرور فوراً.</p>
            <div class="footer">
              <p>حقوق اوزكس © 2025 | <a href="https://ozex.site">زيارة الموقع</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(loginNotificationOptions);

    res.json({ 
      message: "تم تسجيل الدخول بنجاح", 
      token, 
      role: user.role, 
      name: user.name, 
      email: user.email 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
  }
};
