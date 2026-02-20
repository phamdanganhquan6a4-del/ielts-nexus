import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const history = await prisma.result.findMany({
      orderBy: {
        createdAt: 'desc', // Bài mới nhất hiện lên đầu
      },
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi lấy dữ liệu lịch sử" }, { status: 500 });
  }
}