import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // <-- Thêm import này

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IELTS Nexus", // Sửa tên web ở tab trình duyệt
  description: "Nền tảng luyện thi IELTS thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Bọc AuthProvider quanh ứng dụng */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}