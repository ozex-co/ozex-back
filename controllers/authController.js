const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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

// تسجيل مستخدم جديد وإرسال رابط التفعيل
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // تعيين دور المستخدم
    const role = email === "admin@ozex.site" ? "admin" : "user";

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
    const activationLink = `${process.env.BASE_URL}/verify?email=${encodeURIComponent(email)}&code=${verificationCode}`;

    // إعداد رسالة البريد الإلكتروني لإرسال رابط التفعيل
    const mailOptions = {
      from: `"Your App Name" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "تأكيد البريد الإلكتروني",
      text: `اضغط على الرابط التالي لتفعيل حسابك:\n\n${activationLink}`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء التسجيل" });
  }
};

// تفعيل البريد الإلكتروني عبر الرابط
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

    // إرسال رسالة ترحيب عبر البريد الإلكتروني
    const welcomeMailOptions = {
      from: `"Your App Name" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "أهلاً وسهلاً",
      text: `مرحباً ${user.name}, أهلاً وسهلاً بك في تطبيقنا!`
    };

    await transporter.sendMail(welcomeMailOptions);

    // إرسال رسالة نصية بسيطة كرد من السيرفر عند التفعيل
    res.send("تم تفعيل حسابك بنجاح.");
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

    // إرسال بريد إشعار بتسجيل الدخول
    const loginNotificationOptions = {
      from: `"Your App Name" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: "تنبيه: تسجيل دخول جديد",
      text: `مرحباً ${user.name}, لقد تم تسجيل الدخول إلى حسابك بنجاح. إذا لم تقم بذلك، يرجى تغيير كلمة المرور فوراً.`
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
