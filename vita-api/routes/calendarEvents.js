const express = require("express");
const router = express.Router();
const calendarEventController = require("../controllers/calendarEventController");
const authMiddleware = require("../middlewares/auth");

// Tüm route'lar için authentication gerekli
router.use(authMiddleware);

router.get("/", calendarEventController.getAllEvents);
router.post("/", calendarEventController.createEvent);
router.put("/:id", calendarEventController.updateEvent);
router.delete("/:id", calendarEventController.deleteEvent);

module.exports = router;
