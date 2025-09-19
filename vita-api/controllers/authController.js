const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const crypto = require("crypto");
const { sendEmail } = require("../utils/googleAuth");
const PasswordReset = require("../models/PasswordReset");

// JWT Token oluşturma metodu
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Parola sıfırlama isteği
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "E-posta adresi zorunludur." });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Bu e-posta adresine sahip kullanıcı bulunamadı" });
    }

    // Parola sıfırlama tokeni oluştur
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Eski token varsa temizle ve yeni token oluştur
    await PasswordReset.destroy({ where: { email } }); // Tokeni veritabanına kaydet
    await PasswordReset.create({
      email,
      token: resetToken,
      expiresAt: Date.now() + 3600000, // 1 saat geçerli
    });

    // Sıfırlama URL'si - frontend rotasını doğru formatta kullan
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // E-posta içeriği - Geliştirilmiş tasarım
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vita Dashboard - Parola Sıfırlama</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background-color: #26282b;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .email-body {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .message {
          margin-bottom: 25px;
          color: #555;
        }
        .action-button {
          display: inline-block;
          background-color: #26282b;
          color: white !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 5px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: background-color 0.3s ease;
        }
        .action-button:hover {
          background-color: #1a1c1e;
        }
        .expiry-note {
          font-size: 14px;
          color: #888;
          margin-top: 25px;
          padding: 10px;
          border-left: 3px solid #26282b;
          background-color: #f5f5f5;
        }
        .email-footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
          border-top: 1px solid #eee;
        }
        .email-signature {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        .company-name {
          font-weight: bold;
          color: #26282b;
        }
        @media only screen and (max-width: 480px) {
          .email-container {
            width: 100%;
            border-radius: 0;
          }
          .email-body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Vita Dashboard</h1>
        </div>
        <div class="email-body">
          <div class="greeting">Merhaba ${user.namesurname},</div>
          
          <div class="message">
            <p>Vita Dashboard hesabınız için parola sıfırlama talebinde bulundunuz.</p>
            <p>Aşağıdaki butona tıklayarak yeni bir parola belirleyebilirsiniz:</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="action-button">Parolamı Sıfırla</a>
          </div>
          
          <div class="message">
            <p>Eğer bu butona tıklamakta sorun yaşıyorsanız, aşağıdaki bağlantıyı tarayıcınızın adres çubuğuna kopyalayabilirsiniz:</p>
            <p style="word-break: break-all; font-size: 14px; color: #666;">${resetUrl}</p>
          </div>
          
          <div class="expiry-note">
            Bu parola sıfırlama bağlantısı 1 saat boyunca geçerlidir ve yalnızca bir kez kullanılabilir.
          </div>
          
          <div class="message">
            <p>Bu talebi siz yapmadıysanız, lütfen bu e-postayı görmezden gelin ve hesabınızın güvenliğini gözden geçirin.</p>
          </div>
          
          <div class="email-signature">
            <p>Saygılarımızla,</p>
            <p class="company-name">Vita Dashboard Ekibi</p>
          </div>
        </div>
        <div class="email-footer">
          © ${new Date().getFullYear()} Vita Dashboard. Tüm hakları saklıdır.
        </div>
      </div>
    </body>
    </html>
    `;

    // E-postayı gönder
    await sendEmail(email, "Vita - Parola Sıfırlama Talebi", emailHtml);

    res.status(200).json({
      message: "Parola sıfırlama bağlantısı e-posta adresinize gönderildi.",
    });
  } catch (error) {
    console.error("Parola sıfırlama hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Parola sıfırlama işlemi
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token ve yeni parola zorunludur." });
    } // Şifre uzunluğu kontrolü
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Parola en az 6 karakter olmalıdır.",
      });
    } // Token kontrolü
    const passwordReset = await PasswordReset.findOne({
      where: {
        token,
        expiresAt: { [Op.gt]: new Date() }, // Süresi dolmamış tokenlar
      },
    });

    if (!passwordReset) {
      return res.status(400).json({
        message:
          "Geçersiz veya süresi dolmuş token. Lütfen tekrar parola sıfırlama talebinde bulunun.",
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({
      where: { email: passwordReset.email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı.",
      });
    }

    // Parolayı güncelle
    user.password = newPassword;
    await user.save();

    // Token'ı temizle
    await PasswordReset.destroy({
      where: { email: passwordReset.email },
    });

    res.status(200).json({
      message:
        "Parolanız başarıyla sıfırlandı. Yeni parolanızla giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Parola sıfırlama hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Kullanıcı kayıt işlemi
exports.register = async (req, res) => {
  try {
    const { namesurname, email, password } = req.body;

    // Zorunlu alanların kontrolü
    if (!namesurname || !email || !password) {
      return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
    }

    // Email ve namesurname'in benzersiz olup olmadığının kontrolü
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { namesurname }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu email veya isim zaten kullanımda." });
    }

    // Yeni kullanıcı oluşturulması
    const newUser = await User.create({ namesurname, email, password });

    // JWT token oluşturulması
    const token = generateToken(newUser);

    // Başarılı yanıt
    res.status(201).json({
      user: {
        id: newUser.id,
        namesurname: newUser.namesurname,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Kullanıcı giriş işlemi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Zorunlu alanların kontrolü
    if (!email || !password) {
      return res.status(400).json({ message: "Email ve parola zorunludur." });
    }

    // Kullanıcı kontrolü
    const user = await User.findOne({ where: { email } });

    // Kullanıcı bulunamadıysa veya şifre yanlışsa
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email veya parola hatalı." });
    }

    // JWT token oluştur
    const token = generateToken(user);

    // Başarılı yanıt
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        namesurname: user.namesurname,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Kullanıcı profil bilgilerini getir
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "namesurname", "email", "createdAt", "updatedAt"],
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Profil bilgisi alma hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Kullanıcı profil bilgilerini güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { namesurname, email } = req.body;

    // Zorunlu alanların kontrolü
    if (!namesurname && !email) {
      return res
        .status(400)
        .json({ message: "Güncellenecek en az bir alan girilmelidir." });
    }

    // Kullanıcı kontrolü
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Email veya kullanıcı adı benzersizlik kontrolü
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        where: { email },
        attributes: ["id"],
      });

      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "Bu email adresi zaten kullanımda." });
      }
    }

    if (namesurname && namesurname !== user.namesurname) {
      const existingName = await User.findOne({
        where: { namesurname },
        attributes: ["id"],
      });

      if (existingName) {
        return res
          .status(400)
          .json({ message: "Bu kullanıcı adı zaten kullanımda." });
      }
    }

    // Bilgileri güncelle
    const updatedUser = await user.update({
      namesurname: namesurname || user.namesurname,
      email: email || user.email,
    });

    // Güncellenmiş token oluştur
    const token = generateToken(updatedUser);

    // Başarılı yanıt
    res.status(200).json({
      user: {
        id: updatedUser.id,
        namesurname: updatedUser.namesurname,
        email: updatedUser.email,
      },
      token,
      message: "Profil bilgileri başarıyla güncellendi.",
    });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Kullanıcı şifre güncelleme
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Zorunlu alanların kontrolü
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Mevcut şifre ve yeni şifre zorunludur." });
    }

    // Şifre uzunluk kontrolü
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Yeni şifre en az 6 karakter olmalıdır." });
    }

    // Kullanıcı kontrolü
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Mevcut şifre doğrulaması
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Mevcut şifre yanlış." });
    }

    // Yeni şifrenin mevcut şifreden farklı olduğunu kontrol et
    if (await user.comparePassword(newPassword)) {
      return res
        .status(400)
        .json({ message: "Yeni şifre mevcut şifre ile aynı olamaz." });
    }

    // Şifreyi güncelle
    user.password = newPassword;
    await user.save();

    // Token oluştur
    const token = generateToken(user);

    // Başarılı yanıt
    res.status(200).json({
      message: "Şifre başarıyla güncellendi.",
      token,
    });
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Kullanıcı hesabını silme
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Şifre zorunlu
    if (!password) {
      return res.status(400).json({
        message: "Hesap silme işlemi için şifrenizi girmeniz zorunludur.",
      });
    }

    // Kullanıcıyı bul
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Şifre doğrulaması
    if (!(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ message: "Şifre yanlış. Hesap silme işlemi iptal edildi." });
    }

    // İlişkili verileri temizle - Tasks
    const Tasks = require("../models/Tasks");
    await Tasks.destroy({
      where: { userId: userId },
    });

    // İlişkili verileri temizle - Notes
    const Notes = require("../models/Notes");
    await Notes.destroy({
      where: { userId: userId },
    });

    // İlişkili verileri temizle - PomodoroTask
    const PomodoroTask = require("../models/PomodoroTask");
    await PomodoroTask.destroy({
      where: { userId: userId },
    });

    // İlişkili verileri temizle - CalendarEvent
    const CalendarEvent = require("../models/CalendarEvent");
    await CalendarEvent.destroy({
      where: { userId: userId },
    });

    // Kullanıcıyı sil
    await user.destroy();

    res
      .status(200)
      .json({ message: "Hesabınız ve tüm verileriniz başarıyla silindi." });
  } catch (error) {
    console.error("Hesap silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};
