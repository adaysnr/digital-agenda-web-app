"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextButton from "../NextButton/NextButton";
import Link from "next/link";

export default function EmailSentPage({ onGoBack, email }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoToLogin = () => {
    setIsLoading(true);
    router.push("/login");
  };

  return (
    <>
      <div className="absolute top-8 left-8">
        <button className="text-white" onClick={onGoBack}>
          <span className="material-icons-round" style={{ fontSize: "20px" }}>
            arrow_back
          </span>
        </button>
      </div>
      <div className="mx-8 text-center">
        <div className="mb-8 flex justify-center">
          <span
            className="material-icons-round text-green-500"
            style={{ fontSize: "64px" }}
          >
            check_circle
          </span>
        </div>

        <h2 className="text-xl font-semibold mb-4">E-posta Gönderildi</h2>

        <p className="mb-6">
          <strong>{email}</strong> adresine parola sıfırlama talimatları içeren
          bir e-posta gönderdik.
        </p>

        <p className="text-sm text-gray-400 mb-8">
          Lütfen gelen kutunuzu kontrol edin ve e-postadaki talimatları izleyin.
          E-posta birkaç dakika içinde gelmezse, spam klasörünü kontrol edin.
        </p>

        <div className="flex flex-col items-center gap-4">
          <NextButton onClick={handleGoToLogin} disabled={isLoading}>
            {isLoading ? "Yönlendiriliyor..." : "Giriş Sayfasına Dön"}
          </NextButton>

          <button
            onClick={onGoBack}
            className="text-sm text-gray-400 hover:text-gray-300 underline"
          >
            Farklı bir e-posta adresi kullan
          </button>
        </div>
      </div>
    </>
  );
}
