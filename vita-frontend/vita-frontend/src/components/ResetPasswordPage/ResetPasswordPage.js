"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextButton from "../NextButton/NextButton";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import PasswordInput from "../Input/PasswordInput";

export default function ResetPasswordPage({ verificationToken }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState(verificationToken || "");

  // URL'den token parametresini almak için
  useEffect(() => {
    if (!verificationToken) {
      const urlToken = searchParams.get("token");
      if (urlToken) {
        setToken(urlToken);
      }
    }
  }, [searchParams, verificationToken]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Parola en az 8 karakter olmalıdır.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Parola en az bir büyük harf içermelidir.";
    }

    if (!/[a-z]/.test(password)) {
      return "Parola en az bir küçük harf içermelidir.";
    }

    if (!/[0-9]/.test(password)) {
      return "Parola en az bir rakam içermelidir.";
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Parola en az bir özel karakter içermelidir.";
    }

    return null;
  };
  const handleResetPassword = async () => {
    // Reset error states
    setError("");

    if (!token) {
      setError(
        "Doğrulama kodu eksik veya geçersiz. Lütfen şifre sıfırlama sürecini tekrar başlatın."
      );
      return;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Parolalar eşleşmiyor.");
      return;
    }
    setIsLoading(true);

    try {
      const result = await resetPassword(token, password);

      if (result) {
        setIsSuccess(true);
        // Redirect to login page after successful password reset
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(
          "Parola sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin."
        );
      }
    } catch (err) {
      setError(`Bir hata oluştu: ${err.message || "Bilinmeyen hata"}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {isSuccess ? (
        <div className="text-center mx-6">
          <div className="mb-6">
            <span
              className="material-icons-round text-green-500"
              style={{ fontSize: "64px" }}
            >
              check_circle
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-4">
            Şifreniz Başarıyla Güncellendi!
          </h2>
          <p className="mb-6 text-gray-300">
            Şimdi giriş sayfasına yönlendiriliyorsunuz...
          </p>

          <Link href="/login">
            <div className="text-sm text-gray-400 hover:text-gray-300 underline mt-4">
              Giriş sayfasına dönmek için tıklayın
            </div>
          </Link>
        </div>
      ) : (
        <div className="mx-6">
          {" "}
          <div className="flex">
            <p className="text-gray-300 mb-4 text-sm">
              Lütfen yeni parolanızı giriniz ve parolanızı tekrar girerek
              onaylayınız.
            </p>
          </div>
          {/* Reset Password Form - özel stiller */}
          <div className="password-reset-form w-full">
            <style jsx global>{`
              .password-reset-form .input-box {
                width: 100% !important;
              }
            `}</style>

            <div className="mb-4">
              {" "}
              <PasswordInput
                text="Yeni Parola"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <PasswordInput
                text="Parola Tekrar"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex justify-end mb-10 mt-6">
            <NextButton onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? "İşleniyor..." : "Parolayı Sıfırla"}
            </NextButton>
          </div>
          <div className="border-t border-gray-700 pt-4 mt-2">
            <p className="text-xs text-gray-400 text-center">
              Parola en az 8 karakter, büyük harf, küçük harf, rakam ve özel
              karakter içermelidir.
            </p>
          </div>
          <div className="flex items-center justify-center mt-6">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-gray-300 hover:underline"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
