const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const pomodoroTaskController = require("../controllers/pomodoroTaskController");

// Tüm rotalar kimlik doğrulaması gerektirir
router.use(authMiddleware);

// Görevlerle ilgili rotalar
router.get("/", pomodoroTaskController.getTasks); // Tüm görevleri getir
router.post("/", pomodoroTaskController.createTask); // Yeni görev oluştur
router.put("/:id", pomodoroTaskController.updateTask); // Görevi güncelle
router.delete("/:id", pomodoroTaskController.deleteTask); // Görevi sil
router.get("/completed", pomodoroTaskController.getCompletedTasks); // Tamamlanmış görevleri getir

module.exports = router;
