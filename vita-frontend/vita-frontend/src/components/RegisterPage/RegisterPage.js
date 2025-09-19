"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useAuth } from "../../../context/AuthContext";

import Logo from "../../components/Logo/Logo";
import Input from "../Input/Input";
import PasswordInput from "../Input/PasswordInput";
import SignInUpButton from "../SignInUpButton/SignInUpButton";
import BackButton from "../BackButton/BackButton";

export default function RegisterPage() {
  const router = useRouter();
  const { register, error: authError } = useAuth();

  const [nameUsername, setNameUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = !nameUsername || !email || !password || isLoading;

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

  // Email değiştiğinde hata mesajını sıfırla
  useEffect(() => {
    if (emailError) {
      setEmailError(false);
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError(false);
    setIsLoading(true);

    try {
      // Kullanıcı verilerini oluşturma
      const userData = {
        namesurname: nameUsername,
        email: email,
        password: password,
      };

      // useAuth hook'undaki register fonksiyonunu çağır
      const success = await register(userData);

      if (success) {
        router.push("/login");
      } else {
        // AuthContext'ten gelen hata mesajını kontrol et
        if (
          authError &&
          authError.toLowerCase().includes("email") &&
          authError.toLowerCase().includes("kullanımda")
        ) {
          setEmailError(true);
          setError(
            "Bu email adresi zaten kullanımda. Lütfen farklı bir email adresi deneyin."
          );
        } else if (
          authError &&
          authError.toLowerCase().includes("isim") &&
          authError.toLowerCase().includes("kullanımda")
        ) {
          setError(
            "Bu kullanıcı adı zaten kullanımda. Lütfen farklı bir isim deneyin."
          );
        } else {
          setError(
            authError ||
              "Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol ediniz."
          );
        }
      }
    } catch (err) {
      // Hata mesajını kontrol et
      if (
        err.message &&
        err.message.toLowerCase().includes("email") &&
        err.message.toLowerCase().includes("kullanımda")
      ) {
        setEmailError(true);
        setError(
          "Bu email adresi zaten kullanımda. Lütfen farklı bir email adresi deneyin."
        );
      } else {
        setError(
          "Kayıt sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
      {/* Left Section - Register Form */}
      <section className="login-register flex flex-col items-center justify-center h-screen">
        {/* Mobile Logo Only */}
        <div className="block md:hidden mb-20 -mt-12">
          <Logo className="!text-[#26282b] dark:!text-[#26282b]" />
        </div>

        {/* Web Back Button Only */}
        <div className="absolute top-8 left-6">
          <BackButton onClick={() => router.push("/")} />
        </div>

        {/* Register Header */}
        <header className="mb-16">
          <h1 className="text-4xl">Kayıt Ol</h1>
        </header>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {" "}
          {/* Name-Username Input */}
          <Input
            text="Ad Soyad"
            type="text"
            placeholder="Örneğin: Deniz Konak"
            required
            value={nameUsername}
            onChange={(e) => setNameUsername(e.target.value)}
            className="w-full md:w-96"
          />
          {/* Email Input */}
          <div className="w-full">
            <Input
              text="E-Posta"
              type="email"
              placeholder="Örneğin: denizkonak@ornek.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={
                emailError ? "border-red-500 w-full md:w-96" : "w-full md:w-96"
              }
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">
                Bu email adresi zaten kullanımda.
              </p>
            )}
          </div>
          {/* Password Input */}
          <PasswordInput
            text="Parola"
            type="password"
            placeholder="************"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          {/* Register Button */}
          <SignInUpButton
            disabled={isDisabled}
            className={clsx(
              "transition-all duration-300 mt-8",
              isDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#434548] hover:shadow-lg"
            )}
          >
            {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
          </SignInUpButton>
        </form>

        {/* Login Link */}
        <div className="flex items-center justify-center text-sm mt-20 -mb-12">
          <p>
            Hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline transition-all duration-300"
            >
              Şimdi giriş yapın!
            </Link>
          </p>
        </div>
      </section>

      {/* Right Section - Brand */}
      <section className="hidden md:flex flex-col items-center justify-center gap-10 bg-color">
        {/* Logo */}
        <div className="mt-6 ml-10">
          <Logo className="!text-white" />
        </div>

        {/* Image */}
        <div className="max-w-lg ">
          <img
            src="register-img.png"
            alt="register"
            className="object-cover max-w-[90%] h-auto max-h-[70vh] mx-auto"
          />

          {/* Message */}
          <div className="w-full px-4 sm:px-8 mt-4">
            <p className="text-white">
              <i>
                Vita ile günlük hayatınızı kolaylaştırın ve her şeyi tek bir
                yerden yönetin - şimdi kaydolun!
              </i>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
