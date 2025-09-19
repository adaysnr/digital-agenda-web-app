"use client";

import Layout from "../Layout/Layout";
import CalendarWidget from "../CalendarWidget/CalendarWidget";
import WeatherWidget from "../WeatherWidget/WeatherWidget";
import TasksWidget from "../TasksWidget/TasksWidget";
import NotesWidget from "../NotesWidget/NotesWidget";
import WeeklyProgressWidget from "../WeeklyProgressWidget/WeeklyProgressWidget";

export default function HomePage() {
  return (
    <Layout title="Hoşgeldiniz!">
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Görevler Widget'ı */}
        <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-6 h-[290px] overflow-auto">
          <TasksWidget />
        </div>

        {/* Notlar Widget'ı */}
        <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-6 h-[290px] overflow-auto">
          <NotesWidget />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Takvim Widget'ı */}
        <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-2 h-[280px] overflow-auto lg:col-span-4">
          <CalendarWidget />
        </div>

        {/* Hava Durumu Widget'ı */}
        <div className="rounded-lg shadow-md overflow-hidden h-[280px] lg:col-span-3">
          <div
            className="bg-no-repeat bg-cover bg-center h-full w-full"
            style={{ backgroundImage: "url('/weather-bg.png')" }}
          >
            <div className="bg-white/75 dark:bg-[#36373a]/85 h-full p-4 overflow-auto">
              <WeatherWidget />
            </div>
          </div>
        </div>

        {/* Haftalık İlerleme Widget'ı */}
        <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-6 h-[280px] overflow-auto lg:col-span-5">
          <WeeklyProgressWidget />
        </div>
      </section>
    </Layout>
  );
}
