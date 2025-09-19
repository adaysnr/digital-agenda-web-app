"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
const { useAuth } = require("../../../context/AuthContext");

import Logo from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import PasswordInput from "../Input/PasswordInput";
import SignInUpButton from "../../components/SignInUpButton/SignInUpButton";
import BackButton from "../BackButton/BackButton";

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = !email || !password || isLoading;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/home");
      } else {
        // AuthContext'ten gelen hata mesajını göster
        setError(
          authError ||
            "Giriş sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol ediniz."
        );
      }
    } catch (err) {
      const errorMessage =
        err.message ||
        "Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
      {/* Left Section - Brand */}
      <section className="hidden md:flex flex-col items-center justify-center gap-14 bg-color">
        {/* Logo */}
        <div className="mt-6 mr-10">
          <Logo className="!text-white" />
        </div>

        {/* Image */}
        <div className="max-w-lg mr-12">
          <img
            src="login-img.png"
            alt="login"
            className="object-cover max-w-[90%] h-auto max-h-[70vh] mx-auto"
          />

          {/* Message */}
          <div className="w-full px-4 sm:px-8 mt-4">
            <p className="text-white">
              <i>
                Vita ile planlarınızı yönetmeye kaldığınız yerden devam edin.
              </i>
            </p>
          </div>
        </div>
      </section>

      {/* Right Section - Login Form*/}
      <section className="login-register flex flex-col items-center justify-center h-screen relative">
        {/* Mobile Logo Only */}
        <div className="block md:hidden mb-20 -mt-12">
          <Logo className="!text-[#26282b] dark:!text-[#26282b]" />
        </div>

        {/* Web Back Button Only */}
        <div className="absolute top-8 left-6">
          <BackButton onClick={() => router.push("/")} />
        </div>

        {/* Login Header */}
        <header className="mb-16">
          <h1 className="text-4xl">Giriş Yap</h1>
        </header>

        {/* Login Form*/}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {" "}
          {/* Email Input */}
          <Input
            text="E-Posta"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full md:w-96"
          />
          {/* Password Input */}
          <PasswordInput
            text="Parola"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full md:w-96"
          />
          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {/* Forgot Password Link */}
          <div className="flex flex-col items-end -mt-2 text-xs">
            <Link
              href="/forgotPassword"
              className="hover:underline transition-all duration-100"
            >
              Parolamı Unuttum!
            </Link>
          </div>
          {/* Submit Button */}
          <SignInUpButton
            disabled={isDisabled}
            className={clsx(
              "transition-all duration-300",
              isDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#434548] hover:shadow-lg"
            )}
          >
            {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </SignInUpButton>
        </form>

        {/* Register Link */}
        <div className="flex items-center justify-center text-sm mt-20 -mb-12">
          <p>
            Hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline transition-all duration-300"
            >
              Şimdi kaydolun!
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
