"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CalendarWidget = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Önceki ay için hesaplama
  const prevMonthDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();

  // Takvim günlerini oluşturma
  const createCalendarDays = () => {
    const today = new Date();
    const calendarDays = [];

    // Önceki ayın günleri
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

    // Mevcut ayın günleri
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
      });
    }

    // Sonraki ayın günleri
    const remainingDays = 42 - calendarDays.length; // 6 satır x 7 gün = 42
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

  // Bir önceki aya gitme
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Bir sonraki aya gitme
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Bugüne dön
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Sadece bugüne tıklandığında takvim sayfasına yönlendirme
  const selectDate = (date) => {
    setSelectedDate(date);

    // Bugünün tarihini kontrol et
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      router.push("/calendar");
    }
  };

  return (
    <div className="h-full flex flex-col rounded-lg">
      <div className="flex-1">
        {/* Takvim Başlığı ve Aylar Arası Gezinme */}
        <div className="flex items-center px-2 py-2">
          <div className="flex justify-between items-center flex-1">
            <button
              onClick={prevMonth}
              className="p-1 text-[#26282b] dark:text-white hover:bg-gray-200 dark:hover:bg-[#444548] border border-[#858585] rounded-md hover:shadow-inner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h4 className="text-[#26282b] dark:text-white font-bold text-md ml-6">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>

            <div className="flex items-center">
              <button
                onClick={goToToday}
                className="text-xs py-1 px-2 mr-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#36373a] dark:hover:bg-[#444548] text-[#26282b] dark:text-white rounded border border-[#858585] hover:shadow-inner"
              >
                Bugün
              </button>

              <button
                onClick={nextMonth}
                className="p-1 text-[#26282b] dark:text-white hover:bg-gray-200 dark:hover:bg-[#444548] border border-[#858585] rounded-md hover:shadow-inner"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Haftanın Günleri */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-[13px] text-gray-500 dark:text-gray-400 font-medium py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Takvim Günleri */}
        <div className="grid grid-cols-7 gap-1.5">
          {createCalendarDays().map((day, index) => (
            <div key={index} className="flex justify-center items-center">
              <button
                onClick={() => day.currentMonth && selectDate(day.date)}
                className={`flex items-center justify-center text-[13px] ${
                  !day.currentMonth
                    ? "text-gray-400 dark:text-gray-600 h-6 w-6"
                    : day.isToday
                    ? "bg-[#36373a] text-white dark:bg-white dark:text-[#26282b] h-6 w-6 rounded-md"
                    : day.isSelected
                    ? "bg-gray-300 dark:bg-gray-500 h-6 w-6 rounded-md"
                    : "hover:bg-gray-100 dark:hover:bg-[#36373a] text-[#26282b] dark:text-white h-6 w-6 rounded-md"
                }`}
              >
                {day.day}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
