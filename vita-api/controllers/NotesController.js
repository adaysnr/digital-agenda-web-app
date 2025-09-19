const { Notes } = require("../models");

// Tüm notları getir
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const notes = await Notes.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Notları alma hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Yeni not oluştur
exports.createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteHeader, noteContent } = req.body;

    if (!noteHeader || !noteContent) {
      return res.status(400).json({ message: "Başlık ve içerik alanları zorunludur." });
    }

    const note = await Notes.create({
      noteHeader,
      noteContent,
      noteDate: new Date(),
      userId,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Not oluşturma hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Not güncelleme
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { noteHeader, noteContent } = req.body;

    if (!noteHeader || !noteContent) {
      return res.status(400).json({ message: "Başlık ve içerik alanları zorunludur." });
    }

    // İlk önce notu bul ve kullanıcıya ait olduğundan emin ol
    const note = await Notes.findOne({
      where: { id, userId },
    });

    if (!note) {
      return res.status(404).json({ message: "Not bulunamadı veya bu işlem için yetkiniz yok." });
    }

    // Notu güncelle
    note.noteHeader = noteHeader;
    note.noteContent = noteContent;
    note.noteDate = new Date();
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    console.error("Not güncelleme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Not silme
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // İlk önce notu bul ve kullanıcıya ait olduğundan emin ol
    const note = await Notes.findOne({
      where: { id, userId },
    });

    if (!note) {
      return res.status(404).json({ message: "Not bulunamadı veya bu işlem için yetkiniz yok." });
    }

    // Notu sil
    await note.destroy();

    res.status(200).json({ message: "Not başarıyla silindi." });
  } catch (error) {
    console.error("Not silme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Tek bir notu getir
exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Notes.findOne({
      where: { id, userId },
    });

    if (!note) {
      return res.status(404).json({ message: "Not bulunamadı veya bu işlem için yetkiniz yok." });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Not getirme hatası:", error);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};
