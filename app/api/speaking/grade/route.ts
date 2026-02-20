import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth"; // THÊM DÒNG NÀY
import { authOptions } from "../../auth/[...nextauth]/route";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // THÊM DÒNG NÀY ĐỂ LẤY SESSION
    const session = await getServerSession(authOptions);

    const { topic, transcript } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert IELTS Speaking Examiner. 
          Analyze the transcript and provide a detailed band score evaluation.
          You MUST return a JSON object with this exact structure:
          {
            "overall_score": number (0-9, increments of 0.5),
            "fluency": number,
            "lexical": number,
            "grammar": number,
            "pronunciation": number,
            "feedback": "string (brief constructive advice)"
          }`
        },
        {
          role: "user",
          content: `Topic: ${topic}\n\nFull Interview Transcript:\n${transcript}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const report = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // LƯU VÀO DATABASE ĐỂ CẬP NHẬT BIỂU ĐỒ RADAR
    const saved = await prisma.result.create({
      data: {
        skill: 'speaking', 
        score: report.overall_score,
        topic: topic || "IELTS Speaking Practice",
        // SỬA ĐOẠN NÀY ĐỂ DÙNG BIẾN SESSION ĐÃ LẤY Ở TRÊN
        user: {
          connect: { email: session?.user?.email || "" } 
        }
      },
    });

    return NextResponse.json({ ...report, id: saved.id });
  } catch (error) {
    console.error("Grade Error:", error);
    return NextResponse.json({ error: "Lỗi chấm điểm" }, { status: 500 });
  }
}