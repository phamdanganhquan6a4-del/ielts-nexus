// app/api/vocabulary/add/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Groq from "groq-sdk"; // <-- Import Groq

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Đảm bảo đã có GROQ_API_KEY trong .env

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { word } = body;

    if (!word) return NextResponse.json({ error: "Thiếu từ vựng" }, { status: 400 });

    // --- BƯỚC QUAN TRỌNG: GỌI GROQ AI ĐỂ LẤY THÔNG TIN ---
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Analyze the English word: "${word}". 
          Return ONLY a JSON object (no markdown, no explanation) with this structure:
          {
            "definition": "short English definition",
            "meaning": "nghĩa tiếng Việt",
            "example": "an English example sentence",
            "level": "vocabulary level like A1, B2, C1...",
            "topic": "general topic"
          }`,
        },
      ],
      model: "llama-3.3-70b-versatile", // Hoặc model Groq bạn đang dùng
      temperature: 0.1, // Để kết quả JSON ổn định
    });

    // Lấy nội dung text từ AI và ép kiểu về JSON
    const aiContent = chatCompletion.choices[0]?.message?.content || "{}";
    const aiData = JSON.parse(aiContent.trim());

    // --- LƯU VÀO DATABASE ---
    const newVocab = await prisma.vocabulary.create({
      data: {
        word: word.trim(),
        definition: aiData.definition || "No definition available",
        meaning: aiData.meaning || "Chưa có nghĩa",
        example: aiData.example || "No example available",
        level: aiData.level || "Unknown",
        topic: aiData.topic || "General",
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, data: newVocab }, { status: 201 });

  } catch (error) {
    console.error("Groq AI Error:", error);
    return NextResponse.json({ error: "Lỗi khi AI phân tích dữ liệu" }, { status: 500 });
  }
}