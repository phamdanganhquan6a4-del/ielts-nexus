"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Zap, BrainCircuit, Globe } from "lucide-react";
import Link from "next/link";
// Bạn có thể cài framer-motion để các hiệu ứng hover mượt hơn: npm install framer-motion
import { motion } from "framer-motion"; 

export default function LandingPage() {
  // Hàm cuộn trang mượt mà đến phần tính năng
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 overflow-hidden font-sans">
      {/* Background Glow Effect - Tạo chiều sâu cho trang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">IELTS NEXUS</span>
        </div>
        <Link href="/api/auth/signin">
          <Button variant="ghost" className="text-slate-400 hover:text-white font-bold hover:bg-slate-800/50 rounded-xl">
            Đăng nhập
          </Button>
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        {/* Badge AI - Gây ấn tượng công nghệ */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-10 animate-pulse">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
            AI-Powered Learning Platform
          </span>
        </div>

        {/* Title với Gradient đặc sắc */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[1.1]">
          Chinh phục IELTS <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            Bằng Trí Tuệ Nhân Tạo
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          Nền tảng luyện thi thông minh tích hợp <span className="text-blue-400 font-bold">Groq Llama 3</span> giúp cá nhân hóa lộ trình, 
          xây dựng kho từ vựng và phân tích năng lực chuẩn xác.
        </p>

        {/* Call to action Group */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white h-16 px-10 rounded-2xl font-black text-lg shadow-[0_20px_50px_rgba(37,99,235,0.3)] group transition-all active:scale-95">
              Truy cập Dashboard 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          {/* Nút Xem tính năng đã được kích hoạt chức năng Scroll */}
          <Button 
            variant="outline" 
            onClick={scrollToFeatures}
            className="h-16 px-10 rounded-2xl font-bold border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white text-slate-300 transition-all active:scale-95"
          >
            Xem tính năng
          </Button>
        </div>

        {/* Features Bento Grid - Phần này sẽ được cuộn tới */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 text-left relative">
          {/* Một quầng sáng nhẹ dưới nền grid */}
          <div className="absolute inset-0 bg-blue-500/5 blur-[100px] pointer-events-none" />
          
          {/* Card 1: AI Speed */}
          <div className="group p-10 rounded-[40px] bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-500">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Zap className="text-blue-400 w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Groq AI Speed</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Sức mạnh từ mô hình <span className="text-slate-300">Llama 3.3-70b</span>. Phân tích từ vựng, gợi ý ví dụ và phản hồi kết quả thi chỉ trong mili giây.
            </p>
          </div>

          {/* Card 2: Security */}
          <div className="group p-10 rounded-[40px] bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-500">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-emerald-400 w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Private & Secure</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Dữ liệu cá nhân hóa. Kho từ vựng và lịch sử luyện tập được bảo mật tuyệt đối, thuộc quyền sở hữu duy nhất của bạn.
            </p>
          </div>

          {/* Card 3: Analytics */}
          <div className="group p-10 rounded-[40px] bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-500">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Globe className="text-purple-400 w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Smart Analytics</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Theo dõi sự tiến bộ qua <span className="text-slate-300">Biểu đồ Radar</span>. Phân tích điểm mạnh, điểm yếu 4 kỹ năng theo tiêu chuẩn IELTS.
            </p>
          </div>
        </div>
      </main>

      {/* Footer subtle decoration */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-600 text-sm font-bold">© 2026 IELTS NEXUS. All rights reserved.</p>
        <div className="flex gap-8 text-slate-500 text-sm font-bold">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-white cursor-pointer transition-colors">Github</span>
        </div>
      </footer>
    </div>
  );
}