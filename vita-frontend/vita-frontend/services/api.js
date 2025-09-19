const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchWithAuth = async (endpoint, options = {}) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // 204 No Content yanıtlarını kontrol et
      if (response.status === 204) {
        return {}; // Boş nesne döndür
      }

      // HTTP hata durumlarını kontrol et (404, 500, vb.)
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          throw new Error(
            "Oturum süreniz doldu veya giriş yapmanız gerekiyor."
          );
        }

        if (response.status === 403) {
          throw new Error("Bu işlem için yetkiniz yok");
        }

        if (response.status === 404) {
          throw new Error(`Kaynak bulunamadı: ${endpoint}`);
        }

        // Yanıtın içeriği JSON mu kontrol et
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `İşlem başarısız oldu: ${response.status}`
          );
        } else {
          // JSON olmayan yanıtlar için (HTML vb.)
          const errorText = await response.text();
          throw new Error(
            `Sunucu yanıtı geçersiz (${response.status}): API istek hatası`
          );
        }
      }

      // Yanıtın içeriği JSON mu kontrol et
      const contentType = response.headers.get("content-type");      if (contentType && contentType.includes("application/json")) {
        // JSON yanıtını parse et
        const data = await response.json();
        return data;
      } else {
        // JSON olmayan başarılı yanıtlar için (örneğin text/plain)
        const textResponse = await response.text();
        return { data: textResponse };
      }
    } catch (error) {
      throw error;
    }
  } else {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // 204 No Content yanıtlarını kontrol et (server-side için de)
      if (response.status === 204) {
        return {}; // Boş nesne döndür
      }

      // HTTP hata durumlarını kontrol et (404, 500, vb.)
      if (!response.ok) {
        // Yanıtın içeriği JSON mu kontrol et
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `İşlem başarısız oldu: ${response.status}`
          );
        } else {
          // JSON olmayan yanıtlar için (HTML vb.)
          const errorText = await response.text();
          throw new Error(
            `Sunucu yanıtı geçersiz (${response.status}): API istek hatası`
          );
        }
      }      // Yanıtın içeriği JSON mu kontrol et
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        // JSON yanıtını parse et
        const data = await response.json();
        return data;
      } else {
        // JSON olmayan başarılı yanıtlar için (örneğin text/plain)
        const textResponse = await response.text();
        return { data: textResponse };
      }
    } catch (error) {
      throw error;
    }
  }
};

// Auth servisleri
const authService = {
  // Kullanıcı kaydı
  register: async (userData) => {
    return await fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Kullanıcı girişi
  login: async (credentials) => {
    return await fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Kullanıcı profili alma
  getProfile: async () => {
    return await fetchWithAuth("/auth/profile");
  },

  // Kullanıcı profil bilgilerini güncelleme
  updateProfile: async (userData) => {
    return await fetchWithAuth("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }, // Kullanıcı şifresini güncelleme
  updatePassword: async (passwordData) => {
    try {
      const response = await fetchWithAuth("/auth/password", {
        method: "PUT",
        body: JSON.stringify(passwordData),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }, // Şifre sıfırlama isteği
  forgotPassword: async (email) => {
    try {
      // Token gerektirmeyen bir istek
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // HTTP hata durumlarını kontrol et
      if (!response.ok) {
        // Yanıtın içeriği JSON mu kontrol et
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `İşlem başarısız: ${response.status}`
          );
        } else {
          // JSON olmayan hata yanıtları için
          const errorText = await response.text();
          throw new Error(
            `API hatası (${response.status}): ${errorText.substring(0, 100)}`
          );
        }
      }

      // Yanıtın içeriği JSON mu kontrol et
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        // JSON olmayan başarılı yanıtlar için
        const textResponse = await response.text();
        return {
          success: true,
          message: "Parola sıfırlama bağlantısı gönderildi",
        };
      }
    } catch (error) {
      throw error;
    }
  }, // Doğrulama kodu kontrolü
  verifyResetCode: async (email, code) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      // HTTP hata durumlarını kontrol et
      if (!response.ok) {
        // Yanıtın içeriği JSON mu kontrol et
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Doğrulama başarısız: ${response.status}`
          );
        } else {
          // JSON olmayan hata yanıtları için
          const errorText = await response.text();
          throw new Error(
            `API hatası (${response.status}): ${errorText.substring(0, 100)}`
          );
        }
      }

      // Yanıtın içeriği JSON mu kontrol et
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        // JSON olmayan başarılı yanıtlar için
        const textResponse = await response.text();
        return { success: true, token: "default-token" };
      }
    } catch (error) {
      throw error;
    }
  }, // Yeni şifre oluşturma
  resetPassword: async (token, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      // HTTP hata durumlarını kontrol et
      if (!response.ok) {
        // Yanıtın içeriği JSON mu kontrol et
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Şifre sıfırlama başarısız: ${response.status}`
          );
        } else {
          // JSON olmayan hata yanıtları için
          const errorText = await response.text();
          throw new Error(
            `API hatası (${response.status}): ${errorText.substring(0, 100)}`
          );
        }
      }

      // Yanıtın içeriği JSON mu kontrol et
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        // JSON olmayan başarılı yanıtlar için
        const textResponse = await response.text();
        return { success: true, message: "Şifre başarıyla sıfırlandı" };
      }
    } catch (error) {
      throw error;
    }
  },

  // Kullanıcı hesabını silme
  deleteAccount: async (password) => {
    return await fetchWithAuth("/auth/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  },

  // Çıkış yapma (client-side)
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },
};

