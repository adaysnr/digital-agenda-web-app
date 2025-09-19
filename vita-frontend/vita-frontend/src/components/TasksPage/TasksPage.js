"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "../Layout/Layout";
import TaskModal from "../TaskModal/TaskModal";
import api from "../../../services/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Silme modalı için state'ler
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const searchParams = useSearchParams();

  // API'den görevleri yükle
  useEffect(() => {
    fetchTasks();
  }, []);
  // Görevleri backend'den getir
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.tasks.getTasks();
      const formattedTasks = response.map((task) => ({
        id: task.id,
        title: task.taskHeader,
        date: task.taskDate || "", // Tarih zaten YYYY-MM-DD formatında geliyor
        priority: task.priority || "medium",
        completed: task.isCompleted,
        createdAt: task.createdAt,
      }));
      setTasks(formattedTasks);
    } catch (error) {
      // Handle error silently in production
    } finally {
      setLoading(false);
    }
  };
  // Görev ekleme fonksiyonu
  const addTask = async () => {
    if (!newTaskTitle.trim() || !newTaskDate) return;

    setLoading(true);
    try {
      const taskData = {
        title: newTaskTitle,
        date: newTaskDate, // date input'tan gelen değer zaten YYYY-MM-DD formatında
        priority: newTaskPriority,
      };

      const response = await api.tasks.createTask(taskData);
      const newTask = {
        id: response.id,
        title: response.taskHeader,
        date: response.taskDate,
        priority: response.priority,
        completed: response.isCompleted,
        createdAt: response.createdAt,
      };

      setTasks((prevTasks) => [newTask, ...prevTasks]);
      closeModal();
    } catch (error) {
      // Handle error silently in production
    } finally {
      setLoading(false);
    }
  };
  // Görev güncelleme fonksiyonu
  const updateTask = async () => {
    if (!editingTask || !newTaskTitle.trim() || !newTaskDate) return;

    setLoading(true);
    try {
      const taskData = {
        title: newTaskTitle,
        date: newTaskDate, // date input'tan gelen değer zaten YYYY-MM-DD formatında
        priority: newTaskPriority,
        completed: editingTask.completed,
      };

      await api.tasks.updateTask(editingTask.id, taskData);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: newTaskTitle,
                date: newTaskDate,
                priority: newTaskPriority,
              }
            : task
        )
      );

      closeModal();
    } catch (error) {
      // Handle error silently in production
    } finally {
      setLoading(false);
    }
  };

  // Görev silme modalını açma fonksiyonu
  const openDeleteModal = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  // Görev silme fonksiyonu
  const deleteTask = async () => {
    if (!taskToDelete) return;

    setLoading(true);
    try {
      await api.tasks.deleteTask(taskToDelete);
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskToDelete)
      );
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      // Handle error silently in production
    } finally {
      setLoading(false);
    }
  };

  // Görev tamamlanma durumunu değiştirme
  const toggleComplete = async (taskId) => {
    setLoading(true);
    try {
      await api.tasks.toggleTaskCompletion(taskId);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      // Handle error silently in production
    } finally {
      setLoading(false);
    }
  };

  // Modal'ı açmak için
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setNewTaskTitle(task.title);
      setNewTaskDate(task.date || "");
      setNewTaskPriority(task.priority || "medium");
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  // Modal'ı kapatmak için
  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  // Form alanlarını sıfırla
  const resetForm = () => {
    setEditingTask(null);
    setNewTaskTitle("");
    setNewTaskDate("");
    setNewTaskPriority("medium");
  };

  // URL'den gelen görev ID'sini kontrol et ve modalı aç
  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (taskId && tasks.length > 0) {
      const taskToOpen = tasks.find((task) => task.id === taskId);
      if (taskToOpen) {
        openModal(taskToOpen);
      }
    }
  }, [tasks, searchParams]);
  // Görevleri filtreleme ve sıralama
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "completed" && !task.completed) return false;
      if (filter === "active" && task.completed) return false;

      if (searchTerm) {
        return task.title.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return true;
    })
    .sort((a, b) => {
      // Önce tamamlanma durumuna göre sırala
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Tamamlananlar sona
      }

      // Sonra tarihe göre sırala (eski tarihler sona)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

  return (
    <Layout title="Görevler">
      <div className="w-full mt-10">
        {/* Üst Araç Çubuğu */}
        <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-4 mb-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Filtreleme Butonları */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === "all"
                  ? "bg-[#26282b] text-white dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  : "bg-gray-200 dark:bg-[#2a2c30] dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#36373a]"
              }`}
            >
              Tümü
            </button>

            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === "active"
                  ? "bg-[#26282b] text-white dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  : "bg-gray-200 dark:bg-[#2a2c30] dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#36373a]"
              }`}
            >
              Aktif
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === "completed"
                  ? "bg-[#26282b] text-white dark:bg-[#f3f3f3] dark:text-[#26282b]"
                  : "bg-gray-200 dark:bg-[#2a2c30] dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#36373a]"
              }`}
            >
              Tamamlanan
            </button>
          </div>

          {/* Arama ve Ekle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Görev ara..."
                className="pl-8 pr-3 py-1.5 text-sm w-full rounded-md bg-[#dfdcdc] dark:bg-[#26282b] dark:text-[#f3f3f3]"
              />
              <span
                className="material-icons-round absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                style={{ fontSize: "16px" }}
              >
                search
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <span
                    className="material-icons-round"
                    style={{ fontSize: "16px" }}
                  >
                    close
                  </span>
                </button>
              )}
            </div>

            <button
              onClick={() => openModal()}
              className="px-3 py-1.5 bg-[#26282b] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded-md flex items-center text-sm"
              disabled={loading}
            >
              <span
                className="material-icons-round mr-1"
                style={{ fontSize: "16px" }}
              >
                add
              </span>
              Yeni
            </button>
          </div>
        </div>

        {/* Görevler Listesi */}
        <div className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-4 min-h-[500px]">
          {/* Başlık */}
          <h3 className="font-bold text-sm mb-3">
            {filter === "all"
              ? "Tüm Görevler"
              : filter === "active"
              ? "Aktif Görevler"
              : "Tamamlanan Görevler"}
            {searchTerm && ` - "${searchTerm}" için arama sonuçları`}
            <span className="font-normal text-sm ml-2">
              ({filteredTasks.length})
            </span>
          </h3>

          {/* Yükleniyor göstergesi */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="loader animate-spin rounded-full border-t-2 border-b-2 border-[#26282b] dark:border-[#f3f3f3] h-6 w-6"></div>
              <span className="ml-2 text-sm">Yükleniyor...</span>
            </div>
          )}

          {/* Görevler Listesi */}
          {!loading && filteredTasks.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => {
                const priorityColors = {
                  low: "border-blue-400",
                  medium: "border-green-400",
                  high: "border-red-400",
                };

                return (
                  <li
                    key={task.id}
                    className={`py-3 border-l-4 ${
                      priorityColors[task.priority]
                    } pl-3 hover:bg-gray-100 dark:hover:bg-[#48494a] rounded-md transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className="flex-shrink-0 mr-2"
                          disabled={loading}
                        >
                          <span
                            className={`material-icons-round ${
                              task.completed
                                ? "text-[#26282b]/90 dark:text-[#f3f3f3]/80"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                            style={{ fontSize: "20px" }}
                          >
                            {task.completed
                              ? "check_circle"
                              : "radio_button_unchecked"}
                          </span>
                        </button>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-sm font-medium truncate ${
                              task.completed
                                ? "line-through text-gray-500 dark:text-gray-400"
                                : ""
                            }`}
                          >
                            {task.title}
                          </h4>

                          {/* Tarih bilgisini ayrı bir satıra taşıdık */}
                          {task.date && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                              <span
                                className="material-icons-round mr-1"
                                style={{ fontSize: "12px" }}
                              >
                                event
                              </span>
                              {new Date(task.date).toLocaleDateString("tr-TR")}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex ml-4 flex-shrink-0">
                        <button
                          onClick={() => openModal(task)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          disabled={loading}
                        >
                          <span
                            className="material-icons-round"
                            style={{ fontSize: "18px" }}
                          >
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(task.id)}
                          className="ml-2 text-gray-400 hover:text-red-500"
                          disabled={loading}
                        >
                          <span
                            className="material-icons-round"
                            style={{ fontSize: "18px" }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <span
                  className="material-icons-round text-gray-400 mb-2"
                  style={{ fontSize: "48px" }}
                >
                  task_alt
                </span>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm
                    ? "Arama kriterlerine uygun görev bulunamadı"
                    : filter === "completed"
                    ? "Henüz tamamlanan göreviniz yok"
                    : filter === "active"
                    ? "Aktif görev yok"
                    : "Henüz görev eklenmemiş"}
                </p>
                {!searchTerm && filter !== "completed" && (
                  <button
                    onClick={() => openModal()}
                    className="mt-4 text-sm text-[#26282b] dark:text-[#f3f3f3] flex items-center"
                    disabled={loading}
                  >
                    <span
                      className="material-icons-round mr-1"
                      style={{ fontSize: "14px" }}
                    >
                      add
                    </span>
                    Yeni görev ekle
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Görev Ekleme/Düzenleme Modal */}
      <TaskModal
        showModal={showModal}
        closeModal={closeModal}
        editingTask={editingTask}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        newTaskDate={newTaskDate}
        setNewTaskDate={setNewTaskDate}
        newTaskPriority={newTaskPriority}
        setNewTaskPriority={setNewTaskPriority}
        updateTask={updateTask}
        addTask={addTask}
        loading={loading}
      />

      {/* Görev Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-[#26282b] rounded-lg shadow-md p-6 max-w-sm w-full">
            <h4 className="text-lg font-semibold mb-4">
              Görevi Silmek Üzeresiniz
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              Bu görevi silmek istediğinize emin misiniz? Bu işlem geri
              alınamaz.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-[#36373a] text-[#26282b] dark:text-[#f3f3f3] hover:bg-gray-300 dark:hover:bg-[#44464a] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={deleteTask}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
