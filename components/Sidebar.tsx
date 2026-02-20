"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react"; // <-- Import các hàm của NextAuth
import { 
  LayoutDashboard, 
  Mic, 
  Headphones, 
  BookOpen, 
  PenTool, 
  LogOut, 
  History,
  LogIn // Import thêm icon LogIn cho nút đăng nhập
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Phân chia menu thành các nhóm
const practiceItems = [
  { name: "Tổng quan", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Listening", icon: Headphones, href: "/dashboard/listening" },
  { name: "Reading", icon: BookOpen, href: "/dashboard/reading" },
  { name: "Writing", icon: PenTool, href: "/dashboard/writing" },
  { name: "Speaking", icon: Mic, href: "/dashboard/speaking" },
];

const dataItems = [
  { name: "Lịch sử luyện tập", icon: History, href: "/dashboard/history" },
];

export function Sidebar() {
  const pathname = usePathname();
  
  // Lấy dữ liệu đăng nhập từ NextAuth
  const { data: session, status } = useSession();

  return (
    <div className="h-screen w-64 bg-white border-r flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">I</div>
          IELTS Nexus
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-6">
        {/* Nhóm Luyện Tập */}
        <div>
          <p className="text-[10px] font-black text-slate-400 mb-2 px-2 uppercase tracking-widest">Luyện tập</p>
          <div className="space-y-1">
            {practiceItems.map((item) => (
              <MenuLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>

        {/* Nhóm Dữ Liệu */}
        <div>
          <p className="text-[10px] font-black text-slate-400 mb-2 px-2 uppercase tracking-widest">Dữ liệu</p>
          <div className="space-y-1">
            {dataItems.map((item) => (
              <MenuLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>
      </nav>

      {/* --- PHẦN TÀI KHOẢN (Đã tích hợp NextAuth) --- */}
      <div className="p-4 border-t mt-auto bg-slate-50/50 min-h-[120px] flex flex-col justify-center">
        {status === "loading" ? (
          // Trạng thái đang tải dữ liệu
          <div className="text-center text-sm font-medium text-slate-400 animate-pulse">
            Đang tải dữ liệu...
          </div>
        ) : session ? (
          // Trạng thái ĐÃ ĐĂNG NHẬP
          <>
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="border-2 border-white shadow-sm">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{session.user?.name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase truncate" title={session.user?.email || "Free Plan"}>
                  {session.user?.email || "Free Plan"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => signOut()} 
              className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full transition-all font-semibold text-sm group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Đăng xuất</span>
            </button>
          </>
        ) : (
          // Trạng thái CHƯA ĐĂNG NHẬP
          <button 
            onClick={() => signIn("google")} 
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full transition-all shadow-md shadow-blue-200 font-bold text-sm hover:-translate-y-0.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập Google</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Component con giữ nguyên
function MenuLink({ item, isActive }: { item: any; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
        isActive
          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
      <span>{item.name}</span>
    </Link>
  );
}