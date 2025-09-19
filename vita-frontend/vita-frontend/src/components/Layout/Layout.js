"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Menu from "../Menu/Menu";
import PageHeader from "../PageHeader/PageHeader";
import api from "../../../services/api";

export default function Layout({ children, className, title, headerContent }) {
  const [darkMode, setDarkMode] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false); // Notification state
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false); // Notification modal state
  const [upcomingEvents, setUpcomingEvents] = useState([]); // Upcoming events state
  const [upcomingTasks, setUpcomingTasks] = useState([]); // Upcoming tasks state
  const notificationRef = useRef(null); // Ref for notification modal positioning

  const pathname = usePathname();
  const isCalendarPage = pathname === "/calendar";

  useEffect(() => {
    // Sayfa yüklendiğinde mevcut tema durumunu `localStorage`'dan al
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Sayfa yüklendiğinde yarınki etkinlikleri kontrol et
    fetchUpcomingEvents();
  }, []);

  // Tema değiştirme fonksiyonu
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  // Bildirim butonuna tıklama işlevi
  const handleNotificationClick = async () => {
    await Promise.all([fetchUpcomingEvents(), fetchUpcomingTasks()]);
    setIsNotificationModalOpen(!isNotificationModalOpen);
  };
  // Yaklaşan görevleri getir
  const fetchUpcomingTasks = async () => {
    try {
      const response = await api.tasks.getTasks();
      const preferences = JSON.parse(
        localStorage.getItem("notificationPreferences") || '{"task":true}'
      );

      // Görev bildirimleri kapalıysa boş array dön
      if (!preferences.task) {
        setUpcomingTasks([]);
        return;
      }

      if (response && Array.isArray(response)) {
        // Bugün ve yarının tarihlerini yerel saat dilimine göre hesapla
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Tarihleri YYYY-MM-DD formatına çevir
        const todayDateStr = today.toLocaleDateString("en-CA");
        const tomorrowDateStr = tomorrow.toLocaleDateString("en-CA");

        const tasks = response
          .filter((task) => {
            // Eğer görev tamamlanmışsa ya da tarihi yoksa, gösterme
            if (task.isCompleted || !task.taskDate) {
              return false;
            }

            // API'den gelen tarihi yerel saat dilimine çevirme
            const taskDate = new Date(task.taskDate);
            taskDate.setHours(0, 0, 0, 0);
            const taskDateStr = taskDate.toLocaleDateString("en-CA");

            // Bugün veya yarın için olan görevleri filtrele
            return (
              taskDateStr === todayDateStr || taskDateStr === tomorrowDateStr
            );
          })
          .sort((a, b) => {
            // Önce tarihe göre sırala
            const dateA = new Date(a.taskDate);
            const dateB = new Date(b.taskDate);
            return dateA - dateB;
          })
          .map((task) => {
            const taskDate = new Date(task.taskDate);
            taskDate.setHours(0, 0, 0, 0);
            const taskDateStr = taskDate.toLocaleDateString("en-CA");

            return {
              id: task.id,
              title: task.taskHeader,
              date: task.taskDate,
              priority: task.priority,
              dayType: taskDateStr === todayDateStr ? "today" : "tomorrow",
            };
          });

        setUpcomingTasks(tasks);
      }
    } catch (error) {
      // Handle error silently in production
    }
  };
  // Bugünkü ve yarınki etkinlikleri getir
  const fetchUpcomingEvents = async () => {
    try {
      const response = await api.calendar.getEvents();
      const preferences = JSON.parse(
        localStorage.getItem("notificationPreferences") || '{"calendar":false}'
      );

      // Takvim bildirimleri kapalıysa boş array dön
      if (!preferences.calendar) {
        setUpcomingEvents([]);
        return;
      }

      if (response && Array.isArray(response)) {
        // Bugün ve yarının tarihlerini hesapla
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayDateStr = today.toISOString().split("T")[0];
        const tomorrowDateStr = tomorrow.toISOString().split("T")[0];

        // API'den gelen etkinlikleri formatla
        const events = response.map((event) => {
          const dateStr = event.eventDate.split("T")[0];
          const parsedDate = new Date(`${dateStr}T00:00:00`);

          // API'den gelen verilerin tarih formatını düzeltme
          parsedDate.setDate(parsedDate.getDate() + 1);
          const correctedDateStr = parsedDate.toISOString().split("T")[0];

          const startTime = event.startTime || "00:00:00";
          const startDateTime = new Date(`${correctedDateStr}T${startTime}`);

          return {
            id: event.id,
            title: event.description,
            description: event.description,
            startDateTime: startDateTime,
            isAllDay: Boolean(event.isAllDay),
            rawDate: correctedDateStr,
            rawStartTime: startTime,
            dayType: correctedDateStr === todayDateStr ? "today" : "tomorrow",
          };
        }); // Bugünkü ve yarınki etkinlikleri filtrele
        const filteredEvents = events.filter(
          (event) =>
            event.rawDate === todayDateStr || event.rawDate === tomorrowDateStr
        ); // Kronolojik sıralama ve gün başlıklarıyla gruplandırma
        const sortedEvents = filteredEvents.sort((a, b) => {
          if (a.rawDate !== b.rawDate) {
            return a.rawDate.localeCompare(b.rawDate);
          }
          return a.rawStartTime.localeCompare(b.rawStartTime);
        });

        // Bildirim göstergesini etkinlik varsa aktifleştir
        setHasNotifications(filteredEvents.length > 0);
        setUpcomingEvents(sortedEvents);
      }
    } catch (error) {
      // Handle error silently in production
    }
  };
  // Modal dışına tıklama ile kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationModalOpen]);
  // Sayfa yüklendiğinde sadece bildirimleri kontrol et (modalı açmadan)
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const [events, tasks] = await Promise.all([
          api.calendar.getEvents(),
          api.tasks.getTasks(),
        ]);

        // Bugün ve yarının tarihlerini hesapla yerel saat dilimine göre
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Tarihleri YYYY-MM-DD formatına çevir
        const todayDateStr = today.toLocaleDateString("en-CA");
        const tomorrowDateStr = tomorrow.toLocaleDateString("en-CA");

        // Görevleri kontrol et
        const upcomingTasks = tasks.filter((task) => {
          if (task.isCompleted) return false;
          if (!task.taskDate) return false;

          const taskDate = new Date(task.taskDate);
          taskDate.setHours(0, 0, 0, 0);
          const taskDateStr = taskDate.toLocaleDateString("en-CA");

          return (
            taskDateStr === todayDateStr || taskDateStr === tomorrowDateStr
          );
        });

        // Etkinlikleri kontrol et
        const upcomingEvents = events.filter((event) => {
          const dateStr = event.eventDate.split("T")[0];
          const parsedDate = new Date(dateStr + "T00:00:00");
          parsedDate.setDate(parsedDate.getDate() + 1);
          const correctedDateStr = parsedDate.toISOString().split("T")[0];
          return (
            correctedDateStr === todayDateStr ||
            correctedDateStr === tomorrowDateStr
          );
        });
        const preferences = JSON.parse(
          localStorage.getItem("notificationPreferences") ||
            '{"task":true,"calendar":false}'
        );

        // Bildirim durumunu tercihlere göre güncelle
        const hasTaskNotifications =
          preferences.task && upcomingTasks.length > 0;
        const hasEventNotifications =
          preferences.calendar && upcomingEvents.length > 0;

        setHasNotifications(hasTaskNotifications || hasEventNotifications);
      } catch (error) {
        // Handle error silently in production
      }
    };

    checkNotifications();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sol taraftaki sabit menü */}
      <aside className="w-64 h-screen fixed top-0 left-0 z-20">
        <Menu />
      </aside>

      {/* Ana içerik alanı */}
      <main className="flex-1 ml-60 relative">
        {/* Header bölümü - tema değiştirme butonu ve opsiyonel headerContent */}
        <div className="fixed top-0 right-0 p-4 flex items-center z-10 gap-4">
          {/* Takvim kontrollerini sadece headerContent varsa göster */}
          {headerContent && (
            <div className="mr-2 bg-white dark:bg-[#36373a] p-1 rounded-md shadow-md">
              {headerContent}
            </div>
          )}
          {/* Bildirim butonu */}{" "}
          <button
            onClick={handleNotificationClick}
            className={
              isCalendarPage
                ? "fixed top-10 right-24 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#4c4d51] hover:bg-gray-100 dark:hover:bg-[#26282b] text-gray-700 dark:text-gray-300 transition-colors shadow-md z-10" // Takvim sayfasında düğmenin konumu
                : "fixed top-6 right-24 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#36373a] hover:bg-gray-100 dark:hover:bg-[#505357] text-gray-700 dark:text-gray-300 transition-colors shadow-md z-10" // Normal konumu
            }
            aria-label="Bildirimler"
            title="Bildirimler"
          >
            {" "}
            <div className="relative flex items-center justify-center">
              {" "}
              <span
                className="material-icons-round"
                style={{ fontSize: "20px" }}
              >
                notifications
              </span>
              {hasNotifications && (
                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </div>
          </button>
          {/* Bildirim Modalı */}
          {isNotificationModalOpen && (
            <div
              ref={notificationRef}
              className={
                isCalendarPage
                  ? "fixed top-20 right-24 w-80 bg-white dark:bg-[#434447] shadow-lg rounded-lg z-50 border border-gray-200 dark:border-gray-600"
                  : "fixed top-16 right-24 w-80 bg-white dark:bg-[#434447] shadow-lg rounded-lg z-50 border border-gray-200 dark:border-gray-600"
              }
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold">Bildirimler</h3>
                <button
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                >
                  <span
                    className="material-icons-round"
                    style={{ fontSize: "18px" }}
                  >
                    close
                  </span>
                </button>
              </div>{" "}
              <div className="max-h-80 overflow-y-auto">
                {upcomingEvents.length > 0 || upcomingTasks.length > 0 ? (
                  <div className="p-3">
                    {/* Bugünkü içerikler */}
                    {(upcomingEvents.some(
                      (event) => event.dayType === "today"
                    ) ||
                      upcomingTasks.some(
                        (task) => task.dayType === "today"
                      )) && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                          BUGÜN
                        </h4>
                        <div>
                          {/* Bugünkü etkinlikler */}
                          {upcomingEvents
                            .filter((event) => event.dayType === "today")
                            .map((event) => (
                              <div key={`event-${event.id}`} className="py-2">
                                <div className="flex items-start">
                                  <span
                                    className="material-icons-round text-[#26282b] dark:text-[#f3f3f3] mt-0.5 mr-2"
                                    style={{ fontSize: "18px" }}
                                  >
                                    {event.isAllDay ? "event" : "schedule"}
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                      {event.description}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {event.isAllDay
                                        ? "Tüm Gün"
                                        : new Date(
                                            event.startDateTime
                                          ).toLocaleTimeString("tr-TR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {/* Bugünkü görevler */}
                          {upcomingTasks
                            .filter((task) => task.dayType === "today")
                            .map((task) => (
                              <div key={`task-${task.id}`} className="py-2">
                                <div className="flex items-start">
                                  <span
                                    className={`material-icons-round mt-0.5 mr-2 ${
                                      task.priority === "high"
                                        ? "text-red-500 dark:text-red-400"
                                        : task.priority === "medium"
                                        ? "text-amber-500 dark:text-amber-400"
                                        : "text-blue-500 dark:text-blue-400"
                                    }`}
                                    style={{ fontSize: "18px" }}
                                  >
                                    task_alt
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                      {task.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Son tarih:{" "}
                                      {new Date(task.date).toLocaleDateString(
                                        "tr-TR"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Yarınki içerikler */}
                    {(upcomingEvents.some(
                      (event) => event.dayType === "tomorrow"
                    ) ||
                      upcomingTasks.some(
                        (task) => task.dayType === "tomorrow"
                      )) && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                          YARIN
                        </h4>
                        <div>
                          {/* Yarınki etkinlikler */}
                          {upcomingEvents
                            .filter((event) => event.dayType === "tomorrow")
                            .map((event) => (
                              <div key={`event-${event.id}`} className="py-2">
                                <div className="flex items-start">
                                  <span
                                    className="material-icons-round text-[#26282b] dark:text-[#f3f3f3] mt-0.5 mr-2"
                                    style={{ fontSize: "18px" }}
                                  >
                                    {event.isAllDay ? "event" : "schedule"}
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                      {event.description}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {event.isAllDay
                                        ? "Tüm Gün"
                                        : new Date(
                                            event.startDateTime
                                          ).toLocaleTimeString("tr-TR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}

                          {/* Yarınki görevler */}
                          {upcomingTasks
                            .filter((task) => task.dayType === "tomorrow")
                            .map((task) => (
                              <div key={`task-${task.id}`} className="py-2">
                                <div className="flex items-start">
                                  <span
                                    className={`material-icons-round mt-0.5 mr-2 ${
                                      task.priority === "high"
                                        ? "text-red-500 dark:text-red-400"
                                        : task.priority === "medium"
                                        ? "text-amber-500 dark:text-amber-400"
                                        : "text-blue-500 dark:text-blue-400"
                                    }`}
                                    style={{ fontSize: "18px" }}
                                  >
                                    task_alt
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                      {task.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Son tarih:{" "}
                                      {new Date(task.date).toLocaleDateString(
                                        "tr-TR"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <span
                      className="material-icons-round block mx-auto mb-2"
                      style={{ fontSize: "24px" }}
                    >
                      event_busy
                    </span>
                    <p>
                      Bugün ve yarın için planlanmış etkinlik veya görev
                      bulunmuyor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Tema değiştirme butonu - sağ üst köşeye sabitlenmiş */}
          <button
            onClick={toggleDarkMode}
            className={
              isCalendarPage
                ? "fixed top-10 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#4c4d51] hover:bg-gray-100 dark:hover:bg-[#26282b] text-gray-700 dark:text-gray-300 transition-colors shadow-md z-10" // Takvim sayfasında düğmenin konumu
                : "fixed top-6 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#36373a] hover:bg-gray-100 dark:hover:bg-[#505357] text-gray-700 dark:text-gray-300 transition-colors shadow-md z-10" // Normal konumu
            }
            aria-label={darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
            title={darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
          >
            <span className="material-icons-round" style={{ fontSize: "20px" }}>
              {darkMode ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>

        {/* Sayfa içeriği buraya gelecek */}
        <section className="p-6">
          <header>
            <PageHeader>{title}</PageHeader>
          </header>
          <article>{children}</article>
        </section>
      </main>
    </div>
  );
}
