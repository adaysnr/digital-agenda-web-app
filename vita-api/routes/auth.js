const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");

// Kimlik doğrulaması gerektirmeyen rotalar - herkes erişebilir
// Kullanıcı kaydı için POST rotası
router.post("/register", authController.register);

// Kullanıcı girişi için POST rotası
router.post("/login", authController.login);

// Parola sıfırlama isteği için POST rotası (kimlik doğrulaması gerektirmez)
router.post("/forgot-password", authController.forgotPassword);

// Parola sıfırlama işlemi için POST rotası (kimlik doğrulaması gerektirmez)
router.post("/reset-password", authController.resetPassword);

// Kimlik doğrulaması gerektiren rotalar - sadece oturum açmış kullanıcılar erişebilir
// Kullanıcı profil bilgilerini getirme için GET rotası
router.get("/profile", authMiddleware, authController.getProfile);

// Kullanıcı profil bilgisi güncelleme için PUT rotası
router.put("/profile", authMiddleware, authController.updateProfile);

// Kullanıcı şifre güncelleme için PUT rotası
router.put("/password", authMiddleware, authController.updatePassword);

// Kullanıcı hesabını silme için DELETE rotası
router.delete("/account", authMiddleware, authController.deleteAccount);

module.exports = router;
