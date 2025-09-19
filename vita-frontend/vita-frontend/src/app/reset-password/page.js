import ResetPasswordPage from "@/components/ResetPasswordPage/ResetPasswordPage";
import Link from "next/link";

export default function Page({ searchParams }) {
  const token = searchParams?.token;

  // Token yoksa hata mesajı göster
  if (!token) {
    return (
      <div className="text-center mx-6">
        <div className="mb-6">
          <span
            className="material-icons-round text-red-500"
            style={{ fontSize: "64px" }}
          >
            error_outline
          </span>
        </div>
        <h2 className="text-xl font-semibold mb-4">Geçersiz Bağlantı</h2>
        <p className="mb-6 text-gray-300">
          Geçersiz veya eksik token. Lütfen geçerli bir parola sıfırlama
          bağlantısı kullanın.
        </p>
        <Link href="/forgotPassword">
          <div className="text-sm text-gray-400 hover:text-gray-300 underline mt-4">
            Şifremi Unuttum sayfasına geri dön
          </div>
        </Link>
      </div>
    );
  }

  return <ResetPasswordPage verificationToken={token} />;
}
