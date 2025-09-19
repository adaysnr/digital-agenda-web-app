const { PomodoroTask } = require("../models");

// Tüm görevleri getir
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await PomodoroTask.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Görevleri alma hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Yeni görev oluştur
exports.createTask = async (req, res) => {
  try {
    const { taskContent } = req.body;
    const userId = req.user.id;

    // Zorunlu alanların kontrolü
    if (!taskContent) {
      return res.status(400).json({ message: "Görev içeriği zorunludur." });
    }

    const task = await PomodoroTask.create({
      taskContent,
      userId,
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Görev oluşturma hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Görevi güncelle
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskContent, isCompleted } = req.body;
    const userId = req.user.id;

    // Görevin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const task = await PomodoroTask.findOne({ where: { id, userId } });

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }

    // Görevi güncelle
    const updateValues = {};
    if (taskContent !== undefined) updateValues.taskContent = taskContent;
    if (isCompleted !== undefined) updateValues.isCompleted = isCompleted;

    await task.update(updateValues);
    return res.status(200).json(task);
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Görevi sil
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Görevin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const task = await PomodoroTask.findOne({ where: { id, userId } });

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }

    // Görevi sil
    await task.destroy();
    return res.status(204).json({ message: "Görev başarıyla silindi" });
  } catch (error) {
    console.error("Görev silme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Tamamlanan görevleri getir
exports.getCompletedTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const completedTasks = await PomodoroTask.findAll({
      where: { userId, isCompleted: true },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(completedTasks);
  } catch (error) {
    console.error("Tamamlanan görevleri alma hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};
