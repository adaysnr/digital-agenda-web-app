"use client";

const TaskModal = ({
  showModal,
  closeModal,
  editingTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDate,
  setNewTaskDate,
  newTaskPriority,
  setNewTaskPriority,
  updateTask,
  addTask,
  loading = false,
}) => {
  if (!showModal) return null;

  // Form gönderme işleyicisi
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate) return;

    if (editingTask) {
      updateTask();
    } else {
      addTask();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#36373a] rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        {/* Modal Başlık */}
        <div className="flex justify-between items-center p-4">
          <h3 className="text-base font-medium">
            {editingTask ? "Görevi Düzenle" : "Yeni Görev"}
          </h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            disabled={loading}
          >
            <span className="material-icons-round" style={{ fontSize: "20px" }}>
              close
            </span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="px-4 pb-4">
          <div className="mb-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md bg-[#dfdcdc] dark:bg-[#26282b] dark:text-[#f3f3f3] focus:outline-none"
              placeholder="Görev başlığı"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              {" "}
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md bg-[#dfdcdc] dark:bg-[#26282b] dark:text-[#f3f3f3] focus:outline-none"
                required
                disabled={loading}
              />
            </div>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-md bg-[#dfdcdc] dark:bg-[#26282b] dark:text-[#f3f3f3] focus:outline-none"
              disabled={loading}
            >
              <option value="low">Düşük Öncelik</option>
              <option value="medium">Normal Öncelik</option>
              <option value="high">Yüksek Öncelik</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 text-xs bg-transparent border border-gray-300 dark:border-gray-600 text-[#26282b] dark:text-[#f3f3f3] rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors disabled:opacity-50"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-[#26282b] dark:bg-[#f3f3f3] text-white dark:text-[#26282b] rounded-md hover:bg-gray-700 dark:hover:bg-gray-300 focus:outline-none transition-colors disabled:opacity-50 flex items-center"
              disabled={loading}
            >
              {loading && (
                <span className="w-3 h-3 mr-2 border-t-2 border-b-2 border-white dark:border-[#26282b] rounded-full animate-spin"></span>
              )}
              {editingTask ? "Kaydet" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
