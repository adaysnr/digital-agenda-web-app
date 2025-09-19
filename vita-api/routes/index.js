var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
  res.json({
    name: "Vita Dashboard API",
    version: "1.0.0",
    description: "Vita Dashboard için RESTful API Servisi",
    endpoints: {
      home: {
        GET: {
          "/": "API ana sayfası.",
        },
      },
      auth: {
        POST: {
          "/auth/register": "Yeni kullanıcı kaydı oluşturur.",
          "/auth/login": "Kullanıcı girişi yapar.",
        },
      },
      profile: {
        GET: {
          "/profile": "Giriş yapmış kullanıcının profilini gösterir.",
        },
      },
    },
    documentation: "Detaylı API dokümantasyonu için: /docs",
  });
});

module.exports = router;
