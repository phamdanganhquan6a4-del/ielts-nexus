// app/api/save-result/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Đảm bảo đường dẫn này đúng

const prisma = new PrismaClient();

// 1. POST: Lưu điểm thi mới (Chỉ dành cho người đã đăng nhập)
export async function POST(req: Request) {
  try {
    // Kiểm tra session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Bạn cần đăng nhập để lưu kết quả" }, { status: 401 });
    }

    // Tìm User trong DB dựa trên email session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
    }

    const body = await req.json();
    const { skill, score, topic } = body;

    // Lưu vào DB kèm theo userId
    const result = await prisma.result.create({
      data: {
        skill,
        score: parseFloat(score),
        topic: topic || "General",
        userId: user.id // <--- Gán kết quả cho đúng chủ nhân
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Lỗi lưu điểm:", error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}

// 2. GET: Lấy lịch sử điểm của RIÊNG NGƯỜI ĐÓ để vẽ biểu đồ
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json([]);

    // CHỈ lấy kết quả của người dùng hiện tại
    const results = await prisma.result.findMany({
      where: {
        userId: user.id // <--- Lọc dữ liệu cá nhân
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Lỗi lấy điểm:", error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}