"use client";

import { createContext, useState, useEffect, useContext } from "react";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // Mevcut taskUpdated state'ini koruyoruz
  const [taskUpdated, setTaskUpdated] = useState(0);

  const [tasks, setTasks] = useState(() => {
    // Local storage'dan görevleri yükle (eğer varsa)
    if (typeof window !== "undefined") {
      const savedTasks = localStorage.getItem("pomodoro-tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });

  const [completedTasks, setCompletedTasks] = useState(() => {
    // Local storage'dan tamamlanmış görevleri yükle (eğer varsa)
    if (typeof window !== "undefined") {
      const savedCompletedTasks = localStorage.getItem(
        "pomodoro-completed-tasks"
      );
      return savedCompletedTasks ? JSON.parse(savedCompletedTasks) : [];
    }
    return [];
  });

  // Mevcut updateTasks fonksiyonunu koruyoruz
  const updateTasks = () => {
    setTaskUpdated((prev) => prev + 1);
  };

  // Bir görev ekle
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    updateTasks(); // API güncellemeleri için
  };

  // Bir görevi tamamla
  const completeTask = (taskId) => {
    const taskToComplete = tasks.find((task) => task.id === taskId);
    if (!taskToComplete) return;

    // Aktif görevlerden çıkar
    setTasks(tasks.filter((task) => task.id !== taskId));

    // Tamamlanan görevler listesine ekle
    setCompletedTasks([
      ...completedTasks,
      { ...taskToComplete, completed: true },
    ]);
    updateTasks(); // API güncellemeleri için
  };

  // Bir aktif görevi sil
  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    updateTasks(); // API güncellemeleri için
  };

  // Bir tamamlanmış görevi sil
  const deleteCompletedTask = (taskId) => {
    setCompletedTasks(completedTasks.filter((task) => task.id !== taskId));
    updateTasks(); // API güncellemeleri için
  };

  // Local storage'a kaydetme
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "pomodoro-completed-tasks",
        JSON.stringify(completedTasks)
      );
    }
  }, [completedTasks]);

  return (
    <TaskContext.Provider
      value={{
        taskUpdated,
        updateTasks,
        tasks,
        completedTasks,
        addTask,
        completeTask,
        deleteTask,
        deleteCompletedTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
