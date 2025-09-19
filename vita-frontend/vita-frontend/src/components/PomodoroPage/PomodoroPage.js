"use client";

import { useState, useEffect } from "react";
import { TaskProvider } from "../../../context/PomoTasksContext";
import { useTimer } from "../../../context/TimerContext";
import Layout from "../Layout/Layout";
import PomoTasks from "../PomoTasks/PomoTasks";
import PomoCompletedTasks from "../PomoCompletedTasks/PomoCompletedTasks";

export default function PomodoroPage() {
  const { setShowTimerModal, setTimerModalType } = useTimer();
  const [isSession, setIsSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionLength, setSessionLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [isEditingBreak, setIsEditingBreak] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      const newType = isSession ? "break" : "work";
      if (setShowTimerModal && setTimerModalType) {
        setTimerModalType(newType);
        setShowTimerModal(true);
      }
      setIsSession(!isSession);
      setTimeLeft(isSession ? breakLength * 60 : sessionLength * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isSession, sessionLength, breakLength]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionLength(25);
    setBreakLength(5);
    if (isSession) {
      setTimeLeft(25 * 60);
    } else {
      setTimeLeft(5 * 60);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const incrementSession = () => {
    if (sessionLength < 60) {
      setSessionLength(sessionLength + 1);
      if (isSession) {
        setTimeLeft((sessionLength + 1) * 60);
      }
    }
  };

  const decrementSession = () => {
    if (sessionLength > 1) {
      setSessionLength(sessionLength - 1);
      if (isSession) {
        setTimeLeft((sessionLength - 1) * 60);
      }
    }
  };

  const incrementBreak = () => {
    if (breakLength < 60) {
      setBreakLength(breakLength + 1);
      if (!isSession) {
        setTimeLeft((breakLength + 1) * 60);
      }
    }
  };

  const decrementBreak = () => {
    if (breakLength > 1) {
      setBreakLength(breakLength - 1);
      if (!isSession) {
        setTimeLeft((breakLength - 1) * 60);
      }
    }
  };
  const handleSessionInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 60) {
      setSessionLength(value);
      if (isSession) {
        setTimeLeft(value * 60);
      }
    }
  };

  const handleBreakInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 60) {
      setBreakLength(value);
      if (!isSession) {
        setTimeLeft(value * 60);
      }
    }
  };

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "session") {
        setIsEditingSession(false);
      } else {
        setIsEditingBreak(false);
      }
    }
  };

  return (
    <Layout title="Pomodoro">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <section className="lg:col-span-2 bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md px-6 py-16 h-full overflow-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-10 text-center">
              {/* Başlık */}
              <div className="flex items-center justify-center gap-2 mb-12 border-b border-[#d5d8db] dark:border-[#686565]">
                <button
                  className={`px-4 py-2 text-xl font-bold ${
                    isSession
                      ? "text-[#26282b] dark:text-white border-b-2 border-[#26282b] dark:border-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-[#26282b] dark:hover:text-white"
                  }`}
                  onClick={() => {
                    setIsSession(true);
                    setTimeLeft(sessionLength * 60);
                    setIsActive(false);
                  }}
                >
                  Çalışma Süresi
                </button>
                <button
                  className={`px-4 py-2 text-xl font-bold ${
                    !isSession
                      ? "text-[#26282b] dark:text-[#f3f3f3] border-b-2 border-[#26282b] dark:border-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-[#26282b] dark:hover:text-[#f3f3f3]"
                  }`}
                  onClick={() => {
                    setIsSession(false);
                    setTimeLeft(breakLength * 60);
                    setIsActive(false);
                  }}
                >
                  Mola Süresi
                </button>
              </div>

              {/* Zamanlayıcıyı gösteren bölüm */}
              <div className="text-9xl xl:text-[120px] font-bold text-[#26282b] dark:text-[#f3f3f3] xl:mb-10">
                {formatTime(timeLeft)}
              </div>

              {/* Zamanlayıcıyı başlatma/durdurma ve sıfırlama butonları */}
              <div className="flex items-center justify-center mt-8 gap-2 border-b pb-10 border-[#d5d8db] dark:border-[#686565]">
                <button
                  className="bg-[#26282b] text-white border-2 border-[#26282b] dark:bg-[#f3f3f3] dark:border-[#f3f3f3] dark:text-[#26282b] px-4 py-2 rounded-md mr-4"
                  onClick={toggleTimer}
                >
                  {isActive ? "Durdur" : "Başlat"}
                </button>
                <button
                  className="bg-none border-2 border-[#26282b] text-[#26282b] dark:border-[#f3f3f3] dark:text-white px-4 py-2 rounded-md"
                  onClick={resetTimer}
                >
                  Sıfırla
                </button>
              </div>
            </div>
          </div>

          {/* Pomodoro ayarları */}
          <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-12 sm:gap-16 md:gap-32 lg:gap-48 xl:gap-72">
            <div className="flex flex-col gap-2">
              <p className="text-lg">Çalışma Süresi</p>{" "}
              <div className="flex items-center justify-center gap-4">
                <button
                  className="flex justify-center items-center w-5 h-5 p-3 bg-[#26282b] rounded-sm text-white font-bold text-xl dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  onClick={decrementSession}
                >
                  -
                </button>
                {isEditingSession ? (
                  <input
                    type="text"
                    value={sessionLength}
                    onChange={handleSessionInputChange}
                    onBlur={() => setIsEditingSession(false)}
                    onKeyDown={(e) => handleKeyDown(e, "session")}
                    className="w-12 text-center text-lg bg-transparent border-b border-[#26282b] dark:border-[#f3f3f3] focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-lg cursor-pointer hover:opacity-80"
                    onClick={() => setIsEditingSession(true)}
                  >
                    {sessionLength}
                  </span>
                )}
                <button
                  className="flex justify-center items-center w-5 h-5 p-3 bg-[#26282b] rounded-sm text-white font-bold text-xl dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  onClick={incrementSession}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-lg">Mola Süresi</p>{" "}
              <div className="flex items-center justify-center gap-4">
                <button
                  className="flex justify-center items-center w-5 h-5 p-3 bg-[#26282b] rounded-sm text-white font-bold text-xl dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  onClick={decrementBreak}
                >
                  -
                </button>
                {isEditingBreak ? (
                  <input
                    type="text"
                    value={breakLength}
                    onChange={handleBreakInputChange}
                    onBlur={() => setIsEditingBreak(false)}
                    onKeyDown={(e) => handleKeyDown(e, "break")}
                    className="w-12 text-center text-lg bg-transparent border-b border-[#26282b] dark:border-[#f3f3f3] focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-lg cursor-pointer hover:opacity-80"
                    onClick={() => setIsEditingBreak(true)}
                  >
                    {breakLength}
                  </span>
                )}
                <button
                  className="flex justify-center items-center w-5 h-5 p-3 bg-[#26282b] rounded-sm text-white font-bold text-xl dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  onClick={incrementBreak}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        <TaskProvider>
          <section className="lg:col-span-1 flex flex-col h-full gap-6">
            {/* Aktif Görevler */}
            <div className="flex-1 h-1/2">
              <PomoTasks />
            </div>

            {/* Tamamlanan Görevler */}
            <div className="flex-1 h-1/2">
              <PomoCompletedTasks />
            </div>
          </section>
        </TaskProvider>
      </div>
    </Layout>
  );
}
