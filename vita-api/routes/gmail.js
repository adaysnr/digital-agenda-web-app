const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const { sendEmail } = require("../utils/googleAuth");

// Tüm rotalar için kullanıcı kimlik doğrulaması gerekli
router.use(authMiddleware);

// E-posta doğrulama fonksiyonu
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Test endpoint - Google Gmail API'nin çalışıp çalışmadığını test etmek için
router.get("/test", async (req, res) => {
  try {
    res.status(200).json({ message: "Gmail API bağlantısı başarılı" });
  } catch (error) {
    console.error("Gmail API test hatası:", error);
    res.status(500).json({ message: "Gmail API bağlantı hatası" });
  }
});

// E-posta gönderme endpoint'i
router.post("/send-email", async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        message: "Alıcı, konu ve içerik alanları zorunludur.",
      });
    }

    // E-posta doğrulama
    if (!validateEmail(to)) {
      return res.status(400).json({
        message: "Geçersiz e-posta formatı.",
      });
    }

    await sendEmail(to, subject, htmlContent);

    res.status(200).json({ message: "E-posta başarıyla gönderildi" });
  } catch (error) {
    console.error("E-posta gönderme hatası:", error);
    res
      .status(500)
      .json({ message: "E-posta gönderme sırasında bir hata oluştu" });
  }
});

module.exports = router;
