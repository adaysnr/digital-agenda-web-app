"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api";

export default function NotesWidget() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Son eklenen notları göster (maksimum 6 not)
        const recentNotes = formattedNotes
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);

        setNotes(recentNotes);
        setError(null);
      } catch (err) {
        setError("Notlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Notlar sayfasına yönlendirme
  const navigateToNotesPage = (noteId = null) => {
    if (noteId) {
      router.push(`/notes?noteId=${noteId}`);
    } else {
      router.push("/notes");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Notlarım</h3>
        <button
          onClick={navigateToNotesPage}
          className="px-3 py-1 text-xs rounded-md border border-gray-300 dark:border-[#686565] bg-gray-100 dark:bg-[#2a2c30] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#36373a] transition-colors flex items-center"
        >
          <span className="mr-1">Tümünü Gör</span>
          <span className="material-icons-round" style={{ fontSize: "14px" }}>
            arrow_forward
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#26282b] dark:border-[#f3f3f3]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center my-4 text-sm">{error}</div>
      ) : notes.length > 0 ? (
        <div className="custom-scrollbar overflow-y-auto flex-grow pr-1">
          <ul className="divide-y divide-gray-200 dark:divide-[#48494a]">
            {notes.map((note) => (
              <li
                key={note.id}
                onClick={() => navigateToNotesPage(note.id)}
                className="py-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-[#48494a] rounded-md transition-colors relative"
              >
                <div className="flex items-center">
                  <div className="w-[2px] h-5 mr-2 bg-[#d5d8db] dark:bg-[#686565]"></div>
                  <div className="flex justify-between items-center w-full">
                    <h4 className="font-medium text-sm truncate flex-1">
                      {note.title}
                    </h4>
                    <span
                      className="material-icons-round text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ fontSize: "16px" }}
                    >
                      chevron_right
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <span
            className="material-icons-round text-gray-400 mb-2"
            style={{ fontSize: "36px" }}
          >
            note_alt
          </span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Henüz not eklenmemiş
          </p>
          <button
            onClick={navigateToNotesPage}
            className="mt-4 text-sm text-[#26282b] dark:text-[#f3f3f3] flex items-center"
          >
            <span
              className="material-icons-round mr-1"
              style={{ fontSize: "14px" }}
            >
              add
            </span>
            Not ekle
          </button>
        </div>
      )}
    </div>
  );
}
