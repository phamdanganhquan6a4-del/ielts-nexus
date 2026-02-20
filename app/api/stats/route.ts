// app/api/stats/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. KIỂM TRA ĐĂNG NHẬP
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tìm User ID từ Email session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. CHỈ LẤY DỮ LIỆU CỦA NGƯỜI DÙNG HIỆN TẠI
    const myResults = await prisma.result.findMany({
      where: {
        userId: user.id // <--- CỰC KỲ QUAN TRỌNG: Lọc theo chủ sở hữu
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`🔍 TỔNG SỐ BẢN GHI CỦA ${user.name}:`, myResults.length);

    // 3. GOM NHÓM VÀ TÍNH TOÁN (Giữ nguyên logic của bạn nhưng dùng myResults)
    const skillsMap: Record<string, { total: number; count: number }> = {
      reading: { total: 0, count: 0 },
      listening: { total: 0, count: 0 },
      writing: { total: 0, count: 0 },
      speaking: { total: 0, count: 0 },
    };

    myResults.forEach((r) => {
      const skillKey = r.skill ? r.skill.toLowerCase().trim() : "";
      if (skillsMap[skillKey]) {
        skillsMap[skillKey].total += r.score;
        skillsMap[skillKey].count += 1;
      }
    });

    const calcAvg = (key: string) => {
      const data = skillsMap[key];
      if (data.count === 0) return 0;
      return parseFloat((data.total / data.count).toFixed(1));
    };

    const radarData = [
      { subject: 'Reading', A: calcAvg('reading'), fullMark: 9 },
      { subject: 'Listening', A: calcAvg('listening'), fullMark: 9 },
      { subject: 'Speaking', A: calcAvg('speaking'), fullMark: 9 },
      { subject: 'Writing', A: calcAvg('writing'), fullMark: 9 },
      // Bạn có thể giữ điểm giả định hoặc tính từ logic khác
      { subject: 'Vocab', A: 5.0, fullMark: 9 }, 
      { subject: 'Grammar', A: 5.0, fullMark: 9 },
    ];

    // 4. TÍNH OVERALL THEO CHUẨN IELTS (Chia 4)
    const totalScore = radarData.slice(0, 4).reduce((acc, curr) => acc + curr.A, 0);
    const overall = (totalScore / 4).toFixed(1);

    return NextResponse.json({
      radarData,
      overall
    });

  } catch (error) {
    console.error("❌ Stats Error:", error);
    return NextResponse.json({ error: "Lỗi Server khi lấy thống kê" }, { status: 500 });
  }
}