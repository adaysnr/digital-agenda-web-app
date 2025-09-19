"use client";

import { createContext, useContext, useState } from "react";
import TimerModal from "@/components/TimerModal/TimerModal";

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerModalType, setTimerModalType] = useState("work");

  return (
    <TimerContext.Provider
      value={{
        setShowTimerModal,
        setTimerModalType,
      }}
    >
      {children}
      <TimerModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        type={timerModalType}
      />
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
