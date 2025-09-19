const { CalendarEvent } = require("../models");

const calendarEventController = {
  // Tüm etkinlikleri getir
  getAllEvents: async (req, res) => {
    try {
      const events = await CalendarEvent.findAll({
        where: { userId: req.user.id },
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Yeni etkinlik oluştur
  createEvent: async (req, res) => {
    try {
      const { description, eventDate, startTime, endTime, isAllDay } = req.body;
      const event = await CalendarEvent.create({
        description,
        eventDate,
        startTime,
        endTime,
        isAllDay,
        userId: req.user.id,
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Etkinlik güncelle
  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await CalendarEvent.findOne({
        where: { id, userId: req.user.id },
      });

      if (!event) {
        return res.status(404).json({ error: "Etkinlik bulunamadı" });
      }

      await event.update(req.body);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Etkinlik sil
  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await CalendarEvent.destroy({
        where: { id, userId: req.user.id },
      });

      if (!deleted) {
        return res.status(404).json({ error: "Etkinlik bulunamadı" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = calendarEventController;
