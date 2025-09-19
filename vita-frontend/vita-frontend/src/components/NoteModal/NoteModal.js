"use client";

import { useState, useEffect, useCallback } from "react";

export default function NoteModal({ isOpen, onClose, note, onSave }) {
  const [editTitle, setEditTitle] = useState(note?.title || "");
  const [editContent, setEditContent] = useState(note?.content || "");
  const [originalTitle, setOriginalTitle] = useState(note?.title || "");
  const [originalContent, setOriginalContent] = useState(note?.content || "");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Not değiştiğinde form içeriğini güncelle
  useEffect(() => {
    if (note) {
      setEditTitle(note.title || "");
      setEditContent(note.content || "");
      setOriginalTitle(note.title || "");
      setOriginalContent(note.content || "");
    }
  }, [note]);

  // İçerikte değişiklik yapılıp yapılmadığını kontrol et
  const hasUnsavedChanges = useCallback(() => {
    return editTitle !== originalTitle || editContent !== originalContent;
  }, [editTitle, originalTitle, editContent, originalContent]);

  // Not kapatma işlemini kontrol et
  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  // Zengin metin düzenleme için format durumları
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isTodo, setIsTodo] = useState(false);

  // Metni biçimlendirmek için fonksiyonlar
  const formatText = (format) => {
    const textArea = document.getElementById("content-editor");
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    let result = editContent;
    let cursorPos = end;

    switch (format) {
      case "bold":
        result =
          editContent.substring(0, start) +
          `**${selectedText}**` +
          editContent.substring(end);
        cursorPos = end + 4;
        setIsBold(!isBold);
        break;

      case "italic":
        result =
          editContent.substring(0, start) +
          `_${selectedText}_` +
          editContent.substring(end);
        cursorPos = end + 2;
        setIsItalic(!isItalic);
        break;

      case "numberedList":
        // For selected multi-line text
        if (selectedText.includes("\n")) {
          const lines = selectedText.split("\n");
          const numberedLines = lines
            .map((line, i) => (line ? `${i + 1}. ${line}` : line))
            .join("\n");
          result =
            editContent.substring(0, start) +
            numberedLines +
            editContent.substring(end);
        } else {
          // For single line or cursor position
          result =
            editContent.substring(0, start) +
            `1. ${selectedText}` +
            editContent.substring(end);
        }
        setIsNumberedList(!isNumberedList);
        break;

      case "bulletList":
        // For selected multi-line text
        if (selectedText.includes("\n")) {
          const lines = selectedText.split("\n");
          const bulletedLines = lines
            .map((line) => (line ? `- ${line}` : line))
            .join("\n");
          result =
            editContent.substring(0, start) +
            bulletedLines +
            editContent.substring(end);
        } else {
          // For single line or cursor position
          result =
            editContent.substring(0, start) +
            `- ${selectedText}` +
            editContent.substring(end);
        }
        setIsBulletList(!isBulletList);
        break;

      case "todo":
        // For selected multi-line text
        if (selectedText.includes("\n")) {
          const lines = selectedText.split("\n");
          const todoLines = lines
            .map((line) => (line ? `[ ] ${line}` : line))
            .join("\n");
          result =
            editContent.substring(0, start) +
            todoLines +
            editContent.substring(end);
        } else {
          // For single line or cursor position
          result =
            editContent.substring(0, start) +
            `[ ] ${selectedText}` +
            editContent.substring(end);
        }
        setIsTodo(!isTodo);
        break;

      default:
        break;
    }

    setEditContent(result);

    // Seçilen kısmın pozisyonunu ayarla
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  // Not kaydetme
  const saveNote = () => {
    onSave({
      ...note,
      title: editTitle,
      content: editContent,
      date: new Date().toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-[#26282b] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          {/* Modal Başlık */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-bold text-lg bg-transparent focus:outline-none dark:text-white w-full"
              placeholder="Not Başlığı"
            />
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>

          {/* Not İçeriği Düzenleme Alanı */}
          <div className="flex-1 overflow-auto p-4">
            {/* Metin düzenleme alanı */}
            <textarea
              id="content-editor"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full min-h-[300px] p-2 bg-transparent focus:outline-none resize-none dark:text-white text-sm"
              placeholder="Not içeriği..."
            />
          </div>

          {/* Metin Biçimlendirme Araçları - Altta Sol Başta */}
          <div className="p-3 flex justify-start">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <button
                onClick={() => formatText("bold")}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Kalın"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  format_bold
                </span>
              </button>

              <button
                onClick={() => formatText("italic")}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="İtalik"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  format_italic
                </span>
              </button>

              <div className="h-6 border-r border-gray-300 dark:border-gray-600 mx-1"></div>

              <button
                onClick={() => formatText("numberedList")}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Numaralı Liste"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  format_list_numbered
                </span>
              </button>

              <button
                onClick={() => formatText("bulletList")}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Madde İşaretli Liste"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  format_list_bulleted
                </span>
              </button>

              <button
                onClick={() => formatText("todo")}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Yapılacaklar Listesi"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  check_box
                </span>
              </button>
            </div>
          </div>

          {/* Modal Alt Kısım */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Son düzenleme: {new Date().toLocaleDateString("tr-TR")}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                İptal
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 text-sm bg-[#26282b] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded-md hover:bg-opacity-90"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Değişiklikleri kaydetmeden kapatma onay modalı */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-[#26282b] rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">
              Değişiklikler Kaydedilmedi
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Yaptığınız değişiklikleri kaydetmeden çıkmak istediğinize emin
              misiniz? Kaydedilmemiş tüm değişiklikler kaybolacaktır.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Vazgeç
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onClose();
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Değişiklikleri Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
