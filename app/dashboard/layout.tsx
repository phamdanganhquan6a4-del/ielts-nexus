import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar cố định bên trái */}
      <div className="hidden md:block w-64">
        <Sidebar />
      </div>

      {/* Nội dung chính bên phải */}
      <main className="flex-1 p-8 md:ml-64">
        {children}
      </main>
    </div>
  );
}