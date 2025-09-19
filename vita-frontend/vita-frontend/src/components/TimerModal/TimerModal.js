"use client";

export default function TimerModal({ isOpen, onClose, type }) {
  if (!isOpen) return null;

  const isWorkSession = type === "break"; // type "break" ise çalışma süresi bitmiştir
  const icon = isWorkSession ? "coffee" : "task_alt";
  const title = isWorkSession ? "Mola Zamanı!" : "Çalışma Zamanı!";
  const message = isWorkSession
    ? "Çalışma süreniz tamamlandı. Şimdi kısa bir mola verin."
    : "Mola süreniz tamamlandı. Çalışmaya devam edebilirsiniz.";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#36373a] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100 animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 bg-[#26282b]/10 dark:bg-white/10 rounded-full p-4">
            <span className="material-icons-round text-4xl text-[#26282b] dark:text-white">
              {icon}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#26282b] dark:text-white">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-[#26282b] text-white dark:bg-[#f3f3f3] dark:text-[#26282b] px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
