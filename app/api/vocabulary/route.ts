import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next"; // <-- Import để lấy thông tin đăng nhập

export const dynamic = 'force-dynamic'; 
const prisma = new PrismaClient();

// 1. LẤY DANH SÁCH TỪ VỰNG CỦA RIÊNG USER
export async function GET() {
  try {
    // Lấy phiên đăng nhập hiện tại
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    // Tìm user trong database dựa vào email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    // CHỈ LẤY những từ vựng có userId trùng với user đang đăng nhập
    const vocabList = await prisma.vocabulary.findMany({
      where: {
        userId: user.id 
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50
    });

    return NextResponse.json(vocabList);
  } catch (error) {
    console.error("Get Vocab Error:", error);
    return NextResponse.json({ error: "Lỗi lấy danh sách từ vựng" }, { status: 500 });
  }
}

// 2. XÓA TỪ VỰNG CỦA RIÊNG USER
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });

    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Thiếu ID từ vựng cần xóa" }, { status: 400 });

    // Dùng deleteMany để đảm bảo chỉ xóa đúng ID đó VÀ nó phải thuộc về user này
    await prisma.vocabulary.deleteMany({
      where: {
        id: id,
        userId: user.id, // Chặn trường hợp user khác truyền bừa ID vào để xóa trộm
      },
    });

    return NextResponse.json({ success: true, message: "Đã xóa từ vựng thành công" }, { status: 200 });

  } catch (error) {
    console.error("Delete Vocab Error:", error);
    return NextResponse.json({ error: "Lỗi server khi xóa từ vựng" }, { status: 500 });
  }
}