"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Logo from "../Logo/Logo";

export default function LogoutPage() {
  const router = useRouter();

  // Sayfa yüklendiğinde dark mode sınıfını kaldır
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");

    return () => {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center gap-44 px-0 sm:px-6 ">
      {/* Left Section */}
      <section className="pb-40">
        <img
          src="/vector-1.png"
          alt="Logout"
          className="w-64 h-68 mx-auto object-contain"
        />
      </section>

      {/* Middle Section */}
      <section className="flex items-center justify-center flex-col gap-4">
        {/* Logo Section */}
        <div className="mt-4 mb-12">
          <Logo />
        </div>

        {/* Main Section */}
        <div className="flex flex-col gap-2 mb-2">
          {/* Header Section */}
          <header className="text-4xl font-semibold text-center">
            Görüşmek üzere!
          </header>
          <p className="text-center">
            Bugün de harika işler başardın! Kendine bir kahve ısmarlamayı
            unutma.
          </p>
        </div>

        {/* Button Section */}
        <div className="flex gap-8">
          <button
            onClick={() => router.push("/login")}
            className="bg-[#26282b] text-white px-10 py-2 rounded-lg hover:bg-[#36373a] hover:text-[#e3dede] transition-colors"
          >
            Giriş Yap
          </button>
          <button
            onClick={() => router.push("/")}
            className="border-box border-2 border-[#26282b] text-[#26282b] px-8 py-2 rounded-lg hover:border-[#636468] hover:text-[#636468] transition-colors"
          >
            Ana Sayfa
          </button>
        </div>

        {/* Image Section */}
        <div>
          <img
            src="/logout-img.png"
            alt="Logout"
            className="w-60 h-60 md:w-96 md:h-96 mx-auto object-contain"
          />
        </div>

        {/* Footer Section */}
        <footer className="flex justify-center items-center mb-2">
          <p className="text-xs text-[#26282b]">
            © Copyright 2025 - Vita Tüm Hakları Saklıdır.
          </p>
        </footer>
      </section>

      {/* Right Section */}
      <section className="self-end mb-40">
        <img
          src="/vector-2.png"
          alt="Logout"
          className="w-52 h-48 mx-auto object-contain"
        />
      </section>
    </div>
  );
}
