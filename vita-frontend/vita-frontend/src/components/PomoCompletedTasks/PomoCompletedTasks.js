"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useTaskContext } from "../../../context/PomoTasksContext";

const PomoCompletedTasks = () => {
  const [apiCompletedTasks, setApiCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    taskUpdated,
    completedTasks: contextCompletedTasks,
    deleteCompletedTask,
  } = useTaskContext();

  useEffect(() => {
    fetchCompletedTasks();
  }, [taskUpdated]);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      const data = await api.request.get("/pomodoroTasks/completed");
      setApiCompletedTasks(data);
      setError(null);
    } catch (err) {
      setError("Tamamlanan görevleri yüklerken bir hata oluştu.");
      setApiCompletedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const allCompletedTasks = [
    ...apiCompletedTasks,
    ...contextCompletedTasks,
  ].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.completedAt || Date.now());
    const dateB = new Date(b.updatedAt || b.completedAt || Date.now());
    return dateB - dateA;
  });

  // Bir görevi silme fonksiyonu
  const handleDeleteTask = async (taskId, isApiTask) => {
    try {
      if (isApiTask) {
        await api.request.delete(`/pomodoroTasks/${taskId}`);
        setApiCompletedTasks(
          apiCompletedTasks.filter((task) => task.id !== taskId)
        );
      } else {
        deleteCompletedTask(taskId);
      }
    } catch (err) {
      setError("Görev silinirken bir hata oluştu.");
    }
  };

  return (
    // Tamamlanan görevlerin listeleneceği alan
    <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md px-8 py-6 h-full flex flex-col">
      {/* Başlık */}
      <h3 className="font-bold dark:text-[#f3f3f3] mb-4 border-b pb-2 border-[#d5d8db] dark:border-[#686565]">
        Tamamlanan Görevler
      </h3>

      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-xs">
          {error}
          <button className="ml-2 text-red-700" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {/* Görev Listesi */}
      <div className="overflow-y-auto max-h-40 h-40 flex-1">
        {loading && apiCompletedTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">
            Yükleniyor...
          </p>
        ) : allCompletedTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">
            Henüz tamamlanmış görev yok
          </p>
        ) : (
          <ul className="space-y-1">
            {allCompletedTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start overflow-hidden py-1"
              >
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 accent-[#26282b] dark:accent-[#f3f3f3] border-[#26282b] dark:border-[#f3f3f3] focus:ring-[#26282b] dark:focus:ring-[#f3f3f3]"
                />
                <span className="flex-grow text-sm overflow-hidden break-words line-through text-gray-500 dark:text-gray-400">
                  {task.taskContent}
                </span>
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {new Date(
                    task.updatedAt || task.completedAt || Date.now()
                  ).toLocaleDateString()}
                </span>
                <button
                  onClick={() =>
                    handleDeleteTask(
                      task.id,
                      Boolean(task._id || task.updatedAt || task.createdAt)
                    )
                  }
                  className="ml-2 text-xs text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PomoCompletedTasks;
