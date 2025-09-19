const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Token doğrulama middleware'i
const authMiddleware = async (req, res, next) => {
  try {
    // Authorization header'ı kontrolü
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Yetkilendirme başarısız. Token bulunamadı.",
      });
    }

    // Bearer prefix'i kaldır ve token'ı al
    const token = authHeader.split(" ")[1];

    // Token doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token geçerliyse kullanıcıyı bul
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    // Kullanıcı bilgisini isteğe ekle (parola hariç)
    req.user = {
      id: user.id,
      email: user.email,
      namesurname: user.namesurname,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Geçersiz token." });
    }

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token süresi doldu." });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası.",
    });
  }
};

module.exports = authMiddleware;
module.exports.authenticateToken = authMiddleware;
