"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "../../../context/TasksContext/TasksContext";

export default function TasksWidget() {
  const router = useRouter();
  const [displayTasks, setDisplayTasks] = useState([]);
  const {
    tasks,
    loading,
    error,
    tasksUpdated,
    toggleTaskCompletion,
    fetchTasks,
  } = useTasks();

  useEffect(() => {
    fetchTasks();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTasks();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const activeTasks = tasks
        .filter((task) => !task.completed)
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        })
        .slice(0, 5);

      setDisplayTasks(activeTasks);
    } else {
      setDisplayTasks([]);
    }
  }, [tasks, tasksUpdated]);

  // Görev tamamlanma durumunu değiştirme
  const toggleComplete = async (taskId, e) => {
    e.stopPropagation();
    await toggleTaskCompletion(taskId);
  };

  // Görevler sayfasına yönlendirme
  const navigateToTasksPage = (taskId = null) => {
    if (taskId) {
      router.push(`/tasks?taskId=${taskId}`);
    } else {
      router.push("/tasks");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Görevlerim</h3>
        <button
          onClick={navigateToTasksPage}
          className="px-3 py-1 text-xs rounded-md border border-gray-300 dark:border-[#686565] bg-gray-100 dark:bg-[#2a2c30] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#36373a] transition-colors flex items-center"
        >
          <span className="mr-1">Tümünü Gör</span>
          <span className="material-icons-round" style={{ fontSize: "14px" }}>
            arrow_forward
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#26282b] dark:border-[#f3f3f3]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center my-4 text-sm">{error}</div>
      ) : displayTasks.length > 0 ? (
        <div className="custom-scrollbar overflow-y-auto flex-grow">
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #d1d5db;
              border-radius: 20px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #9ca3af;
            }
            :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #4b5563;
            }
            :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #6b7280;
            }
          `}</style>
          <ul className="divide-y divide-gray-200 dark:divide-[#48494a]">
            {displayTasks.map((task) => (
              <li
                key={task.id}
                className="py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#48494a] rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(task.id, e);
                    }}
                    className="flex-shrink-0 mr-2"
                  >
                    <span
                      className={`material-icons-round ${
                        task.completed
                          ? "text-[#26282b]/90 dark:text-[#f3f3f3]/80"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      style={{ fontSize: "18px" }}
                    >
                      {task.completed
                        ? "check_circle"
                        : "radio_button_unchecked"}
                    </span>
                  </button>

                  <div
                    className="flex-1 min-w-0"
                    onClick={() => navigateToTasksPage(task.id)}
                  >
                    <h4
                      className={`text-sm font-medium truncate ${
                        task.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : ""
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.date && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span
                          className="material-icons-round mr-1"
                          style={{ fontSize: "10px" }}
                        >
                          event
                        </span>
                        {new Date(task.date).toLocaleDateString("tr-TR")}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-full">
          <span
            className="material-icons-round text-gray-400 mb-2"
            style={{ fontSize: "36px" }}
          >
            task_alt
          </span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Henüz görev eklenmemiş
          </p>
          <button
            onClick={navigateToTasksPage}
            className="mt-4 text-sm text-[#26282b] dark:text-[#f3f3f3] flex items-center"
          >
            <span
              className="material-icons-round mr-1"
              style={{ fontSize: "14px" }}
            >
              add
            </span>
            Görev ekle
          </button>
        </div>
      )}
    </div>
  );
}
