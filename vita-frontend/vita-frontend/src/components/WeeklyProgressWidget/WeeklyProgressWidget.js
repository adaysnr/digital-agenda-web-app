"use client";

import { useState, useEffect } from "react";
import { useTasks } from "../../../context/TasksContext/TasksContext";

export default function WeeklyProgressWidget() {
  const [tooltipInfo, setTooltipInfo] = useState({
    visible: false,
    day: "",
    count: 0,
    x: 0,
    y: 0,
  });

  const { weeklyProgress, loading, error, tasksUpdated } = useTasks();
  const maxCount = Math.max(
    ...(weeklyProgress?.map((day) => day.count) || []),
    5 // Minimum bölme sayısı 5 olsun
  );

  const showTooltip = (day, count, event) => {
    setTooltipInfo({
      visible: true,
      day,
      count,
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY - 10,
    });
  };

  const hideTooltip = () => {
    setTooltipInfo({ ...tooltipInfo, visible: false });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Widget Başlığı */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Haftalık İlerleme</h3>
      </div>

      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#26282b] dark:border-[#f3f3f3]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center my-4 text-sm">{error}</div>
      ) : (
        <div className="flex flex-col flex-grow justify-end relative">
          {/* Grafik Alanı */}
          <div className="w-full flex items-end justify-between gap-2 mb-3 h-[140px] relative">
            {weeklyProgress.map((day, index) => {
              // Sütun yüksekliği hesapla (maxCount'a göre orantılı)
              const columnHeight =
                day.count > 0
                  ? Math.max(15, (day.count / maxCount) * 140) // En az 15px yükseklik
                  : 2; // Görev yoksa çok küçük bir gösterge (2px)

              // Bugün için özel renk uygula
              const isToday = new Date().getDay() === (index + 1) % 7; // Pazartesi: 1, ... Pazar: 0

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1"
                  onMouseEnter={(e) => showTooltip(day.day, day.count, e)}
                  onMouseMove={(e) => showTooltip(day.day, day.count, e)}
                  onMouseLeave={hideTooltip}
                >
                  <div className="w-full flex flex-col items-center">
                    {/* Sütun */}
                    <div
                      className={`w-full mx-1 rounded-t-md transition-all duration-300
                        ${
                          isToday
                            ? "bg-[#26282b] dark:bg-[#f3f3f3]"
                            : "bg-[#26282b]/70 dark:bg-[#f3f3f3]/70 hover:bg-[#26282b]/90 dark:hover:bg-[#f3f3f3]/90"
                        }`}
                      style={{ height: `${columnHeight}px` }}
                    />

                    {/* Gün etiketi */}
                    <div
                      className={`text-xs mt-1 font-medium ${
                        isToday
                          ? "text-[#26282b] dark:text-[#f3f3f3]"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {day.day}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Tooltip */}
            {tooltipInfo.visible && (
              <div
                className="absolute bg-[#26282b] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] px-2 py-1 rounded text-xs z-10 pointer-events-none"
                style={{
                  left: `${tooltipInfo.x}px`,
                  top: `${tooltipInfo.y - 30}px`,
                }}
              >
                <div className="font-medium">{tooltipInfo.day}</div>
                <div>{tooltipInfo.count} görev tamamlandı</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
