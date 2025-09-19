"use client";

import { useState, useEffect } from "react";
import api from "../../../services/api";

export default function EventEditModal({
  isOpen,
  onClose,
  event,
  months,
  onEventUpdated,
  onEventDeleted,
}) {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setDescription(event.description || "");

      // Tarih formatını yyyy-MM-dd formatına dönüştür
      if (event.rawDate) {
        setDate(event.rawDate);
      }

      // Saat formatlarını ayarla
      setStartTime(
        event.rawStartTime ? event.rawStartTime.substring(0, 5) : ""
      );
      setEndTime(event.rawEndTime ? event.rawEndTime.substring(0, 5) : "");
      setIsAllDay(event.isAllDay || false);
    }
  }, [event]);

  // Modal açık değilse render etme
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Etkinlik açıklaması boş olamaz.");
      return;
    }

    if (!date) {
      setError("Lütfen bir tarih seçin.");
      return;
    }

    if (!isAllDay && !startTime) {
      setError(
        "Lütfen başlangıç saati seçin veya tüm gün seçeneğini işaretleyin."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // API'ye gönderilecek verileri hazırla
      const updatedEventData = {
        id: event.id, // Mevcut etkinlik ID'si
        description: description,
        eventDate: date,
        startTime: isAllDay ? null : startTime,
        endTime: isAllDay ? null : endTime,
        isAllDay: isAllDay,
      };

      // API üzerinden güncelleme isteği gönder
      const response = await api.calendar.updateEvent(updatedEventData);
      if (response !== null && response !== undefined) {
        if (typeof onEventUpdated === "function") {
          const updatedEvent =
            response.event || response.data || updatedEventData;
          onEventUpdated(updatedEvent);
        }
        setError("");
        onClose();
      } else {
        setError("Etkinlik güncellenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Etkinlik güncellenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !event.id) {
      setError("Silinecek etkinlik bulunamadı.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await api.calendar.deleteEvent(event.id);

      if (typeof onEventDeleted === "function") {
        onEventDeleted(event.id);
      }
      onClose();
      setShowDeleteConfirm(false);
    } catch (err) {
      setError("Etkinlik silinirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tarih formatını görüntüleme için formatlama
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Modal Başlığı */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Etkinlik Düzenle</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Silme Onay Dialğou */}
        {showDeleteConfirm ? (
          <div className="mb-6">
            <h4 className="text-base font-medium mb-2">
              Etkinliği Silme Onayı
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Etkinlik Açıklaması */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="edit-description"
              >
                Etkinlik Açıklaması
              </label>
              <input
                id="edit-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-[#36373a] dark:text-white"
                placeholder="Etkinlik açıklaması"
                required
              />
            </div>

            {/* Tarih Seçimi */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="edit-date"
              >
                Tarih
              </label>
              <input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-[#36373a] dark:text-white"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {date && `${formatDisplayDate(date)}`}
              </div>
            </div>

            {/* Tüm Gün Seçimi */}
            <div className="mb-4 flex items-center">
              <input
                id="edit-allday"
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm" htmlFor="edit-allday">
                Tüm gün
              </label>
            </div>

            {/* Başlangıç ve Bitiş Saati */}
            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="edit-start-time"
                  >
                    Başlangıç Saati
                  </label>
                  <input
                    id="edit-start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-[#36373a] dark:text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="edit-end-time"
                  >
                    Bitiş Saati
                  </label>
                  <input
                    id="edit-end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-[#36373a] dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-between space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                disabled={isSubmitting}
              >
                Etkinliği Sil
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-[#36373a] dark:bg-[#f3f3f3] text-white dark:text-[#36373a] hover:opacity-90 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
