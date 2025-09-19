"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "../Layout/Layout";
import NoteModal from "../NoteModal/NoteModal";
import api from "../../../services/api";

export default function NotesPage() {
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeNote, setActiveNote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewNote, setIsNewNote] = useState(false);

  // Notları backend'den getir
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await api.notes.getNotes();

        // API'den gelen verileri frontend'in beklediği formata dönüştür
        const formattedNotes = response.map((note) => ({
          id: note.id,
          title: note.noteHeader,
          content: note.noteContent,
          date: new Date(note.noteDate).toISOString(),
        }));

        setNotes(formattedNotes);

        // URL'den noteId'yi kontrol et ve ilgili notu aç
        const urlNoteId = searchParams.get("noteId");
        if (urlNoteId) {
          const noteToOpen = formattedNotes.find(
            (note) => note.id.toString() === urlNoteId
          );
          if (noteToOpen) {
            setActiveNote(noteToOpen);
            setModalOpen(true);
            setIsNewNote(false);
          }
        }

        setError(null);
      } catch (err) {
        setError(
          "Notlar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [searchParams]);

  // Notları arama fonksiyonu
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Yeni not oluşturma fonksiyonu
  const createNewNote = () => {
    const newNote = {
      id: Date.now(), // Geçici ID, backend'e kaydedilince güncellenecek
      title: "Yeni Not",
      content: "",
      date: new Date().toISOString(),
    };

    setActiveNote(newNote);
    setModalOpen(true);
    setIsNewNote(true);
  };

  // Not silme fonksiyonu
  const deleteNote = async (id) => {
    try {
      await api.notes.deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));

      if (activeNote && activeNote.id === id) {
        setActiveNote(null);
        setModalOpen(false);
      }
    } catch (err) {
      setError(
        "Not silinirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      );
    }
  };

  // Not düzenleme
  const editNote = (note) => {
    setActiveNote(note);
    setModalOpen(true);
    setIsNewNote(false);
  };

  // Not kaydetme
  const saveNote = async (updatedNote) => {
    try {
      if (isNewNote) {
        // Yeni not oluştur
        const response = await api.notes.createNote({
          title: updatedNote.title,
          content: updatedNote.content,
        });

        // Backend'den dönen veriyi frontend formatına dönüştür
        const savedNote = {
          id: response.id,
          title: response.noteHeader,
          content: response.noteContent,
          date: new Date(response.noteDate).toISOString(),
        };

        setNotes([savedNote, ...notes]);
      } else {
        // Mevcut notu güncelle
        await api.notes.updateNote(updatedNote.id, {
          title: updatedNote.title,
          content: updatedNote.content,
        });

        setNotes(
          notes.map((note) =>
            note.id === updatedNote.id
              ? {
                  ...note,
                  title: updatedNote.title,
                  content: updatedNote.content,
                  date: new Date().toISOString(),
                }
              : note
          )
        );
      }
      setModalOpen(false);
    } catch (err) {
      setError(
        "Not kaydedilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      );
    }
  };

  // Markdown biçimindeki metni HTML olarak render etme
  const renderMarkdown = (text) => {
    if (!text) return "";

    // Bold
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic
    formattedText = formattedText.replace(/_(.*?)_/g, "<em>$1</em>");

    // Numbered list
    formattedText = formattedText.replace(/^(\d+\.\s.*?)$/gm, "<li>$1</li>");
    formattedText = formattedText.replace(
      /<li>.*?<\/li>(?:\s*<li>.*?<\/li>)+/gs,
      (match) => `<ol>${match}</ol>`
    );

    // Bullet list
    formattedText = formattedText.replace(/^-\s(.*?)$/gm, "<li>$1</li>");
    formattedText = formattedText.replace(
      /(<li>(?!<\/ol>).*?<\/li>(?:\s*<li>(?!<\/ol>).*?<\/li>)+)/gs,
      (match) => `<ul>${match}</ul>`
    );

    // Todo list
    formattedText = formattedText.replace(
      /\[\s\]\s(.*?)$/gm,
      '<div class="flex items-center gap-2"><input type="checkbox" class="form-checkbox" /><span>$1</span></div>'
    );
    formattedText = formattedText.replace(
      /\[x\]\s(.*?)$/gm,
      '<div class="flex items-center gap-2"><input type="checkbox" class="form-checkbox" checked /><span>$1</span></div>'
    );

    // Convert newlines to breaks
    formattedText = formattedText.replace(/\n/g, "<br />");

    return formattedText;
  };

  return (
    <Layout title="Notlar">
      <div className="flex flex-col mt-10">
        <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-4">
          {/* Başlık ve Arama Kısmı */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h3 className="font-bold text-sm">
              {loading
                ? "Notlar yükleniyor..."
                : `Notlarınız (${filteredNotes.length})`}
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Not ara..."
                  className="pl-8 pr-3 py-1.5 text-sm w-full rounded-md bg-[#dfdcdc] dark:bg-[#26282b] dark:text-[#f3f3f3]"
                />
                <span
                  className="material-icons-round absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  style={{ fontSize: "16px" }}
                >
                  search
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <span
                      className="material-icons-round"
                      style={{ fontSize: "16px" }}
                    >
                      close
                    </span>
                  </button>
                )}
              </div>

              <button
                onClick={createNewNote}
                className="px-3 py-1.5 bg-[#26282b] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded-md flex items-center text-sm"
              >
                <span
                  className="material-icons-round mr-1"
                  style={{ fontSize: "16px" }}
                >
                  add
                </span>
                Yeni
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-500"></div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Notes display */}
          {!loading && !error && filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-[#26282b] rounded-md p-3 shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-200 dark:hover:bg-[#1b1c1d] transition-shadow"
                  onClick={() => editNote(note)}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <div className="flex items-center">
                        <span className="block w-3 h-3 rounded-full mr-2 bg-[#26282b] dark:bg-[#f3f3f3]" />
                        <h4 className="font-medium text-sm">{note.title}</h4>
                      </div>
                      <div
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-4 min-h-[60px]"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(note.content),
                        }}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(note.date).toLocaleDateString("tr-TR")}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                          title="Notu Sil"
                        >
                          <span
                            className="material-icons-round"
                            style={{ fontSize: "16px" }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <span
                className="material-icons-round text-gray-400 mb-2"
                style={{ fontSize: "48px" }}
              >
                note_alt
              </span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm
                  ? "Arama kriterlerine uygun not bulunamadı"
                  : "Henüz not eklenmemiş"}
              </p>
              {!searchTerm && (
                <button
                  onClick={createNewNote}
                  className="mt-4 px-4 py-2 bg-[#26282b] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded-md flex items-center text-sm"
                >
                  <span
                    className="material-icons-round mr-1"
                    style={{ fontSize: "18px" }}
                  >
                    add
                  </span>
                  Not Oluştur
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Not Düzenleme Modal */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActiveNote(null);
          setIsNewNote(false);
        }}
        note={activeNote}
        onSave={saveNote}
        isNewNote={isNewNote}
      />
    </Layout>
  );
}
