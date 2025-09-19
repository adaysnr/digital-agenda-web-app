"use client";

import React, { useState } from "react";
import api from "../../../services/api";

const EventModal = ({
  isOpen,
  onClose,
  selectedDate,
  months,
  onEventAdded,
}) => {
  const [eventData, setEventData] = useState({
    description: "",
    startTime: "",
    endTime: "",
    isAllDay: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basit validasyon kontrolü
    if (!eventData.description.trim()) {
      setError("Etkinlik açıklaması giriniz.");
      return;
    }

    if (!eventData.isAllDay && !eventData.startTime) {
      setError("Tüm gün etkinliği değilse başlangıç saatini giriniz.");
      return;
    }

    try {
      setIsLoading(true);
      const eventDate = new Date(selectedDate);
      eventDate.setHours(0, 0, 0, 0);

      // Saat verilerini ayarla
      let startDateTime = new Date(eventDate);
      if (!eventData.isAllDay && eventData.startTime) {
        const [startHour, startMinute] = eventData.startTime
          .split(":")
          .map(Number);
        startDateTime.setHours(startHour, startMinute, 0);
      }

      // Bitiş saati varsa ayarla
      let endDateTime = null;
      if (!eventData.isAllDay && eventData.endTime) {
        const [endHour, endMinute] = eventData.endTime.split(":").map(Number);
        endDateTime = new Date(eventDate);
        endDateTime.setHours(endHour, endMinute, 0);
      } else if (eventData.isAllDay) {
        // Tüm gün etkinliği ise, günün sonunu ayarla
        endDateTime = new Date(eventDate);
        endDateTime.setHours(23, 59, 59);
      } else {
        // Bitiş saati yoksa, başlangıç saati ile aynı
        endDateTime = new Date(startDateTime);
      }

      // API'ye doğrudan veri gönder
      const result = await api.calendar.addEvent({
        description: eventData.description,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        isAllDay: eventData.isAllDay,
      });

      if (result && result.id) {
        if (onEventAdded) {
          const eventDateStr = result.eventDate;

          const formattedResult = {
            id: result.id,
            title: result.description,
            description: result.description,
            startDateTime: new Date(
              `${eventDateStr}T${result.startTime || "00:00:00"}`
            ),
            endDateTime: result.endTime
              ? new Date(`${eventDateStr}T${result.endTime}`)
              : null,
            isAllDay: Boolean(result.isAllDay),
            eventDate: eventDateStr,
          };

          onEventAdded(formattedResult);
        }

        setEventData({
          description: "",
          startTime: "",
          endTime: "",
          isAllDay: false,
        });
        onClose();
      } else {
        throw new Error("API yanıtı geçersiz veya eksik");
      }
    } catch (err) {
      setError("Etkinlik eklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-[#36373a] rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Etkinlik Ekle
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <span className="material-icons-round" style={{ fontSize: "20px" }}>
              close
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
              <span
                className="material-icons-round mr-2"
                style={{ fontSize: "18px" }}
              >
                event
              </span>
              <span>
                {selectedDate
                  ? `${selectedDate.getDate()} ${
                      months[selectedDate.getMonth()]
                    } ${selectedDate.getFullYear()}`
                  : "Tarih seçilmedi"}
              </span>
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Etkinlik Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#26282b] dark:text-gray-200"
                rows="3"
                placeholder="Etkinlik açıklaması girin"
              ></textarea>
            </div>

            <div className="mb-4">
              <div className="flex items-center">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    name="isAllDay"
                    checked={eventData.isAllDay}
                    onChange={handleChange}
                    className="sr-only" // Orijinal checkbox'ı gizle
                  />
                  <div
                    className={`w-5 h-5 rounded border cursor-pointer ${
                      eventData.isAllDay
                        ? "bg-[#36373a] border-[#36373a] dark:bg-[#f3f3f3] dark:border-[#f3f3f3]"
                        : "bg-white border-gray-300 dark:bg-[#26282b] dark:border-gray-600"
                    } flex items-center justify-center transition-colors`}
                    onClick={() => {
                      // Checkbox'ın görünümüne tıklandığında değerini tersine çevir
                      setEventData((prev) => ({
                        ...prev,
                        isAllDay: !prev.isAllDay,
                      }));
                    }}
                  >
                    {eventData.isAllDay && (
                      <span
                        className="material-icons-round text-white dark:text-[#36373a]"
                        style={{ fontSize: "14px" }}
                      >
                        check
                      </span>
                    )}
                  </div>
                </div>
                <label
                  htmlFor="isAllDay"
                  className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Tüm gün
                </label>
              </div>
            </div>

            {!eventData.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={eventData.startTime}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#26282b] dark:text-gray-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={eventData.endTime}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#26282b] dark:text-gray-200"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-[#26282b] transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#36373a] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded-md hover:opacity-90 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <span
                  className="material-icons-round animate-spin mr-1"
                  style={{ fontSize: "18px" }}
                >
                  autorenew
                </span>
              )}
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
