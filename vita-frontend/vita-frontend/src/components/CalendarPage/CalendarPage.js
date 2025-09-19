"use client";

import { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import EventModal from "../EventModal/EventModal";
import EventEditModal from "../EventModal/EventEditModal";
import api from "../../../services/api";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"];
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  useEffect(() => {
    const savedViewMode = localStorage.getItem("viewMode");
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.calendar.getEvents();
      if (!response || !Array.isArray(response)) {
        throw new Error("Geçersiz API yanıtı");
      }

      // API'den gelen tarih formatını düzelt
      const formattedEvents = response.map((event) => {
        const dateStr = event.eventDate.split("T")[0];
        const parsedDate = new Date(`${dateStr}T00:00:00`);

        parsedDate.setDate(parsedDate.getDate() + 1);

        const correctedDateStr = parsedDate.toISOString().split("T")[0];

        const startTime = event.startTime || "00:00:00";
        const startDateTime = new Date(`${correctedDateStr}T${startTime}`);

        let endDateTime = null;
        if (event.endTime) {
          endDateTime = new Date(`${correctedDateStr}T${event.endTime}`);
        }

        return {
          id: event.id,
          title: event.description,
          description: event.description,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          isAllDay: Boolean(event.isAllDay),
          rawDate: correctedDateStr,
          rawStartTime: startTime,
          rawEndTime: event.endTime,
          createdAt: event.createdAt,
        };
      });

      setEvents(formattedEvents);
      const today = new Date().toISOString().split("T")[0];
      const todayEvents = formattedEvents.filter(
        (event) => event.rawDate === today
      );
    } catch (err) {
      setError("Etkinlikler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEventAdded = () => {
    try {
      fetchEvents();
    } catch (err) {
      // Error handling
    }
  };

  const handleEventUpdated = () => {
    try {
      fetchEvents();
    } catch (err) {
      // Error handling
    }
  };

  const handleEventDeleted = () => {
    try {
      fetchEvents();
    } catch (err) {
      // Handle error silently in production
    }
  };

  const getEventsForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // tarihi sıfırla

    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.startDateTime);
      eventDate.setHours(0, 0, 0, 0);

      return eventDate.getTime() === targetDate.getTime();
    });

    const dateStr = date.toLocaleDateString("tr-TR");
    return filteredEvents;
  };

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const prevMonthDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();

  const createCalendarDays = () => {
    const today = new Date();
    const calendarDays = [];

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: prevMonthDays - i,
        currentMonth: false,
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          prevMonthDays - i
        ),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      calendarDays.push({
        day: i,
        currentMonth: true,
        isToday:
          i === today.getDate() &&
          currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear(),
        date: date,
        isSelected:
          selectedDate && date.toDateString() === selectedDate.toDateString(),
        events: getEventsForDate(date),
      });
    }

    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        currentMonth: false,
        date: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          i
        ),
      });
    }

    return calendarDays;
  };

  const prevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (viewMode === "week") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7
        )
      );
    } else if (viewMode === "day") {
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1
      );
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (viewMode === "week") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 7
        )
      );
    } else if (viewMode === "day") {
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1
      );
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectDate = (date) => {
    setSelectedDate(date);

    if (viewMode === "day") {
      setCurrentDate(new Date(date));
    }
  };

  // Burası component olabilir
  const renderEvents = (events, isMonthView = true) => {
    if (!events || events.length === 0) return null;

    if (isMonthView) {
      return (
        <div className="mt-1 text-xs flex flex-col gap-1">
          {events.slice(0, 2).map((event, index) => {
            const startTime = new Date(event.startDateTime).toLocaleTimeString(
              "tr-TR",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={index}
                className="px-1 py-0.5 bg-[#36373a] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded truncate hover:opacity-90 cursor-pointer transition-all"
                title={event.description}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(event);
                }}
              >
                {event.isAllDay ? (
                  <span className="font-medium">
                    {event.description.length > 13
                      ? event.description.substring(0, 13) + "..."
                      : event.description}
                  </span>
                ) : (
                  <>
                    {startTime} -{" "}
                    {event.description.length > 10
                      ? event.description.substring(0, 10) + "..."
                      : event.description}
                  </>
                )}
              </div>
            );
          })}

          {events.length > 2 && (
            <div className="px-1 text-xs text-gray-500 dark:text-gray-400">
              +{events.length - 2} daha
            </div>
          )}
        </div>
      );
    }

    return events.map((event, index) => {
      const startTime = new Date(event.startDateTime).toLocaleTimeString(
        "tr-TR",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      const endTime = event.endDateTime
        ? new Date(event.endDateTime).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

      return (
        <div
          key={index}
          className="px-2 py-1 mb-1 bg-[#36373a] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded-md hover:opacity-90 cursor-pointer transition-all"
          onClick={(e) => {
            e.stopPropagation();
            openEditModal(event);
          }}
        >
          <div className="font-medium">
            {event.isAllDay ? (
              <span className="flex items-center">
                <span className="material-icons-round text-xs mr-1">event</span>
                <span>Tüm Gün</span>
              </span>
            ) : null}
            {event.description}
          </div>
          {!event.isAllDay && (
            <div className="flex items-center text-xs">
              <span className="material-icons-round text-xs mr-1">
                schedule
              </span>
              {startTime} {endTime ? `- ${endTime}` : ""}
            </div>
          )}
        </div>
      );
    });
  };

  // Başlangıç ve bitiş saatine göre etkinliği konumlandırma
  const calculateEventPosition = (event) => {
    const startDateTime = new Date(event.startDateTime);
    const endDateTime = event.endDateTime
      ? new Date(event.endDateTime)
      : new Date(startDateTime);

    // Bitiş saati yoksa varsayılan olarak 1 saat ekle
    if (!event.endDateTime) {
      endDateTime.setHours(endDateTime.getHours() + 1);
    }

    // Başlangıç ve bitiş zaman dilimi indekslerini hesapla (her 30 dk = 1 indeks, her saat = 2 indeks)
    const startSlotIndex =
      startDateTime.getHours() * 2 + (startDateTime.getMinutes() >= 30 ? 1 : 0);

    // Bitiş zaman dilimi hesabını düzelt
    const endSlotIndex =
      endDateTime.getHours() * 2 + (endDateTime.getMinutes() > 0 ? 1 : 0);

    // Görüntülemek için kullanılacak dilim sayısı
    const slotCount = Math.max(1, endSlotIndex - startSlotIndex);

    return {
      startSlotIndex,
      endSlotIndex,
      slotCount,
    };
  };

  return (
    <Layout>
      <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md h-[calc(100vh-3rem)] overflow-hidden flex flex-col border border-[#dfdcdc] dark:border-gray-500">
        <div className="flex justify-between items-center mb-4 p-4">
          <div className="flex items-center space-x-2">
            <span className="material-icons-round" style={{ fontSize: "22px" }}>
              calendar_today
            </span>
            <h2 className="text-xl mt-1 font-bold">
              {`${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
          </div>

          <div className="flex flex-row">
            <div className="flex space-x-1">
              <button
                onClick={prevPeriod}
                className="flex justify-center items-center border border-gray-400 px-3 py-2 rounded-md"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  arrow_back
                </span>
              </button>
              <button
                onClick={goToToday}
                className="flex justify-center items-center border border-gray-400 p-2 rounded-md text-sm px-3 py-2 font-medium"
              >
                Bugün
              </button>
              <button
                onClick={nextPeriod}
                className="flex justify-center items-center border border-gray-400 px-3 py-2 rounded-md"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  arrow_forward
                </span>
              </button>
            </div>
            <div className="ml-4">
              <div className="flex h-full border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode("day")}
                  className={`flex items-center justify-center px-3 py-2 text-sm font-medium transition-all duration-300 hover:opacity-90
        ${
          viewMode === "day"
            ? "bg-[#36373a] text-white shadow-inner dark:bg-white dark:text-[#26282b]"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-inner"
        }`}
                >
                  Gün
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`flex items-center justify-center px-3 py-2 text-sm font-medium border-x border-gray-300 dark:border-gray-600 transition-all duration-300 hover:opacity-90
        ${
          viewMode === "week"
            ? "bg-[#36373a] text-white shadow-inner dark:bg-white dark:text-[#26282b]"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-inner"
        }`}
                >
                  Hafta
                </button>
                <button
                  onClick={() => setViewMode("month")}
                  className={`flex items-center justify-center px-3 py-2 text-sm font-medium transition-all duration-300 hover:opacity-90
        ${
          viewMode === "month"
            ? "bg-[#36373a] text-white shadow-inner dark:bg-white dark:text-[#26282b]"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-inner"
        }`}
                >
                  Ay
                </button>
              </div>
            </div>{" "}
            <div className="ml-4 mr-28">
              <button
                onClick={openModal}
                className="flex justify-center items-center gap-2 border border-[#36373a] bg-[#36373a] dark:bg-[#f3f3f3] dark:text-[#26282b] text-[#f3f3f3] px-3 py-2 rounded-md text-sm font-medium"
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: "18px" }}
                >
                  add
                </span>
                Etkinlik Ekle
              </button>
            </div>
          </div>
        </div>

        <EventModal
          isOpen={isModalOpen}
          onClose={closeModal}
          selectedDate={selectedDate}
          months={months}
          onEventAdded={handleEventAdded}
        />

        <EventEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          event={selectedEvent}
          months={months}
          onEventUpdated={handleEventUpdated}
          onEventDeleted={handleEventDeleted}
        />

        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 flex justify-center items-center z-10">
            <span
              className="material-icons-round animate-spin mr-2"
              style={{ fontSize: "24px" }}
            >
              autorenew
            </span>
            <span>Yükleniyor...</span>
          </div>
        )}

        <div className="border-t border-gray-300 dark:border-gray-500 flex flex-1 flex-col">
          {viewMode === "month" && (
            <>
              <div className="grid grid-cols-7 border-b border-gray-300 dark:border-gray-500">
                {daysOfWeek.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-[13px] text-gray-500 dark:text-gray-300 font-medium py-3
                ${
                  index > 0
                    ? "border-l border-gray-300 dark:border-gray-500"
                    : ""
                }
              `}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex-1 grid grid-cols-7 h-full auto-rows-fr border-collapse">
                {createCalendarDays().map((day, index) => {
                  const row = Math.floor(index / 7);
                  const col = index % 7;
                  const dayEvents = day.events || [];

                  return (
                    <div
                      key={index}
                      className={`
                relative border-gray-300 dark:border-gray-500
                ${col > 0 ? "border-l" : ""}
                ${row < 5 ? "border-b" : ""}
              `}
                    >
                      <div className="p-1 flex justify-start">
                        <button
                          onClick={() =>
                            day.currentMonth && selectDate(day.date)
                          }
                          className={`
                    flex items-center justify-center text-sm w-7 h-7 rounded-md
                    ${
                      !day.currentMonth
                        ? "text-gray-400 dark:text-gray-600"
                        : day.isToday
                        ? "bg-[#36373a] text-white dark:bg-white dark:text-[#26282b]"
                        : day.isSelected
                        ? "bg-gray-300 dark:bg-gray-500"
                        : "hover:bg-gray-100 dark:hover:bg-[#4a4b4e] text-[#26282b] dark:text-white"
                    }
                  `}
                        >
                          {day.day}
                        </button>
                      </div>

                      {day.currentMonth && (
                        <div className="px-1">
                          {dayEvents.length > 0 &&
                            renderEvents(dayEvents, true)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === "week" && (
            <>
              <div className="grid grid-cols-7 border-b border-gray-300 dark:border-gray-500 pl-12 pr-4">
                {Array.from({ length: 7 }).map((_, index) => {
                  const currentDay = new Date(currentDate);
                  const dayOfWeek = currentDate.getDay() || 7;
                  currentDay.setDate(
                    currentDate.getDate() - dayOfWeek + index + 1
                  );
                  const today = new Date();
                  const isToday =
                    currentDay.toDateString() === today.toDateString();

                  return (
                    <div
                      key={index}
                      className={`text-center text-[13px] font-medium py-3
                        ${
                          index > 0
                            ? "border-l border-gray-300 dark:border-gray-500"
                            : ""
                        }
                        ${
                          isToday
                            ? "bg-[#f9f9f9] dark:bg-[#56575a] font-bold"
                            : "text-gray-500 dark:text-gray-300"
                        }`}
                    >
                      {daysOfWeek[index]} {currentDay.getDate()}
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 relative">
                <div className="absolute inset-0 overflow-y-auto max-h-[calc(100vh-11.5rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  <table className="w-full table-fixed border-collapse">
                    <colgroup>
                      <col className="w-12" />
                      {Array.from({ length: 7 }).map((_, i) => (
                        <col key={`col-${i}`} />
                      ))}
                    </colgroup>
                    <tbody>
                      {Array.from({ length: 24 }).map((_, hourIndex) => (
                        <tr key={hourIndex} className="group">
                          <td className="border-r border-b border-gray-200 dark:border-gray-600 h-16 align-top">
                            <div className="flex items-center justify-end pr-2 h-full">
                              <span className="text-xs text-gray-500 dark:text-gray-300">
                                {hourIndex.toString().padStart(2, "0")}:00
                              </span>
                            </div>
                          </td>

                          {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const currentDay = new Date(currentDate);
                            const dayOfWeek = currentDate.getDay() || 7;
                            currentDay.setDate(
                              currentDate.getDate() - dayOfWeek + dayIndex + 1
                            );
                            currentDay.setHours(hourIndex, 0, 0, 0);

                            const eventsForHour = events.filter((event) => {
                              const eventDate = new Date(event.startDateTime);
                              const eventDateStr = eventDate
                                .toISOString()
                                .split("T")[0];
                              const currentDayStr = currentDay
                                .toISOString()
                                .split("T")[0];
                              const hourMatch =
                                eventDate.getHours() === hourIndex;
                              const dayMatch = eventDateStr === currentDayStr;

                              return dayMatch && hourMatch;
                            });

                            return (
                              <td
                                key={dayIndex}
                                className={`border-b border-gray-200 dark:border-gray-600 h-16
                                  ${
                                    dayIndex < 6
                                      ? "border-r border-gray-200 dark:border-gray-600"
                                      : ""
                                  }`}
                              >
                                <div
                                  className="w-full h-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                  onClick={() => {
                                    setSelectedDate(new Date(currentDay));
                                    openModal();
                                  }}
                                >
                                  {eventsForHour.length > 0 &&
                                    renderEvents(eventsForHour, false)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {viewMode === "day" && (
            <>
              <div className="border-b border-gray-300 dark:border-gray-500 p-3 flex justify-center bg-[#f9f9f9] dark:bg-[#56575a]">
                <h3 className="font-bold">
                  {selectedDate
                    ? `${selectedDate.getDate()} ${
                        months[selectedDate.getMonth()]
                      } ${selectedDate.getFullYear()}`
                    : `${new Date().getDate()} ${
                        months[new Date().getMonth()]
                      } ${new Date().getFullYear()}`}
                </h3>
              </div>

              {/* Tüm gün etkinlikler için bölüm */}
              <div className="border-b border-gray-300 dark:border-gray-500 p-2 bg-[#f1f1f1] dark:bg-[#46474a]">
                <h4 className="text-sm font-medium pl-1 mb-1 text-gray-700 dark:text-gray-300">
                  Tüm Gün Etkinlikler
                </h4>
                {getEventsForDate(selectedDate)
                  .filter((event) => event.isAllDay === true)
                  .map((event, index) => (
                    <div
                      key={`all-day-${event.id || index}`}
                      className="px-2 py-1.5 mb-1 rounded-md bg-[#36373a] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] hover:opacity-90 cursor-pointer transition-all shadow-sm"
                      onClick={() => openEditModal(event)}
                    >
                      <div className="font-medium flex items-center">
                        <span className="material-icons-round text-xs mr-1">
                          event
                        </span>
                        <span>{event.description}</span>
                      </div>
                    </div>
                  ))}
                {getEventsForDate(selectedDate).filter(
                  (event) => event.isAllDay === true
                ).length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-1.5 italic">
                    Tüm gün etkinlik yok
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden pb-16 max-h-[calc(100vh-12rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {Array.from({ length: 48 }).map((_, timeSlotIndex) => {
                  const hour = Math.floor(timeSlotIndex / 2);
                  const minute = (timeSlotIndex % 2) * 30;
                  const timeSlotDate = new Date(selectedDate);
                  timeSlotDate.setHours(hour, minute, 0, 0);

                  const isFullHour = minute === 0;

                  const eventsForTimeSlot = getEventsForDate(
                    selectedDate
                  ).filter((event) => {
                    // Sadece tüm gün olmayan etkinlikleri filtrele
                    if (event.isAllDay) return false;

                    const eventStart = new Date(event.startDateTime);
                    const eventStartHour = eventStart.getHours();
                    const eventStartMinute = eventStart.getMinutes();

                    // Belirli zaman dilimine denk gelen etkinlikleri kontrol et
                    return (
                      eventStartHour === hour &&
                      ((minute === 0 && eventStartMinute < 30) ||
                        (minute === 30 &&
                          eventStartMinute >= 30 &&
                          eventStartMinute < 60))
                    );
                  });

                  return (
                    <div
                      key={timeSlotIndex}
                      className={`flex border-b border-gray-200 dark:border-gray-600 ${
                        isFullHour
                          ? "border-t border-gray-300 dark:border-gray-500"
                          : ""
                      }`}
                    >
                      <div className="w-16 px-2 py-4 text-right text-sm text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 flex items-center justify-end">
                        {hour.toString().padStart(2, "0")}:
                        {minute.toString().padStart(2, "0")}
                      </div>

                      {/* Etkinlik Bölümü */}
                      <div
                        className="flex-1 min-h-[4rem] p-1 hover:bg-[#e6e5e5] dark:hover:bg-[#3f4041] cursor-pointer"
                        onClick={() => {
                          const newSelectedDate = new Date(selectedDate);
                          newSelectedDate.setHours(hour, minute, 0, 0);
                          setSelectedDate(newSelectedDate);
                          openModal();
                        }}
                      >
                        {eventsForTimeSlot.length > 0 &&
                          renderEvents(eventsForTimeSlot, false)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
