const { Tasks } = require("../models");

// Tüm görevleri getir
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Tasks.findAll({
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
    const { taskHeader, taskDate, priority } = req.body;
    const userId = req.user.id;

    // Zorunlu alanların kontrolü
    if (!taskHeader || !taskDate) {
      return res
        .status(400)
        .json({ message: "Görev başlığı ve tarihi zorunludur." });
    }

    // Priority değerini kontrol et
    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        message:
          "Geçersiz öncelik değeri. 'low', 'medium' veya 'high' olmalıdır.",
      });
    }

    const task = await Tasks.create({
      taskHeader,
      taskDate,
      priority,
      userId,
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Görev oluşturma hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Tekil görevi getir
exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await Tasks.findOne({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Görevi alma hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Görevi güncelle
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { taskHeader, taskDate, isCompleted, priority } = req.body;

    // Önce görevin var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol et
    const task = await Tasks.findOne({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Görev bulunamadı veya bu göreve erişim izniniz yok.",
      });
    }

    // Priority değerini kontrol et
    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        message:
          "Geçersiz öncelik değeri. 'low', 'medium' veya 'high' olmalıdır.",
      });
    }

    // Görevi güncelle
    const updatedTask = await task.update({
      taskHeader: taskHeader || task.taskHeader,
      taskDate: taskDate || task.taskDate,
      isCompleted: isCompleted !== undefined ? isCompleted : task.isCompleted,
      priority: priority || task.priority,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Görev güncelleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Görevi sil
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Önce görevin var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol et
    const task = await Tasks.findOne({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Görev bulunamadı veya bu görevi silme izniniz yok.",
      });
    }

    // Görevi sil
    await task.destroy();

    res.status(200).json({ message: "Görev başarıyla silindi." });
  } catch (error) {
    console.error("Görev silme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Görevin tamamlanma durumunu güncelle
exports.toggleTaskCompletion = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Görevin var olup olmadığını kontrol et
    const task = await Tasks.findOne({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }

    // Görevin tamamlanma durumunu tersine çevir
    const updatedTask = await task.update({
      isCompleted: !task.isCompleted,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Görev tamamlanma durumu güncelleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};
