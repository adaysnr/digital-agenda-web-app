const express = require("express");
const router = express.Router();
const notesController = require("../controllers/NotesController");
const authMiddleware = require("../middlewares/auth");

// Tüm rotalar için kullanıcı kimlik doğrulaması gerekli
router.use(authMiddleware);

router.get("/", notesController.getNotes);
router.get("/:id", notesController.getNoteById);
router.post("/", notesController.createNote);
router.put("/:id", notesController.updateNote);
router.delete("/:id", notesController.deleteNote);

module.exports = router;
