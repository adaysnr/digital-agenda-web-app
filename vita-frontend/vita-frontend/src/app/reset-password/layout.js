export default function ResetPasswordLayout({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F3F3F3]">
      <div className="relative bg-[#26282B] text-white rounded-lg p-8">
        <div className="relative flex items-center mb-12 mt-4">
          <h2 className="w-full text-center text-2xl font-semibold">
            Parola Sıfırlama
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
