const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

// Korumalı rota - kullanıcı profili
router.get("/", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profil bilgileri başarıyla alındı",
    user: req.user,
  });
});

module.exports = router;
