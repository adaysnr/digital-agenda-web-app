"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import { useTaskContext } from "../../../context/PomoTasksContext";

const PomoTasks = () => {
  const [apiTasks, setApiTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Context'ten gerekli değerleri al
  const {
    tasks: contextTasks,
    addTask,
    deleteTask,
    completeTask,
    updateTasks,
    taskUpdated,
  } = useTaskContext();

  // Görevleri API'den al
  useEffect(() => {
    fetchTasks();
  }, [taskUpdated]); // taskUpdated değiştiğinde verileri yenile

  // Görevleri getirme fonksiyonu
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.request.get("/pomodoroTasks");
      setApiTasks(data);
      setError(null);    } catch (err) {
      setError("Görevleri yüklerken bir hata oluştu.");

      // Hata durumunda boş bir dizi ayarla
      setApiTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // API'den ve Context'ten gelen görevleri birleştir
  const allTasks = [...apiTasks, ...contextTasks].filter(
    (task) => !task.completed && !task.isCompleted
  );

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      try {
        const tempId = `temp-${Date.now()}`;
        const tempTask = {
          id: tempId,
          taskContent: newTask,
          completed: false,
          isCompleted: false,
        };

        addTask(tempTask);

        setNewTask("");
        setShowInput(false);

        try {
          const savedTask = await api.request.post("/pomodoroTasks", {
            taskContent: newTask,
          });

          deleteTask(tempId);
          fetchTasks();        } catch (apiError) {
          // Handle API error silently
        }
      } catch (err) {
        setError("Görev eklenirken bir hata oluştu.");
      }
    }
  };

  // Görev silme
  const handleDelete = async (id, isApiTask) => {
    try {
      if (isApiTask) {
        await api.request.delete(`/pomodoroTasks/${id}`);
        setApiTasks(apiTasks.filter((task) => task.id !== id));
      } else {
        deleteTask(id);
      }    } catch (err) {
      setError("Görev silinirken bir hata oluştu.");
      fetchTasks();
    }
  };

  // Görev tamamlama durumunu değiştirme
  const handleToggleComplete = async (id, isApiTask) => {
    try {
      if (isApiTask) {
        const task = apiTasks.find((t) => t.id === id);
        if (!task) return;

        setApiTasks(
          apiTasks.map((t) => (t.id === id ? { ...t, isCompleted: true } : t))
        );

        setTimeout(() => {
          setApiTasks(apiTasks.filter((t) => t.id !== id));
        }, 800);

        await api.request.put(`/pomodoroTasks/${id}`, {
          isCompleted: true,
        });

        updateTasks();
      } else {
        completeTask(id);
      }    } catch (err) {
      setError("Görev güncellenirken bir hata oluştu.");
      fetchTasks();
    }
  };

  return (
    // Aktif görevlerin listeleneceği alan
    <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md px-8 py-6 h-full flex flex-col">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-3 border-b pb-2 border-[#d5d8db] dark:border-[#686565]">
        <h3 className="font-bold dark:text-[#f3f3f3]">Pomodoro Görevleri</h3>
        <button
          onClick={() => setShowInput(!showInput)}
          className="w-5 h-5 flex items-center justify-center bg-[#26282b] text-white dark:bg-[#f3f3f3] dark:text-[#26282b] rounded-sm text-lg"
        >
          {showInput ? "×" : "+"}
        </button>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-xs">
          {error}
          <button className="ml-2 text-red-700" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {/* Geçici görev girişi */}
      {showInput && (
        <form onSubmit={handleAddTask} className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Yeni görev..."
              autoFocus
              className="flex-grow text-sm p-1.5 border rounded-md border-[#d5d8db] bg-white dark:text-[#26282b] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newTask.trim()}
              className={`px-3 py-1.5 text-sm rounded-md ${
                newTask.trim()
                  ? "bg-[#26282b] text-white dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  : "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              Ekle
            </button>
          </div>
        </form>
      )}

      {/* Görev Listesi */}
      <div className="overflow-y-auto max-h-40 h-40 flex-1">
        {loading && allTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">
            Yükleniyor...
          </p>
        ) : allTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-2 text-sm">
            Görev listesi boş
          </p>
        ) : (
          <ul className="space-y-1">
            {allTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start overflow-hidden py-1"
              >
                <input
                  type="checkbox"
                  checked={task.isCompleted || task.completed}
                  onChange={() =>
                    handleToggleComplete(
                      task.id,
                      !task.id.toString().startsWith("temp-") &&
                        Boolean(task.updatedAt || task.createdAt)
                    )
                  }
                  className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 accent-[#26282b] dark:accent-[#f3f3f3] border-[#26282b] dark:border-[#f3f3f3] focus:ring-[#26282b] dark:focus:ring-[#f3f3f3]"
                />
                <span
                  className={`flex-grow text-sm overflow-hidden break-words ${
                    task.isCompleted || task.completed
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : ""
                  }`}
                >
                  {task.taskContent}
                </span>
                <button
                  onClick={() =>
                    handleDelete(
                      task.id,
                      !task.id.toString().startsWith("temp-") &&
                        Boolean(task.updatedAt || task.createdAt)
                    )
                  }
                  className="ml-2 text-red-[#26282b] dark:text-red-[#f3f3f3] hover:text-red-500 text-sm"
                  title="Sil"
                >
                  <span
                    className="material-icons-round"
                    style={{ fontSize: "18px" }}
                  >
                    delete
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PomoTasks;