// Takvim etkinlik servisleri
const calendarService = {
  // Etkinlikleri getir
  getEvents: async () => {
    try {
      // Backend'inizin endpoint'ini kullanıyoruz
      const response = await fetch(`${API_URL}/calendarEvents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            typeof window !== "undefined"
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Etkinlikler alınırken hata oluştu: ${response.status}`
        );
      }

      const events = await response.json();
      return events || [];
    } catch (error) {
      return [];
    }
  },

  // Etkinlik ekle
  addEvent: async (eventData) => {
    try {
      // Yerel saatin UTC offset'ini al
      const localOffset = new Date().getTimezoneOffset() * 60000;

      // Tarihi yerel saate göre ayarla - saat dilimi farkını telafi et
      const localEventDate = new Date(
        new Date(eventData.startDateTime).getTime() + localOffset
      ); // Veritabanı modeline uygun olarak veriyi hazırlama
      const formattedData = {
        description: eventData.description || "",
        // YYYY-MM-DD formatında - Zaman dilimi farkından kaçınmak için yerel tarih kullan
        eventDate: new Date(
          eventData.startDateTime.getTime()
        ).toLocaleDateString("en-CA"), // YYYY-MM-DD formatında
        startTime: eventData.isAllDay
          ? "00:00:00"
          : new Date(eventData.startDateTime).toTimeString().substring(0, 8),
        // endTime allowNull: false olduğundan, endTime yoksa startTime'ı kullan
        endTime:
          eventData.endDateTime && !eventData.isAllDay
            ? new Date(eventData.endDateTime).toTimeString().substring(0, 8)
            : eventData.isAllDay
            ? "23:59:59"
            : new Date(eventData.startDateTime).toTimeString().substring(0, 8),
        isAllDay: Boolean(eventData.isAllDay),
      };

      // API endpoint'ini çağır
      const response = await fetch(`${API_URL}/calendarEvents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            typeof window !== "undefined"
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
        },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        const errorText = await response.text();

        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            errorJson.error || `İşlem başarısız: ${response.status}`
          );
        } catch (e) {
          throw new Error(
            `API hatası (${response.status}): ${errorText.substring(0, 100)}`
          );
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Etkinlik güncelle
  updateEvent: async (eventId, eventData) => {
    try {
      // Eğer sadece bir parametre gönderilmişse (evenData doğrudan ilk parametre)
      if (!eventData && typeof eventId === "object") {
        eventData = eventId;
        eventId = eventData.id;
      }

      if (!eventId || !eventData) {
        throw new Error(
          "Güncellenecek etkinlik için geçerli ID ve veri gerekiyor"
        );
      }

      // Veritabanı modeline uygun olarak veriyi hazırlama
      const formattedData = {
        description: eventData.description,
        eventDate:
          typeof eventData.startDateTime === "object" &&
          eventData.startDateTime instanceof Date
            ? new Date(eventData.startDateTime.getTime()).toLocaleDateString(
                "en-CA"
              ) // YYYY-MM-DD formatında
            : eventData.eventDate, // Eğer tarih zaten string olarak geliyorsa
        startTime: eventData.isAllDay
          ? "00:00:00"
          : typeof eventData.startDateTime === "object" &&
            eventData.startDateTime instanceof Date
          ? new Date(eventData.startDateTime).toTimeString().substring(0, 8)
          : eventData.startTime || "00:00:00", // Eğer saat zaten string olarak geliyorsa
        endTime: eventData.isAllDay
          ? "23:59:59"
          : typeof eventData.endDateTime === "object" &&
            eventData.endDateTime instanceof Date
          ? new Date(eventData.endDateTime).toTimeString().substring(0, 8)
          : eventData.endTime || "23:59:59", // Eğer saat zaten string olarak geliyorsa        isAllDay: Boolean(eventData.isAllDay),
      };

      return await fetchWithAuth(`/calendarEvents/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    } catch (error) {
      throw error;
    }
  },

  // Etkinlik sil
  deleteEvent: async (eventId) => {
    try {
      return await fetchWithAuth(`/calendarEvents/${eventId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw error;
    }
  },
};

// Notes services
const notesService = {
  // Get all notes
  getNotes: async () => {
    try {
      return await fetchWithAuth("/notes");
    } catch (error) {
      throw error;
    }
  },

  // Get note by id
  getNoteById: async (noteId) => {
    try {
      return await fetchWithAuth(`/notes/${noteId}`);
    } catch (error) {
      throw error;
    }
  },

  // Create new note
  createNote: async (noteData) => {
    try {
      return await fetchWithAuth("/notes", {
        method: "POST",
        body: JSON.stringify({
          noteHeader: noteData.title,
          noteContent: noteData.content,
        }),
      });
    } catch (error) {
      throw error;
    }
  },

  // Update note
  updateNote: async (noteId, noteData) => {
    try {
      return await fetchWithAuth(`/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
          noteHeader: noteData.title,
          noteContent: noteData.content,
        }),
      });
    } catch (error) {
      throw error;
    }
  },
  // Delete note
  deleteNote: async (noteId) => {
    try {
      return await fetchWithAuth(`/notes/${noteId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw error;
    }
  },
};

// Tasks services
const tasksService = {
  // Get all tasks
  getTasks: async () => {
    try {
      return await fetchWithAuth("/tasks");
    } catch (error) {
      throw error;
    }
  },

  // Get task by id
  getTaskById: async (taskId) => {
    try {
      return await fetchWithAuth(`/tasks/${taskId}`);
    } catch (error) {
      throw error;
    }
  },
  // Create new task
  createTask: async (taskData) => {
    try {
      return await fetchWithAuth("/tasks", {
        method: "POST",
        body: JSON.stringify({
          taskHeader: taskData.title,
          taskDate: taskData.date,
          priority: taskData.priority || "medium",
        }),
      });
    } catch (error) {
      throw error;
    }
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    try {
      return await fetchWithAuth(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({
          taskHeader: taskData.title,
          taskDate: taskData.date,
          priority: taskData.priority,
          isCompleted: taskData.completed,
        }),
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      return await fetchWithAuth(`/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw error;
    }
  },
  // Toggle task completion
  toggleTaskCompletion: async (taskId) => {
    try {
      return await fetchWithAuth(`/tasks/${taskId}/toggle`, {
        method: "PATCH",
      });
    } catch (error) {
      throw error;
    }
  },
};

const apiRequest = {
  get: (endpoint, options = {}) =>
    fetchWithAuth(endpoint, { ...options, method: "GET" }),
  post: (endpoint, data, options = {}) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: (endpoint, data, options = {}) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (endpoint, options = {}) =>
    fetchWithAuth(endpoint, { ...options, method: "DELETE" }),
  patch: (endpoint, data, options = {}) =>
    fetchWithAuth(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
};

// Tüm servisleri içeren ana API nesnesi
const api = {
  auth: authService,
  request: apiRequest,
  calendar: calendarService,
  notes: notesService,
  tasks: tasksService,
};

export default api;
