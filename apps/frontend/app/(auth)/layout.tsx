export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary font-arabic">
            Quran Academy
          </h1>
          <p className="text-slate-600 mt-2">
            Learn Quran with expert teachers
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
