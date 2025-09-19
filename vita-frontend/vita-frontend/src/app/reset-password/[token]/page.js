"use client";

import dynamic from "next/dynamic";
import { use } from "react";

// Client bileşenini dinamik olarak yükle
const ResetPasswordPage = dynamic(
  () => import("@/components/ResetPasswordPage/ResetPasswordPage"),
  { ssr: false, loading: () => <p>Yükleniyor...</p> }
);

export default function TokenResetPage({ params }) {
  // URL segment'inden token'ı alıyoruz ve React.use() ile Promise'i çözümlüyoruz
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  return <ResetPasswordPage verificationToken={token} />;
}
