"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../Layout/Layout";
import Input from "../Input/Input";
import PasswordInput from "../Input/PasswordInput";
import api from "../../../services/api";

export default function SettingsPage() {
  const router = useRouter();

  // Kullanıcı bilgileri state'leri
  const [user, setUser] = useState({
    namesurname: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    deleteAccountPassword: "",
  });
  // Form durum state'leri
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    task: true,
    calendar: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Sayfa yüklendiğinde kullanıcı bilgilerini getir
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profileData = await api.auth.getProfile();
        setUser((prev) => ({
          ...prev,
          namesurname: profileData.namesurname,
          email: profileData.email,
        }));
      } catch (error) {
        setMessage({
          text: "Profil bilgileri yüklenirken bir hata oluştu.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Kullanıcı adı ve e-posta güncelleme
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Profil güncelleme işlemi
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { namesurname, email } = user;

      const response = await api.auth.updateProfile({
        namesurname,
        email,
      });

      setMessage({
        text: "Profil bilgileriniz başarıyla güncellendi.",
        type: "success",
      });
      setIsEditingProfile(false);

      // API yanıtındaki token'ı güncelle
      if (response.token && typeof window !== "undefined") {
        localStorage.setItem("token", response.token);
      }
    } catch (error) {
      setMessage({
        text: "Profil güncellenirken bir hata oluştu.",
        type: "error",
      });
    } finally {
      setLoading(false);
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // Parola değiştirme işlemi
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Parola kontrolü
    if (user.newPassword !== user.confirmPassword) {
      setMessage({ text: "Yeni parolalar eşleşmiyor.", type: "error" });
      return;
    }

    // Minimum parola uzunluğunu kontrol et
    if (user.newPassword.length < 6) {
      setMessage({
        text: "Yeni parola en az 6 karakter uzunluğunda olmalıdır.",
        type: "error",
      });
      return;
    }
    setLoading(true);

    try {
      const { currentPassword, newPassword } = user;

      const response = await api.auth.updatePassword({
        currentPassword,
        newPassword,
      });

      setMessage({
        text: "Parolanız başarıyla güncellendi.",
        type: "success",
      });

      setUser({
        ...user,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsChangingPassword(false);

      // API yanıtındaki token'ı güncelle
      if (response.token && typeof window !== "undefined") {
        localStorage.setItem("token", response.token);
      }
    } catch (error) {
      setMessage({
        text: "Parola değiştirilirken bir hata oluştu.",
        type: "error",
      });
    } finally {
      setLoading(false);
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // Bildirim ayarları değiştirme
  const handleNotificationChange = (type) => {
    const newNotifications = {
      ...notifications,
      [type]: !notifications[type],
    };
    setNotifications(newNotifications);
    // Tercihleri localStorage'a kaydet
    localStorage.setItem(
      "notificationPreferences",
      JSON.stringify(newNotifications)
    );
  };

  // Bildirim tercihlerini yükle
  useEffect(() => {
    const savedPreferences = localStorage.getItem("notificationPreferences");
    if (savedPreferences) {
      setNotifications(JSON.parse(savedPreferences));
    }
  }, []);

  // Hesap silme işlemi
  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      setMessage({
        text: "Hesap silme işlemini onaylamanız gerekmektedir.",
        type: "error",
      });
      return;
    }

    if (!user.deleteAccountPassword) {
      setMessage({
        text: "Hesabınızı silmek için parolanızı girmelisiniz.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await api.auth.deleteAccount(user.deleteAccountPassword);

      // Başarılı silme işlemi sonrası yönlendirme
      setMessage({
        text: "Hesabınız ve tüm verileriniz başarıyla silindi.",
        type: "success",
      });

      // Lokal storage'dan token'ı temizle ve login sayfasına yönlendir
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");

        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      setMessage({
        text: "Hesap silme işlemi başarısız oldu.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Ayarlar">
      <div className="w-full mt-10">
        {/* Bildirim mesajı */}
        {message.text && (
          <div
            className={`p-3 rounded-md mb-6 text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 dark:border-gray-300"></div>
          </div>
        )}

        <div className="space-y-6">
          {/* Profil Bilgileri */}
          <section className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium flex items-center">
                <span className="material-icons-round mr-1 text-base">
                  person
                </span>
                Profil Bilgileri
              </h2>
              <button
                className="text-xs px-2 py-1 rounded-md bg-[#dfdcdc] text-gray-700 hover:bg-gray-300 dark:bg-[#26282b] dark:text-gray-200 dark:hover:bg-[#333] transition-colors"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                disabled={loading}
              >
                {isEditingProfile ? "İptal" : "Düzenle"}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="namesurname"
                    className="block text-sm font-medium mb-1"
                  >
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="namesurname"
                    name="namesurname"
                    value={user.namesurname}
                    onChange={handleProfileChange}
                    className="input-box rounded-md p-2 w-full text-sm font-medium text-black"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    onChange={handleProfileChange}
                    className="input-box rounded-md p-2 w-full text-sm font-medium text-black"
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-[#26282b] text-white hover:bg-[#434548] dark:bg-[#f3f3f3] dark:text-[#26282b] dark:hover:bg-[#dfdcdc]"
                    disabled={loading}
                  >
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white/50 dark:bg-[#26282b]/30 rounded-md p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ad Soyad
                    </p>
                    <p className="font-medium">{user.namesurname}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      E-posta
                    </p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Parola Değiştirme */}
          <section className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium flex items-center">
                <span className="material-icons-round mr-1 text-base">
                  lock
                </span>
                Parola
              </h2>
              <button
                className="text-xs px-2 py-1 rounded-md bg-[#dfdcdc] text-gray-700 hover:bg-gray-300 dark:bg-[#26282b] dark:text-gray-200 dark:hover:bg-[#333] transition-colors"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                disabled={loading}
              >
                {isChangingPassword ? "İptal" : "Değiştir"}
              </button>
            </div>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Mevcut Parola
                  </label>
                  <PasswordInput
                    id="currentPassword"
                    name="currentPassword"
                    value={user.currentPassword}
                    onChange={handleProfileChange}
                    className="input-box rounded-md p-2 w-full text-sm font-medium text-black"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Yeni Parola
                  </label>
                  <PasswordInput
                    id="newPassword"
                    name="newPassword"
                    value={user.newPassword}
                    onChange={handleProfileChange}
                    className="input-box rounded-md p-2 w-full text-sm font-medium text-black"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Yeni Parola Tekrar
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={user.confirmPassword}
                    onChange={handleProfileChange}
                    className="input-box rounded-md p-2 w-full text-sm font-medium text-black"
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-[#26282b] text-white hover:bg-[#434548] dark:bg-[#f3f3f3] dark:text-[#26282b] dark:hover:bg-[#dfdcdc]"
                    disabled={loading}
                  >
                    {loading ? "Güncelleniyor..." : "Parolayı Güncelle"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white/50 dark:bg-[#26282b]/30 rounded-md p-4">
                <p className="text-sm">
                  Parolanızı düzenli olarak değiştirmeniz önerilir.
                </p>
              </div>
            )}
          </section>

          {/* Bildirim Tercihleri */}
          <section className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-5">
            <h2 className="font-medium flex items-center mb-3">
              <span className="material-icons-round mr-1 text-base">
                notifications
              </span>
              Bildirim Tercihleri
            </h2>
            <div className="bg-white/50 dark:bg-[#26282b]/30 rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="task-notif" className="text-sm">
                  Görev Bildirimleri
                </label>
                <button
                  onClick={() => handleNotificationChange("task")}
                  className="relative inline-block w-10 align-middle select-none"
                >
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${
                      notifications.task
                        ? "bg-[#26282b] dark:bg-[#f3f3f3]"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                  <div
                    className={`absolute left-1 top-1 bg-white dark:bg-gray-800 w-4 h-4 rounded-full transition-transform ${
                      notifications.task ? "transform translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="calendar-notif" className="text-sm">
                  Takvim Bildirimleri
                </label>
                <button
                  onClick={() => handleNotificationChange("calendar")}
                  className="relative inline-block w-10 align-middle select-none"
                >
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${
                      notifications.calendar
                        ? "bg-[#26282b] dark:bg-[#f3f3f3]"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                  <div
                    className={`absolute left-1 top-1 bg-white dark:bg-gray-800 w-4 h-4 rounded-full transition-transform ${
                      notifications.calendar ? "transform translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Görünüm Ayarları */}
          <section className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-5">
            <h2 className="font-medium flex items-center mb-3">
              <span className="material-icons-round mr-1 text-base">
                palette
              </span>
              Görünüm
            </h2>
            <div className="bg-white/50 dark:bg-[#26282b]/30 rounded-md p-4">
              <p className="text-sm mb-3">
                Tema tercihlerini sağ üst köşedeki tema değiştirme düğmesinden
                ayarlayabilirsiniz.
              </p>
              <div className="flex items-center">
                <span
                  className="material-icons-round mr-2"
                  style={{ fontSize: "20px" }}
                >
                  dark_mode
                </span>
                <span>/</span>
                <span
                  className="material-icons-round ml-2"
                  style={{ fontSize: "20px" }}
                >
                  light_mode
                </span>
              </div>
            </div>
          </section>

          {/* Hesabı Sil */}
          <section className="bg-[#f3f3f3] dark:bg-[#36373a] rounded-lg shadow-md p-5">
            <h2 className="font-medium flex items-center mb-3 text-red-600 dark:text-red-400">
              <span className="material-icons-round mr-1 text-base">
                delete
              </span>
              Hesabı Sil
            </h2>

            {showDeleteConfirm ? (
              <div>
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md mb-4">
                  <p className="text-red-700 dark:text-red-300 mb-2">
                    Dikkat! Bu işlem geri alınamaz.
                  </p>
                  <p className="text-sm">
                    Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak
                    silinecektir. Bu işlem geri alınamaz.
                  </p>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="deleteAccountPassword"
                    className="block text-sm font-medium mb-1"
                  >
                    Parolanızı Girin
                  </label>
                  <PasswordInput
                    id="deleteAccountPassword"
                    name="deleteAccountPassword"
                    value={user.deleteAccountPassword}
                    onChange={handleProfileChange}
                    placeholder="Hesap silme işlemini onaylamak için parolanızı girin"
                    className="input-box rounded-md p-2 w-full text-sm font-medium text-black"
                    disabled={loading}
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="deleteConfirm" className="flex items-center">
                    <div className="relative w-5 h-5 mr-3">
                      <input
                        type="checkbox"
                        id="deleteConfirm"
                        className="sr-only"
                        checked={deleteConfirmed}
                        onChange={() => setDeleteConfirmed(!deleteConfirmed)}
                        disabled={loading}
                      />
                      <div
                        className={`absolute inset-0 border-2 rounded ${
                          deleteConfirmed
                            ? "border-[#26282b] bg-[#26282b] dark:border-[#f3f3f3] dark:bg-[#f3f3f3]"
                            : "border-gray-400 dark:border-gray-500"
                        } transition-colors`}
                      ></div>
                      {deleteConfirmed && (
                        <span className="absolute inset-0 flex items-center justify-center text-white dark:text-[#26282b]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Hesabımı ve tüm verilerimi kalıcı olarak silmek istediğimi
                      onaylıyorum
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-[#dfdcdc] text-gray-700 hover:bg-gray-300 dark:bg-[#26282b] dark:text-gray-200 dark:hover:bg-[#333]"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmed(false);
                      setUser((prev) => ({
                        ...prev,
                        deleteAccountPassword: "",
                      }));
                    }}
                    disabled={loading}
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    {loading ? "İşlem Yapılıyor..." : "Hesabı Sil"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-4">
                  Bu işlem hesabınızı ve tüm verilerinizi kalıcı olarak
                  silecektir.
                </p>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Hesabımı Silmek İstiyorum
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
