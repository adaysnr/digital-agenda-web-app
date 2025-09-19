"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../services/api";

// Context oluştur
const AuthContext = createContext();

// AuthProvider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Sayfa yüklendiğinde kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Kullanıcı bilgilerini getir
        const userData = await api.auth.getProfile();
        setUser(userData);
      } catch (err) {
        // Token hatalı ise temizle
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);
  // Giriş fonksiyonu
  const login = async (email, password) => {
    setError(null);
    try {
      // API'ye giriş isteği gönder
      const response = await api.auth.login({ email, password });

      if (!response.success && !response.token) {
        throw new Error(response.message || "Giriş işlemi başarısız oldu.");
      }

      // Token'ı kaydet
      localStorage.setItem("token", response.token);

      // Kullanıcı bilgisini state'e kaydet
      setUser(response.user || (await api.auth.getProfile()));

      return true;
    } catch (err) {
      const errorMessage =
        err.message ||
        "Giriş sırasında bir hata oluştu. Bilgilerinizi kontrol edin.";
      setError(errorMessage); // Geliştirme ortamında ekstra log
      return false;
    }
  };

  // Kayıt fonksiyonu
  const register = async (userData) => {
    setError(null);
    try {
      // API'ye kayıt isteği gönder
      const response = await api.auth.register(userData);

      // Otomatik giriş yapılacaksa token'ı kaydet
      if (response.token) {
        localStorage.setItem("token", response.token);
        setUser(response.user || (await api.auth.getProfile()));
      }

      return true;
    } catch (err) {
      const safeErrorMessage =
        "Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.";
      setError(safeErrorMessage);
      return false;
    }
  };
  // Çıkış fonksiyonu
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  // Şifre sıfırlama isteği fonksiyonu
  const forgotPassword = async (email) => {
    setError(null);
    try {
      // API URL'si ve endpoint'in doğru olduğundan emin olun
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      // Yanıtın içeriği JSON mu kontrol et
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Parola sıfırlama isteği başarısız oldu: ${response.status}`
          );
        }

        return data;
      } else {
        // JSON olmayan yanıt durumunda
        const text = await response.text();

        if (!response.ok) {
          throw new Error(
            `Parola sıfırlama isteği başarısız oldu (${
              response.status
            }): ${text.substring(0, 100)}`
          );
        }

        return {
          success: true,
          message: "Parola sıfırlama bağlantısı gönderildi",
        };
      }
    } catch (err) {
      const safeErrorMessage =
        "Parola sıfırlama isteği sırasında bir hata oluştu";
      setError(safeErrorMessage);
      return false;
    }
  }; // Parola değiştirme
  const resetPassword = async (token, newPassword) => {
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      // Yanıtın içeriği JSON mu kontrol et
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Parola sıfırlama işlemi başarısız oldu: ${response.status}`
          );
        }

        return data;
      } else {
        // JSON olmayan yanıt durumunda
        const text = await response.text();

        if (!response.ok) {
          throw new Error(
            `Parola sıfırlama işlemi başarısız oldu (${
              response.status
            }): ${text.substring(0, 100)}`
          );
        }

        return { success: true, message: "Parola başarıyla sıfırlandı" };
      }
    } catch (err) {
      const safeErrorMessage = "Parola değiştirme sırasında bir hata oluştu";
      setError(safeErrorMessage);
      return false;
    }
  };

  // Kullanıcı profil güncelleme
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const updatedUser = await api.request.put("/users/profile", userData);
      setUser(updatedUser);
      return true;
    } catch (err) {
      const safeErrorMessage = "Profil güncelleme sırasında bir hata oluştu";
      setError(safeErrorMessage);
      return false;
    }
  };

  // Context Provider değerlerini tanımla
  const value = {
    user, // Mevcut kullanıcı bilgisi
    loading, // Yükleniyor durumu
    error, // Hata mesajı
    isAuthenticated: !!user, // Kullanıcı giriş yapmış mı?
    login, // Giriş fonksiyonu
    register, // Kayıt fonksiyonu
    logout, // Çıkış fonksiyonu
    forgotPassword, // Şifre sıfırlama isteği
    resetPassword, // Şifre değiştirme
    updateProfile, // Profil güncelleme
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook olarak kullanım için
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth hooks must be used within an AuthProvider");
  }
  return context;
};

// Default export
export default AuthContext;
