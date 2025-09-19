"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "../Input/Input";
import NextButton from "../NextButton/NextButton";
import EmailSentPage from "../EmailSentPage/EmailSentPage";
import { useAuth } from "../../../context/AuthContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forgotPassword, error: authError } = useAuth();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      setStep(parseInt(stepParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!email || !email.includes("@")) {
      setError("Lütfen geçerli bir e-posta adresi giriniz.");
      setIsLoading(false);
      return;
    }    try {
      const result = await forgotPassword(email);

      if (result) {
        setMessage(
          "Parola sıfırlama bağlantısı e-posta adresinize gönderildi."
        );
        setStep(2);      } else {
        setError(authError || "Parola sıfırlama isteği gönderilemedi.");
      }
    } catch (err) {
      setError(`Bir hata oluştu: ${err.message || "Bilinmeyen hata"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {step === 1 ? (
        <div className="mx-10">
          <div className="flex">
            <p className="text-gray-300 mb-4 text-sm">
              Parola sıfırlama bağlantısı, kayıtlı e-posta adresinize <br />{" "}
              gönderilecektir.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-4">
            <Input
              text="E-Posta"
              type="email"
              placeholder="denizkonak@ornek.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              aria-invalid={!error}
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && (
              <p id="email-error" className="text-red-500 text-xs mt-1">
                {error}
              </p>
            )}{" "}
            <div className="flex justify-end mb-10">
              <NextButton onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "İşleniyor..." : "İleri"}
              </NextButton>{" "}
            </div>
          </form>
          <div className="flex items-center justify-center mr-4">
            <p className="text-[13px] text-gray-400 hover:text-gray-300">
              Parolanızı hatırladınız mı?
              <Link
                href="/login"
                className="ml-1 hover:font-bold text-gray-300 hover:underline"
              >
                Şimdi giriş yapın!
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <EmailSentPage onGoBack={() => setStep(1)} email={email} />
      )}
    </>
  );
}
