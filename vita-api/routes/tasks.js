const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasksController");
const authMiddleware = require("../middlewares/auth");

// Tüm rotaları doğrulama korumasi altına alma
router.use(authMiddleware);

// Tüm görevleri getir
router.get("/", tasksController.getTasks);
router.post("/", tasksController.createTask);
router.get("/:id", tasksController.getTaskById);
router.put("/:id", tasksController.updateTask);
router.delete("/:id", tasksController.deleteTask);
router.patch("/:id/toggle", tasksController.toggleTaskCompletion);

module.exports = router;
