"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "@/components/Logo/Logo";

export default function LandingPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  // Tema değişikliğini uygulamak için
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Tema değiştirme işlemi
  const toggleTheme = () => {
    const newTheme = !darkMode;

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }

    setDarkMode(newTheme);
  };

  return (
    <div className="min-h-screen flex flex-col gap-8 transition-colors duration-300">
      {/* Header Section */}
      <header className="pt-16 px-6 xl:px-20 flex justify-between items-center w-full">
        <div className="flex-shrink-0">
          <Logo />
        </div>
        <div className="flex items-center gap-10">
          <div>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 bg-[#dfdcdc] border-2 border-[#26282b] text-[#26282b] hover:bg-[#5c5d61] hover:border-[#5c5d61] hover:text-[#efecec] dark:bg-[#26282b] dark:text-white dark:border-2 dark:border-[#dfdcdc] dark:hover:bg-[#5c5d61] dark:hover:text-[#dfdcdc] dark:hover:border-[#5c5d61]"
            >
              Giriş Yap
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-[#dfdcdc] border-2 border-[#26282b] group hover:bg-[#5c5d61] hover:border-[#5c5d61] dark:bg-[#26282b] dark:border-2 dark:border-[#dfdcdc] dark:hover:bg-[#5c5d61] dark:hover:border-[#5c5d61] transition-all duration-300"
              aria-label="Tema Değiştir"
              data-darkmode={darkMode ? "true" : "false"}
            >
              {darkMode ? (
                // Güneş ikonu - Aydınlık temaya geçmek için
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dfdcdc"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                // Ay ikonu - Karanlık temaya geçmek için
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#26282b] group-hover:text-[#dfdcdc]"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-grow items-center justify-center grid grid-cols-1 lg:grid-cols-2 mx-6 xl:mx-20 gap-4 md:gap-6 lg:gap-8">
        {/* Hero Section */}
        <section className="flex items-center justify-center h-full mb-16">
          <div className="flex flex-col gap-4 xs:gap-3 my-auto">
            <h1 className="text-6xl font-semibold mb-3">
              Fiziksel Ajandanızı Dijitale Taşıyın!
            </h1>

            <div className="max-w-lg mb-8">
              <p className="text-lg font-regular">
                Fiziksel ajandaların ötesine geçin! Görevlerinizi planlayın,
                hava durumu ve finansal verilerle günlük planlamalarınızı
                güncelleyin. Hepsi tek bir kullanıcı dostu platformda.
              </p>
            </div>

            <div>
              <button
                className="p-4 rounded-md text-sm font-medium border-none transition-all duration-300
               bg-[#26282b] text-white hover:bg-[#5c5d61]
               dark:bg-[#dfdcdc] dark:text-[#26282b] dark:hover:bg-[#5c5d61] dark:hover:text-[#dfdcdc]"
                type="button"
                onClick={() => router.push("/register")}
              >
                Dijital Ajandanızı Oluşturun
              </button>
            </div>
          </div>
        </section>

        {/* Image Section */}
        <section className="flex items-center justify-center lg:-mt-12">
          <div className="flex items-center justify-center w-full h-full">
            <img
              src={
                darkMode ? "/landing-img-light.png" : "/landing-img-dark.png"
              }
              alt="landing-img"
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="flex justify-center items-center mb-2">
        <p className="text-xs">© Copyright 2025 - Vita Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}
