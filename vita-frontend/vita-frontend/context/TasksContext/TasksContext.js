"use client";

import { createContext, useState, useContext, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../AuthContext";

const TasksContext = createContext();

// Context sağlayıcısı
export function TasksProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [tasksUpdated, setTasksUpdated] = useState(false);

  // Görevleri API'den alma
  const fetchTasks = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.tasks.getTasks();

      const formattedTasks = response.map((task) => ({
        id: task.id,
        title: task.taskHeader,
        description: task.taskContent,
        date: task.taskDate,
        priority: task.priority || "medium",
        completed: task.isCompleted,
        createdAt: task.createdAt,
      }));

      setTasks(formattedTasks);

      const completedCount = formattedTasks.filter(
        (task) => task.completed
      ).length;
      setCompletedTasksCount(completedCount);

      // Haftalık ilerleme verilerini güncelle
      calculateWeeklyProgress(formattedTasks);      setError(null);
    } catch (err) {
      setError("Görevler yüklenemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
      setTasksUpdated(false);
    }
  };

  // Haftalık ilerleme verilerini hesaplama
  const calculateWeeklyProgress = (tasksList) => {
    const dayLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"];
    const today = new Date();

    const currentDayOfWeek = today.getDay() || 7;
    const mondayOffset = currentDayOfWeek - 1;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    // 7 günlük veriyi içeren bir dizi oluştur
    const weekData = Array(7)
      .fill(0)
      .map((_, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);

        const completedTasksForDay = tasksList.filter((task) => {
          if (task.completed) {
            if (task.justCompletedNow) {
              return (
                today.getDate() === date.getDate() &&
                today.getMonth() === date.getMonth() &&
                today.getFullYear() === date.getFullYear()
              );
            }
            const taskDate = new Date(task.date);
            return (
              taskDate.getDate() === date.getDate() &&
              taskDate.getMonth() === date.getMonth() &&
              taskDate.getFullYear() === date.getFullYear()
            );
          }
          return false;
        });

        return {
          date: date,
          count: completedTasksForDay.length,
          day: dayLabels[index],
        };
      });

    setWeeklyProgress(weekData);
  };

  // Görev tamamlama durumunu değiştirme
  const toggleTaskCompletion = async (taskId) => {
    try {
      await api.tasks.toggleTaskCompletion(taskId);

      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              justCompletedNow: !task.completed ? true : undefined,
            }
          : task
      );

      setTasks(updatedTasks);

      const completedCount = updatedTasks.filter(
        (task) => task.completed
      ).length;
      setCompletedTasksCount(completedCount);
      calculateWeeklyProgress(updatedTasks);
      setTasksUpdated(true);

      return true;
    } catch (error) {      // Handle error silently in production
      return false;
    }
  };

  // Görev ekleme
  const addTask = async (taskData) => {
    try {
      const response = await api.tasks.createTask(taskData);

      const newTask = {
        id: response.id,
        title: response.taskHeader,
        description: response.taskContent,
        date: response.taskDate,
        priority: response.priority,
        completed: response.isCompleted,
        createdAt: response.createdAt,
      };

      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);

      if (newTask.completed) {
        calculateWeeklyProgress(updatedTasks);
      }
      setTasksUpdated(true);

      const timestamp = new Date().getTime();
      localStorage.setItem("lastTaskUpdate", timestamp.toString());

      return { success: true, task: newTask };    } catch (error) {
      return { success: false, error };
    }
  };

  // Görev güncelleme
  const updateTask = async (taskId, taskData) => {
    try {
      await api.tasks.updateTask(taskId, taskData);
      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: taskData.title,
              description: taskData.description,
              date: taskData.date,
              priority: taskData.priority,
              completed: taskData.completed,
            }
          : task
      );

      setTasks(updatedTasks);

      const completedCount = updatedTasks.filter(
        (task) => task.completed
      ).length;
      setCompletedTasksCount(completedCount);
      calculateWeeklyProgress(updatedTasks);
      setTasksUpdated(true);      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Görev silme
  const deleteTask = async (taskId) => {
    try {
      await api.tasks.deleteTask(taskId);

      const taskToDelete = tasks.find((task) => task.id === taskId);
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);

      if (taskToDelete && taskToDelete.completed) {
        const completedCount = updatedTasks.filter(
          (task) => task.completed
        ).length;
        setCompletedTasksCount(completedCount);
      }

      calculateWeeklyProgress(updatedTasks);
      setTasksUpdated(true);      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // İlk yükleme ve güncelleme için tasks'ları getir
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const contextValue = {
    tasks,
    loading,
    error,
    completedTasksCount,
    weeklyProgress,
    tasksUpdated,
    fetchTasks,
    toggleTaskCompletion,
    addTask,
    updateTask,
    deleteTask,
  };

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
